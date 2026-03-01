"use client"

import { useState } from "react"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ProductWithRelations } from "@/lib/db"

interface ProductGalleryProps {
  product: ProductWithRelations
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  // Obter imagens (compativel com string ou array)
  const getImages = (): string[] => {
    if (Array.isArray(product.imageUrl)) {
      return product.imageUrl.filter(img => img && img.trim() !== "")
    }
    if (typeof product.imageUrl === "string" && product.imageUrl) {
      return [product.imageUrl]
    }
    // Fallback para product.images se existir
    if (Array.isArray(product.images)) {
      return product.images.filter(img => img && img.trim() !== "")
    }
    return []
  }
  
  const images = getImages()
  const hasImages = images.length > 0
  const hasMultipleImages = images.length > 1

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary">
        {hasImages ? (
          <>
            <img
              src={images[activeIndex]}
              alt={`${product.name} - Imagem ${activeIndex + 1}`}
              className="h-full w-full object-cover"
            />
            {/* Navigation Arrows */}
            {hasMultipleImages && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
                  onClick={goToPrevious}
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
                  onClick={goToNext}
                  aria-label="Proxima imagem"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                {/* Image Counter */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  {activeIndex + 1} / {images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-primary/10">
              <Star className="h-16 w-16 text-primary/30" />
            </div>
          </div>
        )}
        {product.discount && (
          <div className="absolute left-4 top-4 rounded-lg bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
            -{product.discount}%
          </div>
        )}
      </div>

      {/* Thumbnails - only show if multiple images */}
      {hasMultipleImages && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                activeIndex === index
                  ? "border-primary shadow-md"
                  : "border-border hover:border-primary/30"
              }`}
              aria-label={`Ver imagem ${index + 1}`}
            >
              <img
                src={img}
                alt={`${product.name} - Miniatura ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
