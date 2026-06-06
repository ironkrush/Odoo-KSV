export interface User {
  id: string;
  name: string;
  email: string;
  role: 'BUYER' | 'APPROVER' | 'ADMIN';
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  ytdSpend: string;
  rating: number;
  status: 'ACTIVE' | 'INACTIVE';
  email: string;
  phone: string;
  address?: string;
}

export type RfqStatus = 'DRAFT' | 'SENT' | 'UNDER_REVIEW' | 'CLOSED';

export interface Rfq {
  id: string;
  title: string;
  description: string;
  reqBy: string;
  amount: string;
  status: RfqStatus;
  createdAt: string;
  vendorCount: number;
}

export interface Quotation {
  id: string;
  rfqId: string;
  vendorName: string;
  vendorRating: number;
  amount: number;
  deliveryDays: number;
  paymentTerms: string;
  status: 'PENDING' | 'AWARDED' | 'REJECTED';
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  amount: string;
  status: 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}
