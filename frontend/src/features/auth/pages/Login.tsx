import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthActions } from '../hooks/useAuthActions';
import { ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@vendorbridge.com');
  const [password, setPassword] = useState('password');
  const { login, isLoading, error } = useAuthActions();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };

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

        {/* Login Form Card */}
        <Card className="shadow-lg border-border-main p-8">
          <div className="text-center mb-6">
            <h2 className="text-title-md font-semibold text-text-primary">Welcome Back</h2>
            <p className="text-body-sm text-text-secondary mt-1">Sign in to manage your procurement pipeline</p>
          </div>

          {error && (
            <div className="p-3 mb-4 text-body-sm text-status-red bg-status-red-soft rounded-input border border-status-red/20 font-medium text-left">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

            <div className="text-right">
              <a href="#forgot" className="text-body-sm text-primary hover:underline font-medium">
                Forgot password?
              </a>
            </div>

            <Button 
              type="submit" 
              className="w-full mt-2" 
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-border-soft">
            <p className="text-body-sm text-text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
