import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  ArrowRight,
  Loader2,
  Users
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
import { useRfqs } from '../hooks/useRfq';

export const RfqList: React.FC = () => {
  const { data: rfqs, isLoading, error } = useRfqs();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-container" />
      </div>
    );
  }

  if (error || !rfqs) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center text-status-red">
        <p className="font-semibold">Failed to load Request for Quotations list.</p>
      </div>
    );
  }

  const statuses = ['ALL', 'DRAFT', 'SENT', 'UNDER_REVIEW', 'CLOSED'];

  const filteredRfqs = rfqs.filter((rfq) => {
    const matchesSearch = rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          rfq.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || rfq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'neutral';
      case 'SENT': return 'info';
      case 'UNDER_REVIEW': return 'warning';
      case 'CLOSED': return 'success';
      default: return 'neutral';
    }
  };

  return (
    <div className="flex flex-col gap-comfortable">
      {/* Page Header Section */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border-soft pb-comfortable">
        <div>
          <h1 className="text-headline-xl font-bold text-text-primary tracking-tight">Request for Quotations</h1>
          <p className="text-body-md text-text-secondary mt-1">Draft specifications, send requests to vendors, and compare bidding quotes.</p>
        </div>
        
        <Button 
          variant="primary" 
          icon={<Plus className="h-4 w-4" />}
          onClick={() => navigate('/rfqs/create')}
        >
          Create RFQ
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary h-4 w-4" />
          <input 
            type="text" 
            placeholder="Search RFQs by ID or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[40px] pl-10 pr-4 bg-background border border-border-main rounded-input font-body-sm text-body-sm text-text-primary focus:border-primary focus:ring-2 focus:ring-tint-green outline-none transition-all"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto py-1">
          <Filter className="h-4 w-4 text-text-muted hidden sm:block" />
          <div className="flex gap-2.5">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-caption font-semibold tracking-wider uppercase text-[11px] border transition-all ${
                  statusFilter === status
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white border-border-main text-text-secondary hover:border-border-strong hover:text-text-primary'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* RFQ Table */}
      {filteredRfqs.length === 0 ? (
        <Card className="py-12 text-center text-text-secondary">
          <FileText className="h-12 w-12 mx-auto text-text-disabled mb-3" />
          <p className="font-semibold text-body-md">No RFQs found matching the selected filters.</p>
          <p className="text-body-sm text-text-muted mt-1">Try creating a new RFQ to invite vendors.</p>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <tr>
              <TableHead>RFQ Reference</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Estimate Amount</TableHead>
              <TableHead>Creation Date</TableHead>
              <TableHead>Invited Bids</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {filteredRfqs.map((rfq) => (
              <TableRow key={rfq.id}>
                {/* Title */}
                <TableCell className="max-w-[280px]">
                  <p className="text-body-sm font-semibold text-text-primary">{rfq.title}</p>
                  <p className="text-[12px] text-text-secondary mt-0.5 truncate">{rfq.description}</p>
                  <p className="text-[11px] text-text-muted mt-1 font-mono">{rfq.id}</p>
                </TableCell>
                
                {/* Req By */}
                <TableCell>{rfq.reqBy}</TableCell>
                
                {/* Amount */}
                <TableCell className="font-semibold">{rfq.amount}</TableCell>
                
                {/* Created Date */}
                <TableCell>{rfq.createdAt}</TableCell>
                
                {/* Invited Bids count */}
                <TableCell>
                  <div className="flex items-center gap-1 text-text-secondary">
                    <Users className="h-4 w-4" />
                    <span>{rfq.vendorCount} Vendors</span>
                  </div>
                </TableCell>
                
                {/* Status */}
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(rfq.status)}>
                    {rfq.status.replace('_', ' ')}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  {rfq.status === 'UNDER_REVIEW' || rfq.status === 'CLOSED' || rfq.status === 'SENT' ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<ArrowRight className="h-3.5 w-3.5" />}
                      onClick={() => navigate(`/rfqs/${rfq.id}/compare`)}
                    >
                      Compare Bids
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.log('View RFQ specs')}
                    >
                      Edit Specifications
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
