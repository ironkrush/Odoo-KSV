export interface RFQ {
  id: string;
  title: string;
  vendorCategory: string;
  status: 'Draft' | 'Sent' | 'Received' | 'Closed';
  date: string;
  itemsCount: number;
}

export interface Quotation {
  id: string;
  rfqId: string;
  vendorName: string;
  amount: number;
  status: 'Pending Review' | 'Approved' | 'Rejected';
  deliveryTimeDays: number;
  date: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number; // e.g. 4.8
  status: 'Active' | 'Onboarding' | 'Inactive';
  contactEmail: string;
}

export interface PurchaseOrder {
  id: string;
  rfqId: string;
  vendorName: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Completed';
  date: string;
}

export interface Invoice {
  id: string;
  poId: string;
  vendorName: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  date: string;
}

export interface ActivityItem {
  id: string;
  type: 'rfq' | 'quotation' | 'po' | 'invoice' | 'vendor';
  title: string;
  timestamp: string;
  detail?: string;
}

export interface SpendRecord {
  month: string;
  spend: number;
}

export interface VendorPerformance {
  name: string;
  rating: number; // rating out of 5 or score
  onTimeDelivery: number; // percentage, e.g. 98
  qualityScore: number; // percentage, e.g. 95
  totalSpend: number;
}

export interface KPIMetric {
  title: string;
  value: string;
  delta: number;
  subtitle: string;
}

