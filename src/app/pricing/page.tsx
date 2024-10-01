'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Pricing Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {['Basic', 'Pro', 'Enterprise'].map((plan) => (
          <Card key={plan}>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">{plan}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-4xl font-bold mb-4">
                {plan === 'Basic' ? '$9.99' : plan === 'Pro' ? '$19.99' : 'Custom'}
                {plan !== 'Enterprise' && <span className="text-sm font-normal">/month</span>}
              </p>
              <ul className="mb-6 text-left">
                <li className="mb-2">✓ Feature 1</li>
                <li className="mb-2">✓ Feature 2</li>
                <li className="mb-2">✓ Feature 3</li>
                {plan !== 'Basic' && <li className="mb-2">✓ Advanced Feature</li>}
                {plan === 'Enterprise' && <li>✓ Custom Solutions</li>}
              </ul>
              <Button className="w-full">
                {plan === 'Enterprise' ? 'Contact Us' : 'Get Started'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}