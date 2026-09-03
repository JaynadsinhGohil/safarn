import { Compass, CalendarDays, PlaneTakeoff } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { motion } from 'framer-motion';

export function HowItWorks() {
  const steps = [
    {
      icon: Compass,
      title: "Discover",
      description: "Explore curated, premium destinations based on your unique travel style and preferences."
    },
    {
      icon: CalendarDays,
      title: "Plan",
      description: "Let our intelligent builder craft the perfect day-by-day itinerary tailored to your pace."
    },
    {
      icon: PlaneTakeoff,
      title: "Travel",
      description: "Access your beautifully formatted plans offline and travel with complete peace of mind."
    }
  ];

  return (
    <section id="how-it-works" className="bg-surface py-24">
      <PageContainer>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">Effortless Planning</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Three simple steps to your next unforgettable experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-border/50 z-0"></div>
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center space-y-6"
              >
                <div className="w-24 h-24 rounded-full bg-background border border-border/40 shadow-sm flex items-center justify-center">
                  <Icon className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-heading font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
