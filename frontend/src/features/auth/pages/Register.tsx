import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthActions } from '../hooks/useAuthActions';
import { ShieldCheck } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading, error: apiError } = useAuthActions();
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    const success = await register(name, email);
    if (success) {
      navigate('/');
    }
  };

  const error = localError || apiError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-[420px]">
        {/* Brand Banner */}
        <div className="flex flex-col items-center mb-loose text-center">
          <div className="w-12 h-12 rounded-xl bg-tint-green flex items-center justify-center text-primary mb-3 shadow-[0_2px_8px_rgba(33,182,111,0.15)]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-headline-lg font-bold text-text-primary tracking-tight">VendorBridge</h1>
          <p className="text-caption text-text-muted mt-0.5">Premium B2B Procurement Portal</p>
        </div>

        {/* Register Card */}
        <Card className="shadow-lg border-border-main p-8">
          <div className="text-center mb-6">
            <h2 className="text-title-md font-semibold text-text-primary">Create Account</h2>
            <p className="text-body-sm text-text-secondary mt-1">Get started with procurement management</p>
          </div>

          {error && (
            <div className="p-3 mb-4 text-body-sm text-status-red bg-status-red-soft rounded-input border border-status-red/20 font-medium text-left">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input 
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aman Patel"
              required
            />

            <Input 
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@vendorbridge.com"
              required
            />

            <Input 
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Input 
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button 
              type="submit" 
              className="w-full mt-2" 
              isLoading={isLoading}
            >
              Sign Up
            </Button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-border-soft">
            <p className="text-body-sm text-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
