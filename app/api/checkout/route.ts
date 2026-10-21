import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

interface CheckoutItem {
  id: string
  qty: number
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, address, city, notes, items } = body as {
      name: string
      email: string
      phone: string
      address: string
      city: string
      notes?: string
      items: CheckoutItem[]
    }

    if (
      !name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !address?.trim() ||
      !city?.trim() ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 })
    }

    // 1. Load current products from the database (never trust browser prices)
    const ids = items.map((i) => i.id)
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, price, stock')
      .in('id', ids)

    if (productsError) throw productsError

    // 2. Check stock and calculate the total
    let total = 0
    for (const item of items) {
      const product = products?.find((p) => p.id === item.id)
      if (!product) {
        return NextResponse.json({ error: 'A product is no longer available.' }, { status: 400 })
      }
      if (item.qty < 1 || product.stock < item.qty) {
        return NextResponse.json(
          { error: `Only ${product.stock} of "${product.name}" left in stock.` },
          { status: 400 }
        )
      }
      total += Number(product.price) * item.qty
    }

    // 3. Create the order with delivery details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          customer_name: name.trim(),
          customer_email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          notes: notes?.trim() || null,
          status: 'pending',
          total_price: total,
        },
      ])
      .select()
      .single()

    if (orderError) throw orderError

    // 4. Create order items, reduce stock, and log each change
    for (const item of items) {
      const product = products!.find((p) => p.id === item.id)!

      const { error: itemError } = await supabaseAdmin.from('order_items').insert([
        {
          order_id: order.id,
          product_id: item.id,
          quantity: item.qty,
          price: Number(product.price),
        },
      ])
      if (itemError) throw itemError

      const { error: stockError } = await supabaseAdmin
        .from('products')
        .update({ stock: product.stock - item.qty })
        .eq('id', item.id)
      if (stockError) throw stockError

      const { error: logError } = await supabaseAdmin.from('inventory_logs').insert([
        {
          product_id: item.id,
          quantity_change: -item.qty,
          reason: `Order ${order.id.slice(0, 8)}`,
        },
      ])
      if (logError) throw logError
    }

    return NextResponse.json({ orderId: order.id })
  } catch (err) {
    console.error('Checkout failed:', err)
    return NextResponse.json({ error: 'Could not place order. Please try again.' }, { status: 500 })
  }
}