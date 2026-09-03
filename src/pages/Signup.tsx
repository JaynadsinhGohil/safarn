import { SignupForm } from '@/components/features/auth/SignupForm';

export function Signup() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-background">
      {/* Background with a subtle travel image and overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop" 
          alt="Travel background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm dark:bg-background/90"></div>
      </div>
      
      <div className="relative z-10 w-full px-4 py-12">
        <SignupForm />
      </div>
    </div>
  );
}
