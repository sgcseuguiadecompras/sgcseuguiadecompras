import { HeroSection } from "@/components/hero-section"
import { CategoryGrid } from "@/components/category-grid"
import { AllProducts } from "@/components/all-products"
import { CouponsHighlight } from "@/components/coupons-highlight"
import { FeedbackSection } from "@/components/feedback-section"

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SGC - Seu Guia de Compras",
  url: "https://seuguiadecompras.com.br",
  description: "Compre melhor, pague menos e evite golpes. Seu guia inteligente de compras online.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://seuguiadecompras.com.br/busca?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <CategoryGrid />
      <AllProducts />
      <CouponsHighlight />
      <FeedbackSection />
    </>
  )
}
