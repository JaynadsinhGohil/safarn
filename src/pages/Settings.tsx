import { useState, useRef, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CurrencyToggle } from '@/components/features/budget/CurrencyToggle';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { EXPLORE_DESTINATIONS } from '@/data/mock/destinations';
import { EXPLORE_ACTIVITIES } from '@/data/mock/activities';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Settings2, Bell, Shield, Heart, Link2, Moon, Sun, HelpCircle,
  Check, X, Globe, Trash2, Download, LogOut, Laptop,
  Camera, Eye, EyeOff, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const SECTIONS = ['profile', 'preferences', 'notifications', 'privacy', 'wishlist', 'accounts', 'appearance', 'support'] as const;
type Section = typeof SECTIONS[number];

const SECTION_META: Record<Section, { label: string; icon: React.ReactNode }> = {
  profile: { label: 'Profile', icon: <User className="w-4 h-4" /> },
  preferences: { label: 'Preferences', icon: <Settings2 className="w-4 h-4" /> },
  notifications: { label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  privacy: { label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
  wishlist: { label: 'Wishlist', icon: <Heart className="w-4 h-4" /> },
  accounts: { label: 'Connected Accounts', icon: <Link2 className="w-4 h-4" /> },
  appearance: { label: 'Appearance', icon: <Moon className="w-4 h-4" /> },
  support: { label: 'Support', icon: <HelpCircle className="w-4 h-4" /> },
};

export function Settings() {
  const [active, setActive] = useState<Section>('profile');
  
  const { profile, updateProfile, settings, updateSettings, wishlist, toggleDestinationWishlist, toggleActivityWishlist } = useSettings();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const navRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({ name: profile.name, email: profile.email, phone: profile.phone ?? '' });
  const [avatarFile, setAvatarFile] = useState<string | null>(null);

  // Password Form State
  const [pwdForm, setPwdForm] = useState({ current: '', new: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [pwdError, setPwdError] = useState('');

  // Sync profile state if it changes externally
  useEffect(() => {
    setProfileForm({ name: profile.name, email: profile.email, phone: profile.phone ?? '' });
    setAvatarFile(null);
  }, [profile]);

  useEffect(() => {
    if (navRef.current && activeTabRef.current) {
      const nav = navRef.current;
      const tab = activeTabRef.current;
      const navRect = nav.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      if (tabRect.left < navRect.left || tabRect.right > navRect.right) {
        tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [active]);

  const isProfileDirty = 
    profileForm.name !== profile.name || 
    profileForm.email !== profile.email || 
    profileForm.phone !== (profile.phone ?? '') ||
    avatarFile !== null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please select an image under 5MB.', variant: 'destructive' });
      return;
    }
    
    // Validate type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({ title: 'Invalid format', description: 'Please select a JPG, PNG, or WebP image.', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setAvatarFile(event.target.result);
      }
    };
    reader.readAsDataURL(file);
    
    // Clear input so selecting the same file again triggers onChange
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const saveProfile = () => {
    updateProfile({ 
      ...profileForm, 
      ...(avatarFile ? { avatar: avatarFile } : {}) 
    });
    setAvatarFile(null);
    toast({ title: 'Profile updated successfully' });
  };

  const cancelProfile = () => {
    setProfileForm({ name: profile.name, email: profile.email, phone: profile.phone ?? '' });
    setAvatarFile(null);
  };

  const getPwdStrength = (pwd: string) => {
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length >= 8) s += 25;
    if (/[A-Z]/.test(pwd)) s += 25;
    if (/[0-9]/.test(pwd)) s += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) s += 25;
    return Math.min(s, 100);
  };

  const handlePasswordChange = () => {
    setPwdError('');
    if (!pwdForm.current || !pwdForm.new || !pwdForm.confirm) {
      setPwdError('Please fill in all password fields.');
      return;
    }
    if (pwdForm.new !== pwdForm.confirm) {
      setPwdError('New passwords do not match.');
      return;
    }
    if (pwdForm.new.length < 8) {
      setPwdError('Password must be at least 8 characters.');
      return;
    }
    // Mock successful password change
    toast({ title: 'Password updated successfully' });
    setPwdForm({ current: '', new: '', confirm: '' });
  };

  const savedDestinations = EXPLORE_DESTINATIONS.filter(d => wishlist.destinations.includes(d.id));
  const savedActivities = EXPLORE_ACTIVITIES.filter(a => wishlist.activities.includes(a.id));

  const contentVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' as const } }
  };

  const pwdStrength = getPwdStrength(pwdForm.new);
  const displayAvatar = avatarFile || profile.avatar;

  return (
    <PageContainer maxWidth="default" className="py-8 md:py-12 pb-32">
      <input 
        type="file" 
        ref={fileInputRef} 
        hidden 
        accept="image/png, image/jpeg, image/webp" 
        onChange={handleFileChange}
        aria-label="Upload profile photo"
      />
      
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 md:mb-10"
      >
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2 uppercase tracking-wider font-semibold">
          <Settings2 className="w-4 h-4 text-primary" />
          <span>Account Settings</span>
        </div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold">Manage your experience</h1>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
        
        {/* Navigation Sidebar */}
        <motion.nav 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full md:w-64 shrink-0 relative"
        >
          {/* Mobile Edge Fade Cues */}
          <div className="md:hidden absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="md:hidden absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div 
            ref={navRef}
            className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide snap-x relative z-0"
          >
            {SECTIONS.map(s => {
              const isActive = active === s;
              return (
                <button
                  key={s}
                  ref={isActive ? activeTabRef : null}
                  onClick={() => setActive(s)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all text-left whitespace-nowrap snap-center relative',
                    isActive 
                      ? 'bg-surface border border-border/40 text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:bg-surface-container hover:text-foreground'
                  )}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabIndicator" 
                      className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full hidden md:block" 
                    />
                  )}
                  <span className={cn("shrink-0", isActive ? "text-primary" : "text-muted-foreground")}>
                    {SECTION_META[s].icon}
                  </span>
                  {SECTION_META[s].label}
                </button>
              );
            })}
          </div>
        </motion.nav>

        {/* Main Content Area */}
        <div className="flex-1 w-full min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
            >
              
              {/* Profile */}
              {active === 'profile' && (
                <section className="space-y-8">
                  <div>
                    <h2 className="font-heading font-semibold text-2xl mb-1">Your Profile</h2>
                    <p className="text-muted-foreground text-sm">Manage your personal information, identity, and security.</p>
                  </div>
                  
                  {/* Personal Information */}
                  <div className="bg-surface rounded-3xl border border-border/40 p-6 md:p-8 space-y-8">
                    
                    {/* Identity & Photo */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-8 border-b border-border/40">
                      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <Avatar className="w-24 h-24 border-4 border-background shadow-lg transition-transform duration-300 group-hover:scale-[1.02]">
                          <AvatarImage src={displayAvatar} className="object-cover" />
                          <AvatarFallback className="text-3xl">{profile.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-md group-hover:scale-110 transition-transform">
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Profile Photo</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-3">We support JPG, PNG, and WebP formats up to 5MB.</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Change Photo</Button>
                          {avatarFile && (
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setAvatarFile(null)}>Remove Pending</Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input 
                          value={profileForm.name} 
                          onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} 
                          placeholder="Your full name"
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <Input 
                          value={profileForm.email} 
                          onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} 
                          placeholder="Email address"
                          type="email"
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Phone Number</label>
                        <Input 
                          value={profileForm.phone} 
                          onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} 
                          placeholder="Phone number (optional)"
                          type="tel"
                          className="bg-background"
                        />
                      </div>
                    </div>

                    {/* Save Changes Floating Action Bar (Inline) */}
                    <AnimatePresence>
                      {isProfileDirty && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-4 flex items-center justify-end gap-3"
                        >
                          <span className="text-sm text-muted-foreground mr-auto hidden sm:block">You have unsaved changes.</span>
                          <Button variant="outline" onClick={cancelProfile}>Cancel</Button>
                          <Button onClick={saveProfile}>
                            <Check className="w-4 h-4 mr-2" /> Save Changes
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Account Security (Mock) */}
                  <div className="bg-surface rounded-3xl border border-border/40 p-6 md:p-8 space-y-6">
                    <div>
                      <h3 className="font-heading font-semibold text-xl mb-1">Account Security</h3>
                      <p className="text-sm text-muted-foreground">Manage your password to keep your account safe.</p>
                    </div>

                    {pwdError && (
                      <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {pwdError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2 max-w-md">
                        <label className="text-sm font-medium">Current Password</label>
                        <div className="relative">
                          <Input 
                            type={showPwd.current ? "text" : "password"} 
                            value={pwdForm.current}
                            onChange={(e) => setPwdForm(p => ({ ...p, current: e.target.value }))}
                            className="bg-background pr-10"
                            placeholder="Enter current password"
                          />
                          <button 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPwd(s => ({ ...s, current: !s.current }))}
                            aria-label={showPwd.current ? "Hide password" : "Show password"}
                          >
                            {showPwd.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 max-w-md">
                        <label className="text-sm font-medium">New Password</label>
                        <div className="relative">
                          <Input 
                            type={showPwd.new ? "text" : "password"} 
                            value={pwdForm.new}
                            onChange={(e) => setPwdForm(p => ({ ...p, new: e.target.value }))}
                            className="bg-background pr-10"
                            placeholder="New password"
                          />
                          <button 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPwd(s => ({ ...s, new: !s.new }))}
                            aria-label={showPwd.new ? "Hide password" : "Show password"}
                          >
                            {showPwd.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {pwdForm.new.length > 0 && (
                          <div className="pt-1 flex gap-1 h-1.5 w-full">
                            <div className={cn("flex-1 rounded-full", pwdStrength > 0 ? "bg-red-500" : "bg-border")} />
                            <div className={cn("flex-1 rounded-full", pwdStrength > 25 ? "bg-orange-500" : "bg-border")} />
                            <div className={cn("flex-1 rounded-full", pwdStrength > 50 ? "bg-yellow-500" : "bg-border")} />
                            <div className={cn("flex-1 rounded-full", pwdStrength > 75 ? "bg-green-500" : "bg-border")} />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 max-w-md">
                        <label className="text-sm font-medium">Confirm New Password</label>
                        <div className="relative">
                          <Input 
                            type={showPwd.confirm ? "text" : "password"} 
                            value={pwdForm.confirm}
                            onChange={(e) => setPwdForm(p => ({ ...p, confirm: e.target.value }))}
                            className="bg-background pr-10"
                            placeholder="Confirm new password"
                          />
                          <button 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPwd(s => ({ ...s, confirm: !s.confirm }))}
                            aria-label={showPwd.confirm ? "Hide password" : "Show password"}
                          >
                            {showPwd.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button 
                        variant="secondary" 
                        disabled={!pwdForm.current && !pwdForm.new && !pwdForm.confirm}
                        onClick={handlePasswordChange}
                      >
                        Update Password
                      </Button>
                    </div>
                  </div>

                  {/* Account Actions */}
                  <div className="bg-surface rounded-3xl border border-border/40 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-heading font-semibold text-lg">Active Session</h3>
                      <p className="text-sm text-muted-foreground">You are currently logged in as {profile.email}</p>
                    </div>
                    <Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full sm:w-auto">
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </Button>
                  </div>

                </section>
              )}

              {/* Preferences */}
              {active === 'preferences' && (
                <section>
                  <div className="mb-6">
                    <h2 className="font-heading font-semibold text-2xl mb-1">Regional Preferences</h2>
                    <p className="text-muted-foreground text-sm">Customize how Safarn displays pricing, language, and measurements.</p>
                  </div>
                  
                  <div className="bg-surface rounded-3xl border border-border/40 divide-y divide-border/40">
                    <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">Currency</p>
                        <p className="text-sm text-muted-foreground mt-1">Default currency for all trip budgets and pricing.</p>
                      </div>
                      <CurrencyToggle />
                    </div>
                    
                    <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">Language</p>
                        <p className="text-sm text-muted-foreground mt-1">Select your preferred display language.</p>
                      </div>
                      <Select value={settings.language} onValueChange={(val) => updateSettings({ language: val })}>
                        <SelectTrigger className="w-full sm:w-[180px] rounded-xl bg-background">
                          <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English (US)</SelectItem>
                          <SelectItem value="hi">Hindi (India)</SelectItem>
                          <SelectItem value="gu">Gujarati (India)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">Units of Measurement</p>
                        <p className="text-sm text-muted-foreground mt-1">Used for distance (km/mi) and temperature (C/F).</p>
                      </div>
                      <div className="flex p-1 bg-background rounded-xl border border-border/50">
                        <button 
                          onClick={() => updateSettings({ units: 'metric' })} 
                          className={cn('px-4 py-2 text-sm font-medium rounded-lg transition-colors', settings.units === 'metric' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground')}
                        >
                          Metric
                        </button>
                        <button 
                          onClick={() => updateSettings({ units: 'imperial' })} 
                          className={cn('px-4 py-2 text-sm font-medium rounded-lg transition-colors', settings.units === 'imperial' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground')}
                        >
                          Imperial
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Notifications */}
              {active === 'notifications' && (
                <section>
                  <div className="mb-6">
                    <h2 className="font-heading font-semibold text-2xl mb-1">Notification Settings</h2>
                    <p className="text-muted-foreground text-sm">Control how and when we communicate with you.</p>
                  </div>
                  
                  <div className="bg-surface rounded-3xl border border-border/40 divide-y divide-border/40">
                    {[
                      { key: 'tripReminders' as const, label: 'Trip Reminders', desc: 'Get notified before your upcoming trips start.' },
                      { key: 'activityAlerts' as const, label: 'Activity Alerts', desc: 'Price drops and updates on saved activities.' },
                      { key: 'budgetAlerts' as const, label: 'Budget Alerts', desc: 'Warnings when you approach your planned budget.' },
                      { key: 'productUpdates' as const, label: 'Product Updates', desc: 'News about new features and improvements.' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="p-6 md:p-8 flex flex-row items-center justify-between gap-4">
                        <div className="pr-4">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                        </div>
                        <Switch 
                          checked={settings.notifications[key]} 
                          onCheckedChange={(checked) => updateSettings({ notifications: { ...settings.notifications, [key]: checked } })}
                          aria-label={label}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Privacy */}
              {active === 'privacy' && (
                <section>
                  <div className="mb-6">
                    <h2 className="font-heading font-semibold text-2xl mb-1">Privacy & Data</h2>
                    <p className="text-muted-foreground text-sm">Manage your data sharing and privacy controls.</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-surface rounded-3xl border border-border/40 divide-y divide-border/40">
                      <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">Trip Privacy</p>
                          <p className="text-sm text-muted-foreground mt-1">Manage sharing from individual trip pages.</p>
                        </div>
                        <Button variant="outline" className="rounded-xl">Manage Trips</Button>
                      </div>
                      <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">Export My Data</p>
                          <p className="text-sm text-muted-foreground mt-1">Download an archive of all your trips, budgets, and plans.</p>
                        </div>
                        <Button variant="secondary" className="rounded-xl"><Download className="w-4 h-4 mr-2" /> Request Export</Button>
                      </div>
                    </div>

                    <div className="bg-destructive/5 rounded-3xl border border-destructive/20 p-6 md:p-8">
                      <h3 className="font-semibold text-destructive text-lg mb-2">Danger Zone</h3>
                      <p className="text-sm text-muted-foreground mb-6">Permanently delete your account and all associated data. This action cannot be undone.</p>
                      <Button variant="destructive" className="rounded-xl shadow-none hover:bg-destructive/90">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                      </Button>
                    </div>
                  </div>
                </section>
              )}

              {/* Wishlist */}
              {active === 'wishlist' && (
                <section>
                  <div className="mb-6">
                    <h2 className="font-heading font-semibold text-2xl mb-1">Your Wishlist</h2>
                    <p className="text-muted-foreground text-sm">Destinations and activities you've saved for future inspiration.</p>
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" /> Saved Destinations
                      </h3>
                      {savedDestinations.length === 0 ? (
                        <div className="bg-surface/50 rounded-3xl border border-dashed border-border/60 p-10 text-center">
                          <Heart className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                          <p className="text-muted-foreground">No destinations saved yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {savedDestinations.map(d => (
                            <div key={d.id} className="group relative rounded-2xl overflow-hidden border border-border/40 aspect-[4/3]">
                              <img src={d.image} alt={d.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                              <div className="absolute bottom-0 left-0 p-4 w-full">
                                <p className="font-semibold text-white truncate">{d.name}</p>
                                <p className="text-xs text-white/80">{d.state}</p>
                              </div>
                              <button 
                                onClick={() => toggleDestinationWishlist(d.id)}
                                aria-label={`Remove ${d.name} from wishlist`}
                                className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-destructive/80 text-white rounded-full backdrop-blur-md transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" /> Saved Activities
                      </h3>
                      {savedActivities.length === 0 ? (
                        <div className="bg-surface/50 rounded-3xl border border-dashed border-border/60 p-10 text-center">
                          <Heart className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                          <p className="text-muted-foreground">No activities saved yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {savedActivities.map(a => (
                            <div key={a.id} className="flex items-center gap-4 p-4 bg-surface rounded-2xl border border-border/40 hover:border-primary/30 transition-colors group">
                              <img src={a.image} alt={a.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">{a.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">{a.destinationName}</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                aria-label={`Remove ${a.name} from wishlist`}
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" 
                                onClick={() => toggleActivityWishlist(a.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Accounts */}
              {active === 'accounts' && (
                <section>
                  <div className="mb-6">
                    <h2 className="font-heading font-semibold text-2xl mb-1">Connected Accounts</h2>
                    <p className="text-muted-foreground text-sm">Manage third-party logins and integrations.</p>
                  </div>
                  
                  <div className="bg-surface rounded-3xl border border-border/40 divide-y divide-border/40">
                    {[
                      { name: 'Google', icon: '🔵', connected: true, email: profile.email },
                      { name: 'Apple', icon: '⚫', connected: false },
                      { name: 'Facebook', icon: '🔷', connected: false },
                    ].map(acc => (
                      <div key={acc.name} className="p-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center text-2xl border border-border/50 shadow-sm">
                            {acc.icon}
                          </div>
                          <div>
                            <p className="font-semibold">{acc.name}</p>
                            <p className={cn("text-sm mt-0.5", acc.connected ? "text-primary font-medium" : "text-muted-foreground")}>
                              {acc.connected ? `Connected as ${acc.email || ''}` : 'Not connected'}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant={acc.connected ? "outline" : "secondary"} 
                          className={cn("rounded-xl", acc.connected && "hover:border-destructive hover:text-destructive hover:bg-destructive/5")}
                          onClick={() => toast({ title: acc.connected ? `${acc.name} disconnected` : `${acc.name} connected (mock)` })}
                        >
                          {acc.connected ? 'Disconnect' : 'Connect'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Appearance */}
              {active === 'appearance' && (
                <section>
                  <div className="mb-6">
                    <h2 className="font-heading font-semibold text-2xl mb-1">Appearance</h2>
                    <p className="text-muted-foreground text-sm">Choose how Safarn looks on this device.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {(['light', 'dark', 'system'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={cn(
                          'p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4', 
                          theme === t 
                            ? 'border-primary bg-primary/5 shadow-sm' 
                            : 'border-border/40 bg-surface hover:border-primary/40 hover:bg-surface-container'
                        )}
                      >
                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", theme === t ? "bg-primary/20 text-primary" : "bg-background text-muted-foreground")}>
                          {t === 'light' ? <Sun className="w-6 h-6" /> : t === 'dark' ? <Moon className="w-6 h-6" /> : <Laptop className="w-6 h-6" />}
                        </div>
                        <div className="text-center">
                          <p className="font-semibold capitalize text-foreground">{t}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t === 'light' ? 'Bright & clear' : t === 'dark' ? 'Easy on the eyes' : 'Follows OS'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Support */}
              {active === 'support' && (
                <section>
                  <div className="mb-6">
                    <h2 className="font-heading font-semibold text-2xl mb-1">Support & Legal</h2>
                    <p className="text-muted-foreground text-sm">Get help and review our policies.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Help Center', desc: 'FAQs and comprehensive how-to guides.', icon: <HelpCircle className="w-5 h-5 text-primary" /> },
                      { label: 'Contact Support', desc: 'Get in touch with our support team.', icon: <User className="w-5 h-5 text-primary" /> },
                      { label: 'Report a Bug', desc: 'Help us improve by reporting an issue.', icon: <Settings2 className="w-5 h-5 text-primary" /> },
                      { label: 'Privacy Policy', desc: 'Read our latest data privacy policy.', icon: <Shield className="w-5 h-5 text-primary" /> },
                    ].map(item => (
                      <button 
                        key={item.label} 
                        className="flex flex-col items-start text-left p-6 rounded-3xl border border-border/40 bg-surface hover:border-primary/30 hover:shadow-sm transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {item.icon}
                        </div>
                        <p className="font-semibold">{item.label}</p>
                        <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </section>
              )}
              
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageContainer>
  );
}
