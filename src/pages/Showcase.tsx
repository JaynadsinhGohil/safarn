import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Map, Star, ArrowRight } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';

export function Showcase() {
  return (
    <PageContainer>
      <PageHeader 
        title="Phase 2 Showcase" 
        description="A comprehensive preview of all shared UI components, typography, colors, and layouts built for Safarn."
        action={{ label: "Continue Planning", onClick: () => alert('Action clicked'), icon: <ArrowRight className="w-4 h-4" /> }}
      />
      
      <div className="space-y-12">
        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-xl font-heading font-semibold border-b border-border/40 pb-2">Buttons</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="default">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="glass">Glass Button</Button>
            <Button variant="destructive">Destructive</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" variant="outline"><Star className="w-4 h-4" /></Button>
          </div>
        </section>

        {/* Inputs & Controls */}
        <section className="space-y-4">
          <h2 className="text-xl font-heading font-semibold border-b border-border/40 pb-2">Form Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div className="space-y-2">
              <label className="text-sm font-medium">Standard Input</label>
              <Input placeholder="Enter destination..." />
            </div>
            <div className="flex items-center space-x-2 mt-8">
              <Switch id="airplane-mode" />
              <label htmlFor="airplane-mode" className="text-sm font-medium">Dark Mode Toggle Style</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <label htmlFor="terms" className="text-sm font-medium">Accept terms and conditions</label>
            </div>
          </div>
        </section>

        {/* Badges & Avatars */}
        <section className="space-y-4">
          <h2 className="text-xl font-heading font-semibold border-b border-border/40 pb-2">Data Display</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Badge variant="default">Recommended</Badge>
            <Badge variant="secondary">New</Badge>
            <Badge variant="outline">Budget</Badge>
            <Badge variant="destructive">Sold Out</Badge>
            <div className="w-4" />
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/150?u=aditi" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-4">
          <h2 className="text-xl font-heading font-semibold border-b border-border/40 pb-2">Cards & Surfaces</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Standard Card</CardTitle>
                <CardDescription>Typical content container</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Cards use large 16px border radiuses, subtle borders, and soft shadows to match the premium travel aesthetic.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Details</Button>
              </CardFooter>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Glass Card</CardTitle>
                <CardDescription>Premium frosted effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Used for overlays, floating panels, or premium featured content over background images.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="default" className="w-full">Explore</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Tabs */}
        <section className="space-y-4">
          <h2 className="text-xl font-heading font-semibold border-b border-border/40 pb-2">Tabs</h2>
          <Tabs defaultValue="empty" className="w-full max-w-3xl">
            <TabsList>
              <TabsTrigger value="empty">Empty State</TabsTrigger>
              <TabsTrigger value="loading">Loading State</TabsTrigger>
            </TabsList>
            <TabsContent value="empty" className="mt-4 border border-border/40 rounded-2xl bg-card">
              <EmptyState 
                icon={Map} 
                title="No Trips Found" 
                description="You haven't planned any trips yet. Start exploring the world and build your first itinerary!" 
                actionLabel="Plan New Trip"
                onAction={() => {}}
              />
            </TabsContent>
            <TabsContent value="loading" className="mt-4 border border-border/40 rounded-2xl bg-card">
              <LoadingState message="Fetching your premium travel experiences..." />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </PageContainer>
  );
}
