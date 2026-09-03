import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    try {
      await signup({ name: values.name, email: values.email, password: values.password });
      toast({
        title: 'Account created!',
        description: "Welcome to Safarn. Let's start planning.",
      });
      navigate('/onboarding');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const password = watch('password') || '';
  const calculateStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length > 7) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };
  const strength = calculateStrength(password);

  return (
    <Card className="w-full max-w-md mx-auto border-border/40 shadow-xl bg-surface/90 backdrop-blur-xl">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="w-12 h-12 rounded-xl bg-primary mx-auto flex items-center justify-center text-primary-foreground font-bold font-heading text-2xl mb-2">
          S
        </div>
        <CardTitle className="text-3xl font-heading font-bold">Create Account</CardTitle>
        <CardDescription>Join Safarn to start planning your masterpiece journey</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <Input
              placeholder="Aditi Sharma"
              {...register('name')}
              className={errors.name ? 'border-destructive' : ''}
              autoComplete="name"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              placeholder="aditi@example.com"
              type="email"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
              autoComplete="email"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <Input
              type="password"
              placeholder="Create a strong password"
              {...register('password')}
              className={errors.password ? 'border-destructive' : ''}
              autoComplete="new-password"
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            {password.length > 0 && (
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1.5 w-full rounded-full transition-colors ${
                      strength >= level
                        ? strength > 2 ? 'bg-green-500' : 'bg-yellow-500'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Confirm Password</label>
            <Input
              type="password"
              placeholder="Confirm your password"
              {...register('confirmPassword')}
              className={errors.confirmPassword ? 'border-destructive' : ''}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex items-start space-x-2 pt-2">
            <Checkbox
              id="terms"
              onCheckedChange={(checked) => setValue('acceptTerms', checked as true, { shouldValidate: true })}
            />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the{' '}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
              </label>
              {errors.acceptTerms && <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>}
            </div>
          </div>

          <Button type="submit" className="w-full mt-6 h-12" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center pb-8">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
