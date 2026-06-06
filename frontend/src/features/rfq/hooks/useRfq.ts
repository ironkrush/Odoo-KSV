import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Rfq, Quotation } from '@/types';

// Local Mock Database for RFQs
let MOCK_RFQS: Rfq[] = [
  { id: 'RFQ-2026-001', title: 'IT Hardware Upgrade - Q3', description: 'Procurement of high-performance laptops and server racks for team expansion.', reqBy: 'John Doe', amount: '$120,000.00', status: 'UNDER_REVIEW', createdAt: '2026-06-01', vendorCount: 3 },
  { id: 'RFQ-2026-002', title: 'Office Furniture Procurement', description: 'Ergonomic chairs, desks, and collaborative layout installations.', reqBy: 'Aman Patel', amount: '$45,000.00', status: 'SENT', createdAt: '2026-06-03', vendorCount: 2 },
  { id: 'RFQ-2026-003', title: 'Chemical Raw Materials', description: 'Bulk sourcing of specialty chemical additives for plastic production lines.', reqBy: 'Sarah Lee', amount: '$210,000.00', status: 'DRAFT', createdAt: '2026-06-04', vendorCount: 0 },
  { id: 'RFQ-2026-004', title: 'Freight Logistics Services', description: 'Annual contract for interstate transport and parcel delivery routing.', reqBy: 'Aman Patel', amount: '$85,000.00', status: 'CLOSED', createdAt: '2026-05-15', vendorCount: 4 },
];

// Local Mock Database for Quotations
let MOCK_QUOTATIONS: Record<string, Quotation[]> = {
  'RFQ-2026-001': [
    { id: 'q-1', rfqId: 'RFQ-2026-001', vendorName: 'Acme Corp', vendorRating: 4.9, amount: 115000, deliveryDays: 10, paymentTerms: 'Net 30', status: 'PENDING' },
    { id: 'q-2', rfqId: 'RFQ-2026-001', vendorName: 'TechSupplies Inc', vendorRating: 4.7, amount: 122000, deliveryDays: 7, paymentTerms: 'Net 15', status: 'PENDING' },
    { id: 'q-3', rfqId: 'RFQ-2026-001', vendorName: 'Global Tech Solution', vendorRating: 4.3, amount: 118000, deliveryDays: 14, paymentTerms: 'Net 45', status: 'PENDING' },
  ],
  'RFQ-2026-002': [
    { id: 'q-4', rfqId: 'RFQ-2026-002', vendorName: 'Office Essentials', vendorRating: 4.8, amount: 43500, deliveryDays: 15, paymentTerms: 'Net 30', status: 'PENDING' },
    { id: 'q-5', rfqId: 'RFQ-2026-002', vendorName: 'Apex Builders', vendorRating: 4.0, amount: 48000, deliveryDays: 10, paymentTerms: 'Net 10', status: 'PENDING' },
  ]
};

export const useRfqs = () => {
  return useQuery<Rfq[]>({
    queryKey: ['rfqs'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return [...MOCK_RFQS];
    },
  });
};

export const useRfqDetails = (rfqId: string | undefined) => {
  return useQuery<Rfq | null>({
    queryKey: ['rfq', rfqId],
    queryFn: async () => {
      if (!rfqId) return null;
      await new Promise((resolve) => setTimeout(resolve, 500));
      const match = MOCK_RFQS.find(r => r.id === rfqId);
      return match || null;
    },
    enabled: !!rfqId,
  });
};

export const useQuotations = (rfqId: string | undefined) => {
  return useQuery<Quotation[]>({
    queryKey: ['quotations', rfqId],
    queryFn: async () => {
      if (!rfqId) return [];
      await new Promise((resolve) => setTimeout(resolve, 600));
      return MOCK_QUOTATIONS[rfqId] || [];
    },
    enabled: !!rfqId,
  });
};

export const useCreateRfq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRfq: { title: string; description: string; amount: number; invitedVendors: string[] }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });

      const created: Rfq = {
        id: `RFQ-2026-0${MOCK_RFQS.length + 1}`,
        title: newRfq.title,
        description: newRfq.description,
        reqBy: 'Aman Patel',
        amount: formatter.format(newRfq.amount),
        status: 'SENT', // Becomes active/sent immediately
        createdAt: new Date().toISOString().split('T')[0],
        vendorCount: newRfq.invitedVendors.length,
      };

      MOCK_RFQS = [created, ...MOCK_RFQS];
      
      // Initialize mock quotations for this RFQ if vendors were selected
      if (newRfq.invitedVendors.length > 0) {
        MOCK_QUOTATIONS[created.id] = newRfq.invitedVendors.map((vendor, idx) => ({
          id: `q-new-${Math.random().toString(36).substr(2, 9)}`,
          rfqId: created.id,
          vendorName: vendor,
          vendorRating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
          amount: Math.round(newRfq.amount * (0.9 + idx * 0.05)),
          deliveryDays: 5 + idx * 3,
          paymentTerms: 'Net 30',
          status: 'PENDING'
        }));
      }

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
    },
  });
};

export const useAwardQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rfqId, quotationId }: { rfqId: string; quotationId: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Award the selected quote and reject others
      if (MOCK_QUOTATIONS[rfqId]) {
        MOCK_QUOTATIONS[rfqId] = MOCK_QUOTATIONS[rfqId].map((q) => {
          if (q.id === quotationId) {
            return { ...q, status: 'AWARDED' };
          }
          return { ...q, status: 'REJECTED' };
        });
      }

      // Mark the parent RFQ as CLOSED
      MOCK_RFQS = MOCK_RFQS.map((r) => {
        if (r.id === rfqId) {
          return { ...r, status: 'CLOSED' };
        }
        return r;
      });

      return { rfqId, quotationId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['rfq', data.rfqId] });
      queryClient.invalidateQueries({ queryKey: ['quotations', data.rfqId] });
    },
  });
};
