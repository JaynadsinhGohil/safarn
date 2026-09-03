import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Globe, MapPin, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-surface-container-low pt-16 pb-8 border-t border-border/40">
      <PageContainer>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold font-heading text-lg group-hover:scale-105 transition-transform">
                S
              </div>
              <span className="font-heading text-xl font-bold text-primary">
                Safarn
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6">
              Curate your masterpiece journey. The premium travel planning experience for modern explorers.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors"><Globe className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary transition-colors"><MapPin className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary transition-colors"><Mail className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary transition-colors"><Phone className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link to="/explore" className="hover:text-primary transition-colors">Destinations</Link></li>
              <li><Link to="/community" className="hover:text-primary transition-colors">Community</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Safarn Travel Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer">English (US)</span>
            <span className="hover:text-foreground cursor-pointer">INR (₹)</span>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
