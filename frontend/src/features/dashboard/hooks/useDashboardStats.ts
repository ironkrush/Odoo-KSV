import { useQuery } from '@tanstack/react-query';
import { PurchaseOrder, Vendor } from '@/types';

export interface DashboardStats {
  metrics: {
    activeRfqs: { count: number; change: string; isPositive: boolean };
    pendingApprovals: { count: number; note: string };
    monthlySpend: { amount: string; change: string; isPositive: boolean };
    openInvoices: { count: number; note: string };
  };
  recentPurchaseOrders: PurchaseOrder[];
  topVendors: Vendor[];
  chartData: { month: string; spend: number }[];
  pendingApprovalsList: { id: string; title: string; requester: string; status: string }[];
}

const MOCK_STATS: DashboardStats = {
  metrics: {
    activeRfqs: { count: 24, change: '+12%', isPositive: true },
    pendingApprovals: { count: 12, note: 'Needs immediate action' },
    monthlySpend: { amount: '$1.2M', change: '-3%', isPositive: false },
    openInvoices: { count: 45, note: 'Totaling $450k' },
  },
  recentPurchaseOrders: [
    { id: 'po-1', poNumber: 'PO-2026-089', vendorName: 'Acme Corp', amount: '$12,450.00', status: 'APPROVED', createdAt: '2026-06-05' },
    { id: 'po-2', poNumber: 'PO-2026-088', vendorName: 'TechSupplies Inc', amount: '$4,200.00', status: 'APPROVED', createdAt: '2026-06-04' },
    { id: 'po-3', poNumber: 'PO-2026-087', vendorName: 'Global Logistics', amount: '$8,900.00', status: 'PROCESSING', createdAt: '2026-06-03' },
    { id: 'po-4', poNumber: 'PO-2026-086', vendorName: 'Office Essentials', amount: '$1,150.00', status: 'APPROVED', createdAt: '2026-06-01' },
  ],
  topVendors: [
    { id: 'v-1', name: 'Acme Corp', category: 'Hardware', ytdSpend: '$450k', rating: 4.9, status: 'ACTIVE', email: 'info@acme.com', phone: '123-456' },
    { id: 'v-2', name: 'TechSupplies Inc', category: 'Software', ytdSpend: '$320k', rating: 4.7, status: 'ACTIVE', email: 'sales@techsupplies.com', phone: '234-567' },
    { id: 'v-3', name: 'Global Logistics', category: 'Shipping', ytdSpend: '$280k', rating: 4.5, status: 'ACTIVE', email: 'ops@globallogistics.com', phone: '345-678' },
    { id: 'v-4', name: 'Office Essentials', category: 'Supplies', ytdSpend: '$150k', rating: 4.8, status: 'ACTIVE', email: 'support@officeessentials.com', phone: '456-789' },
  ],
  chartData: [
    { month: 'Dec', spend: 120000 },
    { month: 'Jan', spend: 180000 },
    { month: 'Feb', spend: 240000 },
    { month: 'Mar', spend: 160000 },
    { month: 'Apr', spend: 320000 },
    { month: 'May', spend: 200000 },
  ],
  pendingApprovalsList: [
    { id: 'a-1', title: 'IT Equipment - Q3', requester: 'John Doe', status: 'PENDING' },
    { id: 'a-2', title: 'Marketing Campaign', requester: 'Sarah Lee', status: 'PENDING' },
  ]
};

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 800));
      return MOCK_STATS;
    },
  });
};
