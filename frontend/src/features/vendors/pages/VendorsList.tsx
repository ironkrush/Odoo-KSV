import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Mail, 
  Phone, 
  MapPin, 
  Loader2, 
  FileText 
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
import { useVendors } from '../hooks/useVendors';
import { AddVendorDialog } from '../components/AddVendorDialog';

export const VendorsList: React.FC = () => {
  const { data: vendors, isLoading, error } = useVendors();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-container" />
      </div>
    );
  }

  if (error || !vendors) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center text-status-red">
        <p className="font-semibold">Failed to load vendors list.</p>
      </div>
    );
  }

  // Get unique categories for filter options
  const categories = ['ALL', ...Array.from(new Set(vendors.map(v => v.category)))];

  // Filter vendors based on search and category inputs
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || vendor.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-comfortable">
      {/* Page Header Section */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border-soft pb-comfortable">
        <div>
          <h1 className="text-headline-xl font-bold text-text-primary tracking-tight">Vendors Directory</h1>
          <p className="text-body-md text-text-secondary mt-1">Manage vendor credentials, performance scores, and contact logs.</p>
        </div>
        
        <Button 
          variant="primary" 
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setIsDialogOpen(true)}
        >
          Add Vendor
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary h-4 w-4" />
          <input 
            type="text" 
            placeholder="Search vendor name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[40px] pl-10 pr-4 bg-background border border-border-main rounded-input font-body-sm text-body-sm text-text-primary focus:border-primary focus:ring-2 focus:ring-tint-green outline-none transition-all"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto py-1">
          <Filter className="h-4 w-4 text-text-muted hidden sm:block" />
          <div className="flex gap-2.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-caption font-semibold tracking-wider uppercase text-[11px] border transition-all ${
                  categoryFilter === cat
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white border-border-main text-text-secondary hover:border-border-strong hover:text-text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Vendors Table */}
      {filteredVendors.length === 0 ? (
        <Card className="py-12 text-center text-text-secondary">
          <FileText className="h-12 w-12 mx-auto text-text-disabled mb-3" />
          <p className="font-semibold text-body-md">No vendors found matching your filters.</p>
          <p className="text-body-sm text-text-muted mt-1">Try resetting search parameters or adding a new vendor profile.</p>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Vendor</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>YTD Spend</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Contact Detail</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {filteredVendors.map((vendor) => (
              <TableRow key={vendor.id}>
                {/* Name */}
                <TableCell className="font-semibold">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-tint-green text-primary font-bold flex items-center justify-center text-body-md uppercase shadow-sm">
                      {vendor.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-text-primary text-body-sm font-semibold">{vendor.name}</p>
                      {vendor.address && (
                        <p className="text-[11px] text-text-secondary flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {vendor.address}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                
                {/* Category */}
                <TableCell>{vendor.category}</TableCell>
                
                {/* YTD Spend */}
                <TableCell>{vendor.ytdSpend}</TableCell>
                
                {/* Rating */}
                <TableCell>
                  <div className="flex items-center gap-1 text-primary">
                    <Star className="h-4 w-4 fill-status-amber text-status-amber" />
                    <span className="font-semibold">{vendor.rating}</span>
                  </div>
                </TableCell>
                
                {/* Status */}
                <TableCell>
                  <Badge variant={vendor.status === 'ACTIVE' ? 'success' : 'neutral'}>
                    {vendor.status}
                  </Badge>
                </TableCell>

                {/* Contact Info */}
                <TableCell className="text-right">
                  <div className="flex flex-col items-end gap-1 text-[12px] text-text-secondary">
                    <a href={`mailto:${vendor.email}`} className="hover:text-primary flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {vendor.email}
                    </a>
                    <span className="flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3" />
                      {vendor.phone}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Add Vendor Overlay Dialog */}
      <AddVendorDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </div>
  );
};
