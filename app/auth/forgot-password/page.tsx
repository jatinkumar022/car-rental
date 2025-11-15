'use client';

import { useState } from 'react';
import { Car, Loader2, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setEmailSent(true);
        toast.success('Password reset link sent to your email!');
        // DEMO: Show the reset link if provided (only for demo purposes)
        if (data.demoResetLink) {
          console.warn('DEMO: Reset link:', data.demoResetLink);
          // In production, this would be sent via email only
        }
      } else {
        toast.error(data.error || 'Failed to send reset email');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7FA] px-4 py-12">
      <Card className="w-full max-w-md shadow-[0_4px_16px_rgba(0,0,0,0.12)] border-0">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6FFF9]">
            <Car className="h-8 w-8 text-[#00D09C]" />
          </div>
          <CardTitle className="text-3xl font-bold text-[#1A1A2E]">
            {emailSent ? 'Check Your Email' : 'Forgot Password'}
          </CardTitle>
          <CardDescription className="text-base text-[#6C6C80]">
            {emailSent
              ? 'We\'ve sent a password reset link to your email address.'
              : 'Enter your email address and we\'ll send you a link to reset your password.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E6FFF9]">
                <Mail className="h-10 w-10 text-[#00D09C]" />
              </div>
              <p className="text-sm text-[#6C6C80]">
                Please check your inbox at <strong>{email}</strong> and click on the reset link.
              </p>
              <p className="text-xs text-[#6C6C80]">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                  variant="outline"
                  className="w-full border-[#00D09C] text-[#00D09C] hover:bg-[#E6FFF9]"
                >
                  Try Another Email
                </Button>
                <Link href="/auth/login">
                  <Button variant="ghost" className="w-full text-[#6C6C80] hover:text-[#00D09C]">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#00D09C] hover:bg-[#00B386] text-white rounded-xl font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="text-sm font-semibold text-[#00D09C] hover:text-[#00B386] hover:underline transition"
                >
                  <ArrowLeft className="mr-1 inline h-3 w-3" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

