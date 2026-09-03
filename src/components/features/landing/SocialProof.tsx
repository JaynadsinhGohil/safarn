import { PageContainer } from '@/components/layout/PageContainer';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MOCK_TESTIMONIALS } from '@/data/mock/landingData';
import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';

export function SocialProof() {
  return (
    <section className="py-24 bg-surface-container-low overflow-hidden">
      <PageContainer>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">Traveler Stories</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands of modern explorers who have transformed how they experience the world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MOCK_TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-background p-8 rounded-3xl border border-border/40 shadow-sm relative"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/10" />
              <p className="text-foreground leading-relaxed italic mb-8 relative z-10 font-heading">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4 border-t border-border/40 pt-6 mt-auto">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
