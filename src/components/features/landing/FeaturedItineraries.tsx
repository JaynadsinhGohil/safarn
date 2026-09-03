import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, IndianRupee } from 'lucide-react';
import { MOCK_ITINERARIES } from '@/data/mock/landingData';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function FeaturedItineraries() {
  return (
    <section id="featured-itineraries" className="py-24 bg-background">
      <PageContainer>
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">Featured Journeys</h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Discover our most loved itineraries crafted by travel experts and refined by the Safarn community.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_ITINERARIES.map((itin, i) => (
            <motion.div
              key={itin.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="overflow-hidden border-border/40 hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={itin.image} 
                    alt={itin.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="default" className="bg-background/90 text-foreground backdrop-blur-sm border-none shadow-sm">
                      {itin.type}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-heading text-xl font-bold line-clamp-2">{itin.title}</h3>
                    <div className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded-md shrink-0">
                      <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
                      <span className="text-xs font-semibold">{itin.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground mb-6 text-sm">
                    <MapPin className="w-4 h-4 mr-1 shrink-0" />
                    <span>{itin.duration}</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Starting from</p>
                      <div className="flex items-center text-lg font-semibold">
                        <IndianRupee className="w-4 h-4" />
                        {itin.startingPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <Link to="/signup" className="text-primary font-medium text-sm hover:underline underline-offset-4">
                      View Details
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
