"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import type { ProductWithRelations } from "@/lib/db"

interface ProductGalleryProps {
  product: ProductWithRelations
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary">
        <div className="flex h-full items-center justify-center">
          <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-primary/10">
            <Star className="h-16 w-16 text-primary/30" />
          </div>
        </div>
        {product.discount && (
          <div className="absolute left-4 top-4 rounded-lg bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
            -{product.discount}%
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3">
        {product.images.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`relative aspect-square w-20 overflow-hidden rounded-lg border-2 transition-all ${
              activeIndex === index
                ? "border-primary shadow-md"
                : "border-border hover:border-primary/30"
            }`}
            aria-label={`Ver imagem ${index + 1}`}
          >
            <div className="flex h-full items-center justify-center bg-secondary">
              <Star className="h-6 w-6 text-primary/20" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
