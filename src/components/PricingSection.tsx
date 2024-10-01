import { Card } from "@/components/ui/card"

const plans = [
  { name: 'Basic', price: '$9.99', features: ['AI Image Helper', 'Limited transcriptions', 'Basic voice assistant'] },
  { name: 'Pro', price: '$19.99', features: ['Everything in Basic', 'Unlimited transcriptions', 'Advanced voice assistant', 'Priority support'] },
  { name: 'Enterprise', price: 'Custom', features: ['Everything in Pro', 'Custom integrations', 'Dedicated account manager', 'SLA guarantee'] },
]

export function PricingSection() {
  return (
    <section className="my-16">
      <h2 className="text-3xl font-bold text-center mb-8">Pricing Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.name === 'Pro' ? 'border-primary' : ''}>
            {/* Card content */}
          </Card>
        ))}
      </div>
    </section>
  )
}