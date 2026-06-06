import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ClipboardCheck, 
  Wallet, 
  Receipt, 
  Plus, 
  UserPlus, 
  TrendingUp, 
  TrendingDown, 
  Star,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/Table';
import { SpendChart } from '../components/SpendChart';
import { useDashboardStats } from '../hooks/useDashboardStats';

export const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useDashboardStats();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-container" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center text-status-red">
        <p className="font-semibold">Failed to load dashboard data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-comfortable">
      {/* Welcome Greeting Banner */}
      <div className="bg-surface-card rounded-card border border-border-main p-comfortable shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex justify-between items-center bg-gradient-to-r from-surface-card to-tint-green/30 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-headline-xl font-bold text-text-primary tracking-tight">Good Morning, Aman</h1>
          <p className="text-body-md text-text-secondary">Overview of procurement operations.</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 pointer-events-none bg-gradient-to-l from-primary-container to-transparent" />
      </div>

      {/* KPI Row widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-comfortable">
        {/* KPI Card: Active RFQs */}
        <Card className="flex flex-col gap-2 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-label-md font-semibold text-text-secondary uppercase tracking-wider">Active RFQs</span>
            <div className="w-8 h-8 rounded-full bg-tint-green flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <FileText className="h-[16px] w-[16px]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-headline-xl font-bold text-text-primary">{data.metrics.activeRfqs.count}</span>
            <span className="text-caption font-semibold text-primary flex items-center bg-tint-green px-2 py-0.5 rounded-full">
              <TrendingUp className="h-[12px] w-[12px] mr-0.5" />
              {data.metrics.activeRfqs.change}
            </span>
          </div>
        </Card>

        {/* KPI Card: Pending Approvals */}
        <Card className="flex flex-col gap-2 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-label-md font-semibold text-text-secondary uppercase tracking-wider">Pending Approvals</span>
            <div className="w-8 h-8 rounded-full bg-status-amber-soft flex items-center justify-center text-status-amber group-hover:scale-110 transition-transform">
              <ClipboardCheck className="h-[16px] w-[16px]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-headline-xl font-bold text-text-primary">{data.metrics.pendingApprovals.count}</span>
            <span className="text-caption text-text-secondary font-medium">{data.metrics.pendingApprovals.note}</span>
          </div>
        </Card>

        {/* KPI Card: Monthly Spend */}
        <Card className="flex flex-col gap-2 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-label-md font-semibold text-text-secondary uppercase tracking-wider">Monthly Spend</span>
            <div className="w-8 h-8 rounded-full bg-accent-blue-soft flex items-center justify-center text-accent-blue group-hover:scale-110 transition-transform">
              <Wallet className="h-[16px] w-[16px]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-headline-xl font-bold text-text-primary">{data.metrics.monthlySpend.amount}</span>
            <span className="text-caption font-semibold text-status-red flex items-center bg-status-red-soft px-2 py-0.5 rounded-full">
              <TrendingDown className="h-[12px] w-[12px] mr-0.5" />
              {data.metrics.monthlySpend.change}
            </span>
          </div>
        </Card>

        {/* KPI Card: Open Invoices */}
        <Card className="flex flex-col gap-2 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-label-md font-semibold text-text-secondary uppercase tracking-wider">Open Invoices</span>
            <div className="w-8 h-8 rounded-full bg-status-purple-soft flex items-center justify-center text-status-purple group-hover:scale-110 transition-transform">
              <Receipt className="h-[16px] w-[16px]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-headline-xl font-bold text-text-primary">{data.metrics.openInvoices.count}</span>
            <span className="text-caption text-text-secondary font-medium">{data.metrics.openInvoices.note}</span>
          </div>
        </Card>
      </div>

      {/* Spend Analytics & Quick Tools Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-comfortable">
        {/* Spend Chart widget */}
        <Card className="lg:col-span-8 flex flex-col p-0 overflow-hidden">
          <div className="p-comfortable border-b border-border-soft flex justify-between items-center">
            <h2 className="text-title-md font-semibold text-text-primary">Spend Overview</h2>
            <select className="h-8 rounded border border-border-main bg-white px-2 font-body-sm text-body-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none">
              <option>Last 6 Months</option>
              <option>Year to Date</option>
            </select>
          </div>
          <div className="p-comfortable flex-1">
            <SpendChart data={data.chartData} />
          </div>
        </Card>

        {/* Quick actions and approvals queue list */}
        <div className="lg:col-span-4 flex flex-col gap-comfortable">
          {/* Quick Actions Panel */}
          <Card className="p-comfortable">
            <h2 className="text-title-md font-semibold text-text-primary mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-3">
              <Button 
                variant="primary" 
                className="w-full justify-start"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => navigate('/rfqs/create')}
              >
                Create RFQ
              </Button>
              <Button 
                variant="secondary" 
                className="w-full justify-start"
                icon={<UserPlus className="h-4 w-4" />}
                onClick={() => navigate('/vendors')}
              >
                Add Vendor
              </Button>
            </div>
          </Card>

          {/* Pending Approval Pipeline */}
          <Card className="p-comfortable flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-title-md font-semibold text-text-primary">Approval Pipeline</h2>
              <button 
                onClick={() => navigate('/approvals')}
                className="text-primary hover:underline text-body-sm font-semibold"
              >
                View All
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {data.pendingApprovalsList.map((app) => (
                <div key={app.id} className="flex items-center justify-between border-b border-border-soft pb-3 last:border-0 last:pb-0">
                  <div className="text-left">
                    <p className="text-body-sm font-semibold text-text-primary">{app.title}</p>
                    <p className="text-caption text-text-secondary mt-0.5">Req: {app.requester}</p>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Data tables sections: Purchase orders & Top vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-comfortable">
        {/* Recent Purchase Orders */}
        <Card className="p-0 overflow-hidden flex flex-col">
          <div className="p-comfortable border-b border-border-soft flex justify-between items-center bg-background/50">
            <h2 className="text-title-md font-semibold text-text-primary">Recent Purchase Orders</h2>
            <button className="text-text-secondary hover:text-primary transition-colors text-body-sm font-semibold">
              View All
            </button>
          </div>
          <Table>
            <TableHeader>
              <tr>
                <TableHead>PO Number</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {data.recentPurchaseOrders.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-semibold">{po.poNumber}</TableCell>
                  <TableCell>{po.vendorName}</TableCell>
                  <TableCell>{po.amount}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={po.status === 'APPROVED' ? 'success' : 'warning'}>
                      {po.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Top Vendors */}
        <Card className="p-0 overflow-hidden flex flex-col">
          <div className="p-comfortable border-b border-border-soft flex justify-between items-center bg-background/50">
            <h2 className="text-title-md font-semibold text-text-primary">Top Vendors</h2>
            <button 
              onClick={() => navigate('/vendors')}
              className="text-text-secondary hover:text-primary transition-colors text-body-sm font-semibold"
            >
              View All
            </button>
          </div>
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>YTD Spend</TableHead>
                <TableHead className="text-right">Rating</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {data.topVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-surface-container flex items-center justify-center text-caption font-bold text-text-secondary uppercase">
                        {vendor.name.charAt(0)}
                      </div>
                      {vendor.name}
                    </div>
                  </TableCell>
                  <TableCell>{vendor.category}</TableCell>
                  <TableCell>{vendor.ytdSpend}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 text-primary">
                      <Star className="h-4 w-4 fill-status-amber text-status-amber" />
                      <span className="font-semibold">{vendor.rating}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};
