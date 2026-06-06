import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, ArrowRight, Check, Loader2, Info } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useVendors } from '@/features/vendors/hooks/useVendors';
import { useCreateRfq } from '../hooks/useRfq';

// Validation schemas for multi-step fields
const rfqDetailsSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  amount: z.number().min(1, 'Estimated budget must be greater than 0'),
});

type RfqDetailsValues = z.infer<typeof rfqDetailsSchema>;

export const CreateRfq: React.FC = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { data: vendors, isLoading: isVendorsLoading } = useVendors();
  const createRfqMutation = useCreateRfq();

  // Step 1 Form state
  const {
    register: registerDetails,
    handleSubmit: handleSubmitDetails,
    getValues: getDetailsValues,
    formState: { errors: detailsErrors }
  } = useForm<RfqDetailsValues>({
    resolver: zodResolver(rfqDetailsSchema),
    defaultValues: { title: '', description: '', amount: 0 }
  });

  // Step 2 Form state (Vendors multi-select list)
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [vendorSelectionError, setVendorSelectionError] = useState<string | null>(null);

  const handleToggleVendor = (vendorName: string) => {
    setVendorSelectionError(null);
    if (selectedVendors.includes(vendorName)) {
      setSelectedVendors(selectedVendors.filter((v) => v !== vendorName));
    } else {
      setSelectedVendors([...selectedVendors, vendorName]);
    }
  };

  const handleNextStep1 = () => {
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (selectedVendors.length === 0) {
      setVendorSelectionError('Please select at least one vendor to invite.');
      return;
    }
    setStep(3);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleFinalSubmit = async () => {
    const details = getDetailsValues();
    try {
      await createRfqMutation.mutateAsync({
        title: details.title,
        description: details.description,
        amount: details.amount,
        invitedVendors: selectedVendors,
      });
      navigate('/rfqs');
    } catch (err) {
      console.error('Failed to create RFQ:', err);
    }
  };

  return (
    <div className="max-w-[720px] mx-auto flex flex-col gap-comfortable">
      {/* Page Header */}
      <div className="flex items-center gap-3 border-b border-border-soft pb-4 text-left">
        <button 
          onClick={() => navigate('/rfqs')}
          className="p-2 rounded-full text-text-secondary hover:bg-surface-container transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-headline-lg font-bold text-text-primary tracking-tight">Create RFQ</h1>
          <p className="text-body-sm text-text-secondary mt-0.5">Formulate purchase request guidelines and solicit bids.</p>
        </div>
      </div>

      {/* Progress Wizard Steps Indicator */}
      <div className="flex justify-between items-center px-comfortable mb-2">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-body-sm font-bold border transition-all ${
              step === num
                ? 'bg-primary border-primary text-white shadow-sm'
                : step > num
                  ? 'bg-tint-green border-primary-container text-primary'
                  : 'bg-white border-border-main text-text-secondary'
            }`}>
              {step > num ? <Check className="h-4 w-4" /> : num}
            </div>
            <span className={`text-body-sm font-medium hidden sm:inline ${
              step === num ? 'text-primary font-bold' : 'text-text-secondary'
            }`}>
              {num === 1 ? 'Specifications' : num === 2 ? 'Invite Vendors' : 'Review & Submit'}
            </span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="shadow-md p-8 text-left">
        {/* STEP 1: Specs fields */}
        {step === 1 && (
          <form onSubmit={handleSubmitDetails(handleNextStep1)} className="flex flex-col gap-5">
            <h2 className="text-title-md font-semibold text-text-primary border-b border-border-soft pb-2 mb-2">
              RFQ Specifications
            </h2>
            
            <Input 
              label="Purchase Request Title"
              placeholder="e.g. Server Hardware Upgrades - Q3"
              error={detailsErrors.title?.message}
              {...registerDetails('title')}
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-label-md font-semibold text-text-secondary">
                Specifications Description
              </label>
              <textarea
                placeholder="Detail technical requirements, quantity limits, shipping expectations, etc."
                rows={5}
                className={`w-full p-3 bg-white border rounded-input font-body-sm text-body-sm text-text-primary placeholder:text-text-disabled transition-all duration-200 outline-none focus:border-primary-container focus:ring-2 focus:ring-tint-green ${
                  detailsErrors.description ? 'border-status-red focus:border-status-red' : 'border-border-main'
                }`}
                {...registerDetails('description')}
              />
              {detailsErrors.description && (
                <span className="text-[12px] text-status-red font-medium mt-0.5">
                  {detailsErrors.description.message}
                </span>
              )}
            </div>

            <Input 
              label="Estimated Budget ($)"
              type="number"
              placeholder="e.g. 50000"
              error={detailsErrors.amount?.message}
              {...registerDetails('amount', { valueAsNumber: true })}
            />

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border-soft">
              <Button 
                variant="ghost" 
                type="button" 
                onClick={() => navigate('/rfqs')}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Next Step
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: Vendor Selection */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-title-md font-semibold text-text-primary border-b border-border-soft pb-2 mb-2">
              Invite Bidding Vendors
            </h2>

            {vendorSelectionError && (
              <div className="p-3 text-body-sm text-status-red bg-status-red-soft rounded-input border border-status-red/20 font-medium">
                {vendorSelectionError}
              </div>
            )}

            {isVendorsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-2">
                {vendors?.filter(v => v.status === 'ACTIVE').map((vendor) => {
                  const isChecked = selectedVendors.includes(vendor.name);
                  return (
                    <div 
                      key={vendor.id}
                      onClick={() => handleToggleVendor(vendor.name)}
                      className={`flex items-center justify-between p-3 border rounded-input cursor-pointer transition-all duration-200 ${
                        isChecked 
                          ? 'border-primary bg-tint-green/40 shadow-sm'
                          : 'border-border-main hover:border-border-strong hover:bg-surface-bright'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                          isChecked ? 'bg-primary border-primary text-white' : 'border-border-strong bg-white'
                        }`}>
                          {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="text-body-sm font-semibold text-text-primary">{vendor.name}</p>
                          <p className="text-caption text-text-secondary mt-0.5">{vendor.category}</p>
                        </div>
                      </div>
                      <div className="text-right text-[12px] text-text-secondary">
                        <p>Rating: <span className="font-semibold text-primary">{vendor.rating} ★</span></p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between gap-3 mt-4 pt-4 border-t border-border-soft">
              <Button 
                variant="ghost" 
                type="button" 
                onClick={handleBack}
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Back
              </Button>
              <Button 
                variant="primary" 
                type="button" 
                onClick={handleNextStep2}
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Next Step
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Final confirmation review */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-title-md font-semibold text-text-primary border-b border-border-soft pb-2 mb-2">
              Review and Submit RFQ
            </h2>

            <div className="flex flex-col gap-4 bg-background/50 border border-border-soft p-comfortable rounded-input text-body-sm">
              <div>
                <p className="text-caption font-semibold text-text-secondary uppercase tracking-wider">Purchase Title</p>
                <p className="text-body-md font-semibold text-text-primary mt-0.5">{getDetailsValues().title}</p>
              </div>

              <div>
                <p className="text-caption font-semibold text-text-secondary uppercase tracking-wider">Estimated Budget</p>
                <p className="text-body-md font-bold text-primary mt-0.5">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(getDetailsValues().amount)}
                </p>
              </div>

              <div>
                <p className="text-caption font-semibold text-text-secondary uppercase tracking-wider">Detailed Specifications</p>
                <p className="text-text-secondary mt-1 whitespace-pre-wrap leading-relaxed">{getDetailsValues().description}</p>
              </div>

              <div>
                <p className="text-caption font-semibold text-text-secondary uppercase tracking-wider mb-2">Invited Bidders</p>
                <div className="flex flex-wrap gap-2">
                  {selectedVendors.map((vendor) => (
                    <Badge key={vendor} variant="success">
                      {vendor}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-status-amber-soft border border-status-amber/20 rounded-input flex items-start gap-3 text-body-sm text-text-secondary">
              <Info className="h-5 w-5 text-status-amber shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Submitting this RFQ will generate individual bid request tickets. Selected vendors will be notified via email to upload their quotations.
              </p>
            </div>

            <div className="flex justify-between gap-3 mt-4 pt-4 border-t border-border-soft">
              <Button 
                variant="ghost" 
                type="button" 
                onClick={handleBack}
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Back
              </Button>
              <Button 
                variant="primary" 
                type="button" 
                onClick={handleFinalSubmit}
                isLoading={createRfqMutation.isPending}
              >
                Submit RFQ Request
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
