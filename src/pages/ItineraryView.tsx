import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTrip } from '@/context/TripContext';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Users, IndianRupee, Clock, Edit3, Download, Printer, Share2, Copy } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { calculateNights } from '@/lib/dateUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export function ItineraryView() {
  const { id } = useParams<{ id: string }>();
  const { activeTrip, setActiveTrip, loading, updateTripPrivacy } = useTrip();
  const [shareOpen, setShareOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id && (!activeTrip || activeTrip.id !== id)) {
      setActiveTrip(id);
    }
  }, [id, activeTrip, setActiveTrip]);

  if (loading || !activeTrip) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleExportPDF = () => {
    alert("Mock PDF Export generated and downloading...");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-background pb-20 md:pb-0">
      
      {/* Hero Section */}
      <div className="relative h-[30vh] md:h-[40vh] w-full">
        <img 
          src={activeTrip.coverImage} 
          alt={activeTrip.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <PageContainer className="absolute bottom-0 left-0 right-0 py-8 flex flex-col md:flex-row items-end justify-between gap-4">
          <div className="text-foreground">
            <span className="text-xs font-semibold px-2 py-1 bg-primary/20 text-primary rounded-md capitalize mb-3 inline-block backdrop-blur-md">
              {activeTrip.status}
            </span>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">{activeTrip.name}</h1>
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /> {format(parseISO(activeTrip.startDate), 'MMM d, yyyy')} - {format(parseISO(activeTrip.endDate), 'MMM d, yyyy')}</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /> {activeTrip.travelers} Travelers</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> {activeTrip.cities.length} Stops</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0 print:hidden">
            <Button variant="secondary" size="icon" onClick={handlePrint} className="bg-surface/80 backdrop-blur-md shrink-0">
              <Printer className="w-4 h-4" />
            </Button>
            <Button variant="secondary" onClick={handleExportPDF} className="bg-surface/80 backdrop-blur-md shrink-0">
              <Download className="w-4 h-4 mr-2 shrink-0" /> Export PDF
            </Button>
            <Button variant="secondary" onClick={() => setShareOpen(true)} className="bg-surface/80 backdrop-blur-md shrink-0">
              <Share2 className="w-4 h-4 mr-2 shrink-0" /> Share
            </Button>
            <Button asChild className="shadow-lg shrink-0">
              <Link to={`/trips/${activeTrip.id}/edit`} className="flex items-center">
                <Edit3 className="w-4 h-4 mr-2 shrink-0" /> Edit Trip
              </Link>
            </Button>
          </div>
        </PageContainer>
      </div>

      <PageContainer className="py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Timeline */}
          <div className="lg:col-span-2 space-y-12">
            {activeTrip.cities.map((city) => (
              <div key={city.id} className="space-y-8">
                <div className="border-b border-border/40 pb-4">
                  <h2 className="text-3xl font-heading font-bold text-primary">{city.name}</h2>
                  <p className="text-muted-foreground">
                    {Math.max(0, activeTrip.days.filter(d => d.cityId === city.id).length - 1)} Nights
                  </p>
                </div>

                <div className="space-y-8">
                  {activeTrip.days.filter(d => d.cityId === city.id).map(day => (
                    <div key={day.id} className="relative pl-8 md:pl-0 print:break-inside-avoid">
                      {/* Desktop layout vs Mobile timeline */}
                      <div className="hidden md:block absolute left-[140px] top-0 bottom-0 w-px bg-border/60" />
                      
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-[140px] shrink-0 text-left md:text-right md:pr-8 pt-2 relative z-10">
                          <div className="hidden md:block absolute right-[-5px] top-4 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background" />
                          <h4 className="font-semibold text-lg">Day {day.dayNumber}</h4>
                          <p className="text-sm text-muted-foreground">{format(parseISO(day.date), 'MMM d, yyyy')}</p>
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          {day.activities.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic py-2">No activities planned yet.</p>
                          ) : (
                            day.activities.map(activity => (
                              <Card key={activity.id} className="border border-border/40 bg-surface/50 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-4 flex gap-4">
                                  <div className="hidden sm:flex w-16 text-sm font-medium text-muted-foreground pt-0.5">
                                    {activity.time || 'Anytime'}
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-semibold">{activity.title}</h5>
                                    {activity.location && (
                                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                        <MapPin className="w-3 h-3" /> {activity.location}
                                      </p>
                                    )}
                                    {activity.description && (
                                      <p className="text-sm mt-3 leading-relaxed">{activity.description}</p>
                                    )}
                                  </div>
                                  {activity.estimatedCost && (
                                    <div className="text-sm font-medium text-foreground bg-primary/5 px-2 py-1 rounded-md h-fit whitespace-nowrap">
                                      ₹{activity.estimatedCost}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sticky Summary Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-28 space-y-6">
              <Card className="border-border/40 bg-surface/30 backdrop-blur-md">
                <CardContent className="p-6">
                  <h3 className="font-heading font-semibold text-lg mb-6">Trip Summary</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-border/40">
                      <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Duration</span>
                      <span className="font-medium">{calculateNights(activeTrip.startDate, activeTrip.endDate)} Nights</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-border/40">
                      <span className="text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4" /> Destinations</span>
                      <span className="font-medium">{activeTrip.cities.length}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-border/40">
                      <span className="text-muted-foreground flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Est. Cost</span>
                      <span className="font-medium font-heading">₹{(activeTrip.budget.totalEstimated).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Per Person</span>
                      <span className="font-medium">₹{(activeTrip.budget.totalEstimated / activeTrip.travelers).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {activeTrip.notes && (
                <Card className="border-border/40 bg-primary/5">
                  <CardContent className="p-6">
                    <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-primary mb-3">Notes</h3>
                    <p className="text-sm leading-relaxed">{activeTrip.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

        </div>
      </PageContainer>

      {/* Share Trip Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-md bg-background border-border/40">
          <DialogHeader>
            <DialogTitle>Share Trip</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTrip.name}
            </p>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between p-4 border border-border/40 rounded-xl bg-surface/50">
              <div>
                <p className="font-medium text-sm">Public Link</p>
                <p className="text-xs text-muted-foreground">Anyone with the link can view</p>
              </div>
              <Button 
                variant={activeTrip.isPublic ? "default" : "outline"} 
                size="sm"
                onClick={() => updateTripPrivacy(activeTrip.id, !activeTrip.isPublic)}
              >
                {activeTrip.isPublic ? 'Enabled' : 'Enable Link'}
              </Button>
            </div>

            {activeTrip.isPublic && activeTrip.shareId && (
              <div className="flex items-center gap-2">
                <Input 
                  readOnly 
                  value={`${window.location.origin}/share/${activeTrip.shareId}`} 
                  className="bg-muted/50"
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/share/${activeTrip.shareId}`);
                    toast({ title: 'Link copied to clipboard!' });
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <div className="bg-amber-500/10 text-amber-600 dark:text-amber-500 text-xs p-3 rounded-lg border border-amber-500/20 mt-2">
              <strong>Note:</strong> Safarn is currently running in local mode. Shared links will only work on this device/browser.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
