"use client"

import { useState } from "react"
import { Smartphone, Home, Shirt, Sparkles, Dumbbell, BookOpen, Gamepad2, Car, Package } from "lucide-react"

const iconMap: Record<string, React.ElementType> = {
  Smartphone,
  Home,
  Shirt,
  Sparkles,
  Dumbbell,
  BookOpen,
  Gamepad2,
  Car,
  Package,
}

interface CategoryIconProps {
  imageUrl?: string
  iconName?: string
  name: string
  className?: string
}

export function CategoryIcon({ imageUrl, iconName, name, className = "h-6 w-6" }: CategoryIconProps) {
  const [imageError, setImageError] = useState(false)
  const Icon = iconMap[iconName || ""] || Package
  const hasValidImageUrl = imageUrl && imageUrl.trim().length > 0 && !imageError

  if (hasValidImageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${className} object-contain`}
        onError={() => setImageError(true)}
        crossOrigin="anonymous"
      />
    )
  }

  return <Icon className={`${className} text-primary`} />
}
