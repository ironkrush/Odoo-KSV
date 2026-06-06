import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateVendor } from '../hooks/useVendors';

const vendorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number must be valid'),
  address: z.string().optional(),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

interface AddVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddVendorDialog: React.FC<AddVendorDialogProps> = ({ open, onOpenChange }) => {
  const createVendorMutation = useCreateVendor();
  
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: '',
      category: '',
      email: '',
      phone: '',
      address: '',
    }
  });

  const onSubmit = async (data: VendorFormValues) => {
    try {
      await createVendorMutation.mutateAsync(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create vendor:', error);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop Blur Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300" />
        
        {/* Modal Content Body */}
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[480px] bg-white border border-border-main rounded-card shadow-lg p-comfortable focus:outline-none transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div>
              <Dialog.Title className="text-title-md font-semibold text-text-primary">
                Add New Vendor
              </Dialog.Title>
              <Dialog.Description className="text-body-sm text-text-secondary mt-1">
                Enter vendor contact details to register them in the portal.
              </Dialog.Description>
            </div>
            
            <Dialog.Close className="p-1 rounded-full text-text-secondary hover:bg-surface-container transition-colors">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input 
              label="Vendor Name"
              placeholder="e.g. Acme Corporation"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input 
              label="Category"
              placeholder="e.g. Hardware, Software, Raw Materials"
              error={errors.category?.message}
              {...register('category')}
            />

            <Input 
              label="Email Address"
              type="email"
              placeholder="sales@acme.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input 
              label="Phone Number"
              placeholder="e.g. +1 (555) 019-2834"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input 
              label="Office Address"
              placeholder="e.g. 123 Main St, New York, NY"
              error={errors.address?.message}
              {...register('address')}
            />

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border-soft">
              <Dialog.Close asChild>
                <Button variant="ghost" type="button">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button 
                variant="primary" 
                type="submit"
                isLoading={createVendorMutation.isPending}
              >
                Register Vendor
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
