export interface CartItem {
  id: string
  name: string
  price: number
  qty: number
}

const CART_KEY = 'cart'

export function getCart(): CartItem[] {
  // Guard: localStorage doesn't exist on the server
  if (typeof window === 'undefined') return []

  try {
    const saved = localStorage.getItem(CART_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  // Tell other components on the page that the cart changed
  window.dispatchEvent(new Event('cart-updated'))
}

// Returns false if the product is already at its stock limit
export function addToCart(
  product: { id: string; name: string; price: number },
  stock: number
): boolean {
  const cart = getCart()
  const existing = cart.find((item) => item.id === product.id)
  const currentQty = existing ? existing.qty : 0

  if (currentQty >= stock) return false

  if (existing) {
    existing.qty += 1
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 })
  }

  saveCart(cart)
  return true
}

export function updateQuantity(id: string, qty: number) {
  const cart = getCart()
  const item = cart.find((i) => i.id === id)
  if (!item) return

  if (qty <= 0) {
    saveCart(cart.filter((i) => i.id !== id))
  } else {
    item.qty = qty
    saveCart(cart)
  }
}

export function removeFromCart(id: string) {
  saveCart(getCart().filter((i) => i.id !== id))
}

export function clearCart() {
  saveCart([])
}