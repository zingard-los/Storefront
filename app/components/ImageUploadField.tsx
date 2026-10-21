'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface ImageUploadFieldProps {
  value: string
  onChange: (url: string) => void
}

export default function ImageUploadField({ value, onChange }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB.')
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file, { cacheControl: '3600' })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      onChange(data.publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <label className="block text-sm font-semibold mb-2">Product Image</label>

      {value && (
        <div className="mb-3 relative">
          <img
            src={value}
            alt="Product preview"
            className="w-full h-40 object-cover rounded-lg border border-gray-600"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 px-2 py-1 bg-black/70 hover:bg-black text-white text-xs rounded"
          >
            Remove
          </button>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={uploading}
        className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
      />

      {uploading && <p className="text-sm text-gray-400 mt-2">Uploading...</p>}
      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
    </div>
  )
}