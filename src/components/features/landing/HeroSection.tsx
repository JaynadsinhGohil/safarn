import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop" 
          alt="Premium travel destination" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background dark:from-background/60 dark:via-background/80 dark:to-background"></div>
      </div>

      <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full text-center flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/50 backdrop-blur-md border border-border/30 mb-8"
        >
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium uppercase tracking-wider text-foreground">The New Standard in Travel</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-heading font-bold text-foreground max-w-4xl leading-tight mb-6"
        >
          Curate Your Next <span className="text-primary italic">Masterpiece</span> Journey.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-foreground/80 max-w-2xl mb-10 font-sans"
        >
          Safarn brings intelligence, elegance, and precision to your travel planning. Design perfect itineraries in minutes, not months.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Button size="lg" className="h-14 px-8 text-base rounded-full shadow-xl" asChild>
            <Link to="/onboarding">
              Plan Your Trip <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button size="lg" variant="glass" className="h-14 px-8 text-base rounded-full" asChild>
            <a href="#featured-itineraries">
              Explore Destinations
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
