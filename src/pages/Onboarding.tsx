import { OnboardingFlow } from '@/components/features/onboarding/OnboardingFlow';

export function Onboarding() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-background">
      {/* Dynamic abstract background for onboarding */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px]" />
      </div>
      
      <div className="relative z-10 w-full px-4 py-12 flex flex-col items-center">
        <div className="mb-8 text-center">
          <div className="w-10 h-10 rounded-lg bg-primary mx-auto flex items-center justify-center text-primary-foreground font-bold font-heading text-xl mb-4">
            G
          </div>
        </div>
        <OnboardingFlow />
      </div>
    </div>
  );
}
