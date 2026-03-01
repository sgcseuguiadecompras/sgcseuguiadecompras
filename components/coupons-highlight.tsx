import Link from "next/link"
import { Tag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabaseCouponRepository } from "@/lib/supabase/coupons"
import { CouponCard } from "@/components/coupon-card"

export async function CouponsHighlight() {
  const coupons = await supabaseCouponRepository.getActiveCoupons(3)

  return (
    <section className="bg-secondary/30 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tag className="h-6 w-6 text-primary" />
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Cupons Ativos
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Economize com cupons verificados
              </p>
            </div>
          </div>
          <Button asChild variant="ghost" className="hidden gap-1 sm:inline-flex">
            <Link href="/cupons">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Button asChild variant="outline" className="gap-1">
            <Link href="/cupons">
              Ver todos os cupons
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
