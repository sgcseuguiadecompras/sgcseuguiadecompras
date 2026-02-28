import { Star, Users, ShieldCheck, TrendingUp } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: "50.000+",
    label: "Usuarios confiam no SGC",
  },
  {
    icon: Star,
    value: "12.000+",
    label: "Avaliacoes verificadas",
  },
  {
    icon: ShieldCheck,
    value: "99.2%",
    label: "Links validados",
  },
  {
    icon: TrendingUp,
    value: "R$ 2M+",
    label: "Economizados pelos usuarios",
  },
]

export function SocialProof() {
  return (
    <section className="bg-primary py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <Icon className="mb-2 h-6 w-6 text-primary-foreground/80" />
                <span className="text-2xl font-bold text-primary-foreground md:text-3xl">
                  {stat.value}
                </span>
                <span className="mt-1 text-xs text-primary-foreground/70 md:text-sm">
                  {stat.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
