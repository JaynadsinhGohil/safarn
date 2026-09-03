import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TripProvider } from '@/context/TripContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { AuthProvider } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ItineraryLayout } from '@/components/layout/ItineraryLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { Onboarding } from '@/pages/Onboarding';
import { Dashboard } from '@/pages/Dashboard';
import { MyTrips } from '@/pages/MyTrips';
import { CreateTrip } from '@/pages/CreateTrip';
import { ItineraryBuilder } from '@/pages/ItineraryBuilder';
import { ItineraryView } from '@/pages/ItineraryView';
import { Explore } from '@/pages/Explore';
import { ExploreActivities } from '@/pages/ExploreActivities';
import { Budget } from '@/pages/Budget';
import { CalendarView } from '@/pages/CalendarView';
import { Notifications } from '@/pages/Notifications';
import { Settings } from '@/pages/Settings';
import { SharedItinerary } from '@/pages/SharedItinerary';
import { Wishlist } from '@/pages/Wishlist';
import { ActivityDetail } from '@/pages/ActivityDetail';
import { DestinationDetail } from '@/pages/DestinationDetail';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="globetrotter-theme">
      <AuthProvider>
        <SettingsProvider>
          <TripProvider>
            <ErrorBoundary>
              <Router>
                <Routes>
                  {/* Public / Landing Routes */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Landing />} />
                  </Route>

                  {/* Auth & Onboarding Routes (No Navbar/Footer) */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/onboarding" element={<Onboarding />} />

                  {/* Public Shared Itinerary — no auth required */}
                  <Route path="/share/:shareId" element={<SharedItinerary />} />

                  {/* Protected Main App Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/explore" element={<Explore />} />
                      <Route path="/explore/destination/:id" element={<DestinationDetail />} />
                      <Route path="/explore/activities" element={<ExploreActivities />} />
                      <Route path="/explore/activity/:id" element={<ActivityDetail />} />
                      <Route path="/trips" element={<MyTrips />} />
                      <Route path="/trips/new" element={<CreateTrip />} />
                      <Route path="/budget" element={<Budget />} />
                      <Route path="/calendar" element={<CalendarView />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                    </Route>

                    {/* Dedicated Itinerary Builder/View Routes */}
                    <Route element={<ItineraryLayout />}>
                      <Route path="/trips/:id/edit" element={<ItineraryBuilder />} />
                      <Route path="/trips/:id/itinerary/view" element={<ItineraryView />} />
                    </Route>
                  </Route>

                  {/* Catch-all redirect */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Router>
            </ErrorBoundary>
          </TripProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
