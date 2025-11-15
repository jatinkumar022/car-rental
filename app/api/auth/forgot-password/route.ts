import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success (security best practice - don't reveal if email exists)
    // In production, you would send an email with reset token here
    // For now, we'll just return success

    // Generate reset token (in production, store this in database with expiry)
    const resetToken = crypto.randomBytes(32).toString('hex');
    // const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now - unused in demo

    // In production, you would:
    // 1. Save resetToken and resetTokenExpiry to user document
    // 2. Send email with reset link containing the token
    // 3. Use email service like SendGrid, Resend, or Nodemailer

    // For demo purposes, we'll just log the token and return it in response
    // NEVER do this in production! Always send via email.
    if (user) {
      console.warn('DEMO: Reset token:', resetToken);
      console.warn('DEMO: Reset link:', `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`);
      // In production: await User.findByIdAndUpdate(user._id, {
      //   resetToken,
      //   resetTokenExpiry,
      // });
      
      // For demo: return the link in response (NEVER in production!)
      return NextResponse.json(
        {
          message: 'If an account exists with this email, a password reset link has been sent.',
          // DEMO ONLY - Remove this in production!
          demoResetLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: 'If an account exists with this email, a password reset link has been sent.',
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

