import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  emailOrPhone: z.string().min(3, { message: 'Please enter your email or phone number' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithEmail } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to the page the user originally tried to visit, or /dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      await loginWithEmail(values.emailOrPhone, values.password);
      toast({
        title: 'Welcome back!',
        description: 'Successfully signed in to Safarn.',
      });
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-border/40 shadow-xl bg-surface/90 backdrop-blur-xl">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="w-12 h-12 rounded-xl bg-primary mx-auto flex items-center justify-center text-primary-foreground font-bold font-heading text-2xl mb-2">
          S
        </div>
        <CardTitle className="text-3xl font-heading font-bold">Welcome back</CardTitle>
        <CardDescription>Enter your details to sign in to your account</CardDescription>
        <p className="text-xs text-muted-foreground mt-1 bg-muted/50 px-3 py-1.5 rounded-md">
          Demo credentials: any email + <strong>password123</strong>
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email or Phone</label>
            <Input
              placeholder="aditi@example.com"
              {...register('emailOrPhone')}
              className={errors.emailOrPhone ? 'border-destructive' : ''}
              autoComplete="email"
            />
            {errors.emailOrPhone && (
              <p className="text-xs text-destructive">{errors.emailOrPhone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Password</label>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={errors.password ? 'border-destructive' : ''}
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full mt-6 h-12" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center gap-2 pb-8">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="text-sm text-muted-foreground hover:text-foreground mt-2 transition-colors underline underline-offset-2"
        >
          Continue as guest (demo)
        </button>
      </CardFooter>
    </Card>
  );
}
