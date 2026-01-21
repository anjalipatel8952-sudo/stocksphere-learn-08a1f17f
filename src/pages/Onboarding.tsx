import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Wallet, TrendingUp, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';

const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters');
const balanceSchema = z.number().min(10000, 'Minimum balance is ₹10,000').max(10000000, 'Maximum balance is ₹1,00,00,000');

const PRESET_BALANCES = [
  { label: '₹1 Lakh', value: 100000 },
  { label: '₹5 Lakh', value: 500000 },
  { label: '₹10 Lakh', value: 1000000 },
  { label: '₹25 Lakh', value: 2500000 },
];

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [initialBalance, setInitialBalance] = useState(1000000);
  const [customBalance, setCustomBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; balance?: string }>({});
  
  const { user, profile, updateProfile, updateWalletBalance } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (profile?.onboarding_completed) {
      navigate('/');
    }
  }, [user, profile, navigate]);

  const validateStep1 = () => {
    try {
      nameSchema.parse(fullName.trim());
      setErrors({});
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors({ name: e.errors[0].message });
      }
      return false;
    }
  };

  const validateStep2 = () => {
    const balance = customBalance ? parseInt(customBalance) : initialBalance;
    try {
      balanceSchema.parse(balance);
      setErrors({});
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors({ balance: e.errors[0].message });
      }
      return false;
    }
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleComplete = async () => {
    if (!validateStep2()) return;
    
    setLoading(true);
    const finalBalance = customBalance ? parseInt(customBalance) : initialBalance;

    try {
      // Update profile
      const { error: profileError } = await updateProfile({
        full_name: fullName.trim(),
        onboarding_completed: true
      });

      if (profileError) {
        toast.error('Failed to save profile');
        return;
      }

      // Update wallet balance
      const { error: walletError } = await updateWalletBalance(finalBalance);

      if (walletError) {
        toast.error('Failed to set up wallet');
        return;
      }

      toast.success('Welcome to StockSphere! 🎉');
      navigate('/');
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Welcome to StockSphere</h1>
          <p className="text-muted-foreground mt-2">Let's set up your trading account</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="font-medium">Profile</span>
          </div>
          <div className="w-12 h-0.5 bg-border" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
              2
            </div>
            <span className="font-medium">Wallet</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl p-6">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">What should we call you?</h2>
                <p className="text-muted-foreground text-sm mt-1">This name will appear on your profile</p>
              </div>

              <div>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="text-center text-lg py-6"
                  autoFocus
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-2 text-center">{errors.name}</p>
                )}
              </div>

              <Button
                onClick={handleNext}
                className="w-full"
                disabled={!fullName.trim()}
              >
                Continue
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Wallet className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Set Your Virtual Balance</h2>
                <p className="text-muted-foreground text-sm mt-1">Choose how much virtual money to start with</p>
              </div>

              {/* Preset Amounts */}
              <div className="grid grid-cols-2 gap-3">
                {PRESET_BALANCES.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => {
                      setInitialBalance(preset.value);
                      setCustomBalance('');
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      initialBalance === preset.value && !customBalance
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="font-bold text-lg">{preset.label}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(preset.value)}</p>
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Or enter custom amount</label>
                <Input
                  type="number"
                  value={customBalance}
                  onChange={(e) => setCustomBalance(e.target.value)}
                  placeholder="Enter amount (₹10,000 - ₹1,00,00,000)"
                  min={10000}
                  max={10000000}
                />
                {errors.balance && (
                  <p className="text-sm text-destructive mt-2">{errors.balance}</p>
                )}
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-secondary/50">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Starting Balance</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(customBalance ? parseInt(customBalance) || 0 : initialBalance)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Start Trading'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Demo Notice */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          💡 This is virtual money for learning purposes only
        </p>
      </motion.div>
    </div>
  );
};

export default Onboarding;
