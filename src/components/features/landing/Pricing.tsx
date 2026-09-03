import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-background">
      <PageContainer>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">Transparent Pricing</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the plan that fits your travel style. Upgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <Card className="flex flex-col border-border/40 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Explorer</CardTitle>
              <div className="mt-4 flex items-baseline text-4xl font-extrabold font-heading">
                <IndianRupee className="w-8 h-8 -mr-1" />
                0
                <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "Basic itinerary builder",
                  "Up to 3 active trips",
                  "Community recommendations",
                  "Standard email support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Premium Tier */}
          <Card className="flex flex-col border-primary bg-surface shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-semibold rounded-bl-xl uppercase tracking-wider">
              Most Popular
            </div>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary">Safarn Pro</CardTitle>
              <div className="mt-4 flex items-baseline text-4xl font-extrabold font-heading text-primary">
                <IndianRupee className="w-8 h-8 -mr-1" />
                499
                <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "Unlimited active trips",
                  "AI-powered day-by-day routing",
                  "Offline maps & offline itinerary access",
                  "Real-time flight & budget tracking",
                  "Priority 24/7 concierge support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button variant="default" className="w-full shadow-lg" asChild>
                <Link to="/signup">Upgrade to Pro</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </section>
  );
}
