import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Compass, Map, Wallet, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { useSettings } from '@/context/SettingsContext';

const ONBOARDING_STEPS = [
  {
    id: 'travel-style',
    title: 'What is your travel style?',
    description: 'We use this to curate your perfect itinerary.',
    icon: Compass,
    options: [
      { id: 'relaxed', label: 'Relaxed & Slow' },
      { id: 'balanced', label: 'Balanced' },
      { id: 'action-packed', label: 'Action-Packed' },
      { id: 'cultural', label: 'Cultural Deep Dive' },
    ]
  },
  {
    id: 'trip-type',
    title: 'Who are you traveling with?',
    description: 'Recommendations change based on your group.',
    icon: Map,
    options: [
      { id: 'solo', label: 'Going Solo' },
      { id: 'couple', label: 'Couple / Romance' },
      { id: 'family', label: 'Family with Kids' },
      { id: 'friends', label: 'Group of Friends' },
    ]
  },
  {
    id: 'budget-range',
    title: 'What is your typical budget?',
    description: 'Helps us suggest the right hotels and activities.',
    icon: Wallet,
    options: [
      { id: 'budget', label: 'Budget-Friendly' },
      { id: 'moderate', label: 'Moderate' },
      { id: 'luxury', label: 'Luxury & Premium' },
      { id: 'ultra-luxury', label: 'Ultra-Luxury' },
    ]
  }
];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateProfile } = useSettings();

  const handleOptionSelect = (optionId: string) => {
    const stepId = ONBOARDING_STEPS[currentStep].id;
    setPreferences(prev => ({ ...prev, [stepId]: optionId }));
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Finish onboarding
      updateProfile({ preferences });
      toast({
        title: "Profile setup complete!",
        description: "We've personalized your Safarn experience.",
      });
      navigate('/trips');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const StepIcon = currentStepData.icon;
  const hasSelectedCurrent = !!preferences[currentStepData.id];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wider">
          <span>Step {currentStep + 1} of {ONBOARDING_STEPS.length}</span>
          <span>{Math.round(((currentStep) / ONBOARDING_STEPS.length) * 100)}%</span>
        </div>
        <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary rounded-full"
            initial={{ width: `${(currentStep / ONBOARDING_STEPS.length) * 100}%` }}
            animate={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-border/40 shadow-xl bg-surface/90 backdrop-blur-xl">
            <CardHeader className="text-center pb-8 pt-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                <StepIcon className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-heading font-bold">{currentStepData.title}</CardTitle>
              <CardDescription className="text-base">{currentStepData.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentStepData.options.map((option) => {
                  const isSelected = preferences[currentStepData.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(option.id)}
                      className={`
                        p-4 rounded-xl border-2 text-left transition-all duration-200
                        ${isSelected 
                          ? 'border-primary bg-primary/5 shadow-sm' 
                          : 'border-border/60 hover:border-primary/40 hover:bg-surface-container/50'
                        }
                      `}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {option.label}
                        </span>
                        {isSelected && <Check className="w-5 h-5 text-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-8 pb-8 border-t border-border/40 mt-8">
              <Button 
                variant="ghost" 
                onClick={handleBack} 
                disabled={currentStep === 0}
                className="text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!hasSelectedCurrent}
                className="min-w-[120px]"
              >
                {currentStep === ONBOARDING_STEPS.length - 1 ? "Finish" : "Next"} 
                {currentStep !== ONBOARDING_STEPS.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
