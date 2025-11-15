'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Loader2, CheckCircle2 } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  bookingId?: string;
  onSuccess: () => void;
}

export function PaymentModal({ open, onOpenChange, amount, bookingId, onSuccess }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16) {
      // Format with spaces every 4 digits
      value = value.match(/.{1,4}/g)?.join(' ') || value;
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
      setExpiryDate(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCvv(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
        alert('Please enter a valid 16-digit card number');
        return;
      }
      if (!expiryDate || expiryDate.length !== 5) {
        alert('Please enter a valid expiry date (MM/YY)');
        return;
      }
      if (!cvv || cvv.length !== 3) {
        alert('Please enter a valid CVV');
        return;
      }
      if (!cardholderName) {
        alert('Please enter cardholder name');
        return;
      }
    }

    setIsProcessing(true);

    // Simulate payment processing (2-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Always return success (dummy payment)
    setIsProcessing(false);
    setIsSuccess(true);

    // Wait a moment to show success, then call onSuccess
    setTimeout(() => {
      onSuccess();
      handleClose();
    }, 1500);
  };

  const handleClose = () => {
    if (!isProcessing && !isSuccess) {
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setCardholderName('');
      setPaymentMethod('card');
      setIsSuccess(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1A1A2E]">
            Complete Payment
          </DialogTitle>
          <DialogDescription className="text-[#6C6C80]">
            Total Amount: <span className="font-semibold text-[#1A1A2E]">₹{amount.toLocaleString()}</span>
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="w-16 h-16 text-[#00C853] mb-4" />
            <h3 className="text-xl font-semibold text-[#1A1A2E] mb-2">Payment Successful!</h3>
            <p className="text-[#6C6C80] text-center">
              Your payment has been processed successfully.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Method Selection */}
            <div className="space-y-2">
              <Label className="text-[#2D2D44] font-semibold">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(value: 'card' | 'upi' | 'wallet') => setPaymentMethod(value)}>
                <SelectTrigger className="h-12 border-[#E5E5EA] focus:border-[#00D09C] focus:ring-[#00D09C]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === 'card' && (
              <>
                {/* Card Number */}
                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="text-[#2D2D44] font-semibold">
                    Card Number
                  </Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6C6C80]" />
                    <Input
                      id="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="h-12 pl-10 border-[#E5E5EA] focus:border-[#00D09C] focus:ring-[#00D09C]"
                      maxLength={19}
                    />
                  </div>
                  <p className="text-xs text-[#6C6C80]">Enter any 16-digit card number</p>
                </div>

                {/* Cardholder Name */}
                <div className="space-y-2">
                  <Label htmlFor="cardholderName" className="text-[#2D2D44] font-semibold">
                    Cardholder Name
                  </Label>
                  <Input
                    id="cardholderName"
                    type="text"
                    placeholder="John Doe"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    className="h-12 border-[#E5E5EA] focus:border-[#00D09C] focus:ring-[#00D09C]"
                  />
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry" className="text-[#2D2D44] font-semibold">
                      Expiry Date
                    </Label>
                    <Input
                      id="expiry"
                      type="text"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={handleExpiryChange}
                      className="h-12 border-[#E5E5EA] focus:border-[#00D09C] focus:ring-[#00D09C]"
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv" className="text-[#2D2D44] font-semibold">
                      CVV
                    </Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={handleCvvChange}
                      className="h-12 border-[#E5E5EA] focus:border-[#00D09C] focus:ring-[#00D09C]"
                      maxLength={3}
                    />
                  </div>
                </div>
              </>
            )}

            {paymentMethod === 'upi' && (
              <div className="space-y-2">
                <Label htmlFor="upiId" className="text-[#2D2D44] font-semibold">
                  UPI ID
                </Label>
                <Input
                  id="upiId"
                  type="text"
                  placeholder="yourname@upi"
                  className="h-12 border-[#E5E5EA] focus:border-[#00D09C] focus:ring-[#00D09C]"
                />
                <p className="text-xs text-[#6C6C80]">Enter any UPI ID</p>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="space-y-2">
                <Label htmlFor="wallet" className="text-[#2D2D44] font-semibold">
                  Wallet
                </Label>
                <Select>
                  <SelectTrigger className="h-12 border-[#E5E5EA] focus:border-[#00D09C] focus:ring-[#00D09C]">
                    <SelectValue placeholder="Select wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paytm">Paytm</SelectItem>
                    <SelectItem value="phonepe">PhonePe</SelectItem>
                    <SelectItem value="gpay">Google Pay</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#6C6C80]">Select any wallet option</p>
              </div>
            )}

            {/* Info Note */}
            <div className="bg-[#E6FFF9] border border-[#00D09C] rounded-lg p-4">
              <p className="text-sm text-[#00B386]">
                <strong>Note:</strong> This is a demo payment system. Any card details will be accepted and payment will always succeed.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full h-12 bg-[#00D09C] hover:bg-[#00B386] text-white font-semibold rounded-lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                `Pay ₹${amount.toLocaleString()}`
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

