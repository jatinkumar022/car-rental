'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get token and email from URL params (if available)
  useEffect(() => {
    const email = searchParams?.get('email');
    if (email) {
      setFormData((prev) => ({ ...prev, email }));
    }
    // In production, validate token here
    // const token = searchParams?.get('token');
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const token = searchParams?.get('token') || 'demo-token';
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        toast.success('Password reset successfully!');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setErrors({ submit: data.error || 'Failed to reset password' });
        toast.error(data.error || 'Failed to reset password');
      }
    } catch {
      setErrors({ submit: 'An error occurred. Please try again.' });
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7FA] px-4 py-12">
        <Card className="w-full max-w-md shadow-[0_4px_16px_rgba(0,0,0,0.12)] border-0">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6FFF9]">
              <CheckCircle2 className="h-8 w-8 text-[#00D09C]" />
            </div>
            <CardTitle className="text-3xl font-bold text-[#1A1A2E]">Password Reset Successful!</CardTitle>
            <CardDescription className="text-base text-[#6C6C80]">
              Your password has been reset successfully. Redirecting to login...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth/login">
              <Button className="bg-[#00D09C] hover:bg-[#00B386] text-white">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7FA] px-4 py-12">
      <Card className="w-full max-w-md shadow-[0_4px_16px_rgba(0,0,0,0.12)] border-0">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6FFF9]">
            <Lock className="h-8 w-8 text-[#00D09C]" />
          </div>
          <CardTitle className="text-3xl font-bold text-[#1A1A2E]">Reset Password</CardTitle>
          <CardDescription className="text-base text-[#6C6C80]">
            Enter your email and new password to reset your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <div className="rounded-lg bg-[#FFE5E5] border border-[#FF4444] p-3 text-sm text-[#FF4444]">
                {errors.submit}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={loading || !!searchParams?.get('email')}
                className={errors.email ? 'border-[#FF4444]' : ''}
              />
              {errors.email && (
                <p className="text-xs text-[#FF4444]">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                disabled={loading}
                className={errors.password ? 'border-[#FF4444]' : ''}
              />
              {errors.password && (
                <p className="text-xs text-[#FF4444]">{errors.password}</p>
              )}
              <p className="text-xs text-[#6C6C80]">Must be at least 6 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                disabled={loading}
                className={errors.confirmPassword ? 'border-[#FF4444]' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-[#FF4444]">{errors.confirmPassword}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-[#00D09C] hover:bg-[#00B386] text-white rounded-xl font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-[#00D09C] hover:text-[#00B386] hover:underline transition flex items-center justify-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

