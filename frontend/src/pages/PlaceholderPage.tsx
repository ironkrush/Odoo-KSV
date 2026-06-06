import React from 'react';
import { Card } from '@/components/ui/Card';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ 
  title, 
  description = 'This section of the VendorBridge procurement portal is currently under active development. Connection to related backend API points is coming soon.' 
}) => {
  return (
    <div className="flex flex-col gap-comfortable text-left">
      <div className="border-b border-border-soft pb-comfortable">
        <h1 className="text-headline-xl font-bold text-text-primary tracking-tight">{title}</h1>
        <p className="text-body-md text-text-secondary mt-1">SaaS Module Workspace</p>
      </div>

      <Card className="py-16 text-center text-text-secondary flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-tint-green flex items-center justify-center text-primary">
          <Construction className="h-8 w-8" />
        </div>
        <div className="max-w-[480px]">
          <h2 className="text-title-md font-bold text-text-primary">Module Under Construction</h2>
          <p className="text-body-sm text-text-secondary mt-2 leading-relaxed">
            {description}
          </p>
        </div>
      </Card>
    </div>
  );
};
export default PlaceholderPage;
