import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Vendor } from '@/types';

// In-memory array to simulate local modifications before API connection
let MOCK_VENDORS_DB: Vendor[] = [
  { id: 'v-1', name: 'Acme Corp', category: 'Hardware', ytdSpend: '$450,000.00', rating: 4.9, status: 'ACTIVE', email: 'sales@acme.com', phone: '123-456-7890', address: '123 Acme Way' },
  { id: 'v-2', name: 'TechSupplies Inc', category: 'Software', ytdSpend: '$320,000.00', rating: 4.7, status: 'ACTIVE', email: 'billing@techsupplies.com', phone: '234-567-8901', address: '456 Silicon Alley' },
  { id: 'v-3', name: 'Global Logistics', category: 'Shipping', ytdSpend: '$280,000.00', rating: 4.5, status: 'ACTIVE', email: 'ops@globallogistics.com', phone: '345-678-9012', address: '789 Route 66' },
  { id: 'v-4', name: 'Office Essentials', category: 'Supplies', ytdSpend: '$150,000.00', rating: 4.8, status: 'ACTIVE', email: 'support@officeessentials.com', phone: '456-789-0123', address: '101 Paper Road' },
  { id: 'v-5', name: 'Nexus Chemicals', category: 'Raw Materials', ytdSpend: '$95,000.00', rating: 4.2, status: 'ACTIVE', email: 'info@nexuschem.com', phone: '567-890-1234', address: '202 Lab Circle' },
  { id: 'v-6', name: 'Apex Builders', category: 'Construction', ytdSpend: '$0.00', rating: 4.0, status: 'INACTIVE', email: 'contact@apexbuilders.com', phone: '678-901-2345', address: '303 Concrete Ave' },
];

export const useVendors = () => {
  return useQuery<Vendor[]>({
    queryKey: ['vendors'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate api response delay
      return [...MOCK_VENDORS_DB];
    },
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newVendor: Omit<Vendor, 'id' | 'ytdSpend' | 'rating' | 'status'>) => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate api response delay

      const created: Vendor = {
        ...newVendor,
        id: `v-${Math.random().toString(36).substr(2, 9)}`,
        ytdSpend: '$0.00',
        rating: 5.0, // Default rating for new vendor
        status: 'ACTIVE',
      };

      MOCK_VENDORS_DB = [created, ...MOCK_VENDORS_DB];
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};
