import React, { useState } from 'react';
import { Star, ShieldCheck, Mail, ArrowUpRight, Search } from 'lucide-react';
import { VendorPerformance } from '../types';

interface VendorPerformanceCardProps {
  vendors?: VendorPerformance[];
}

const defaultVendors: VendorPerformance[] = [
  {
    name: 'Vendor A (Global Logistics LLC)',
    rating: 4.9,
    onTimeDelivery: 99.2,
    qualityScore: 98.5,
    totalSpend: 148200
  },
  {
    name: 'Vendor B (Apex Industrial Supplies)',
    rating: 4.7,
    onTimeDelivery: 96.5,
    qualityScore: 95.0,
    totalSpend: 92400
  },
  {
    name: 'Vendor C (Summit Raw Materials)',
    rating: 4.5,
    onTimeDelivery: 94.1,
    qualityScore: 92.8,
    totalSpend: 115000
  },
  {
    name: 'Vendor D (NextGen Parts Ltd)',
    rating: 4.2,
    onTimeDelivery: 91.0,
    qualityScore: 93.5,
    totalSpend: 54900
  },
];

export default function VendorPerformanceCard({ vendors = defaultVendors }: VendorPerformanceCardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredVendors = vendors.filter(vendor => 
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      id="vendor-performance-card"
      className="flex flex-col bg-white p-6 border border-[#dedede] rounded animate-fade-in"
    >
      {/* Card Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-sans font-bold text-lg text-black tracking-tight flex items-center gap-2">
            Vendor Performance
          </h3>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Core vendor delivery and quality indexes.
          </p>
        </div>

        {/* Dense Search Inputs matching the design style */}
        <div className="relative">
          <input
            id="vendor-perf-search"
            type="text"
            placeholder="Search vendor performance..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs bg-[#f5f5f5] border border-[#dedede] rounded outline-none focus:border-black transition-colors placeholder:text-neutral-400 font-mono"
          />
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-neutral-400" />
        </div>
      </div>

      {/* Vendors Table / Rows */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#dedede] text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              <th className="pb-3 font-semibold">Vendor Identity</th>
              <th className="pb-3 font-semibold">Rating</th>
              <th className="pb-3 font-semibold text-right">On-Time delivery</th>
              <th className="pb-3 font-semibold text-right">Quality Index</th>
              <th className="pb-3 font-semibold text-right">Spend Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#efefef]">
            {filteredVendors.map((vendor, index) => {
              // Decide on color based on delivery performance
              const isExcellent = vendor.onTimeDelivery >= 95;
              
              return (
                <tr key={index} className="group hover:bg-[#fafafa] transition-colors">
                  <td className="py-4 pr-3">
                    <div className="font-sans font-bold text-sm text-black group-hover:underline cursor-pointer">
                      {vendor.name}
                    </div>
                  </td>
                  <td className="py-4 pr-3">
                    <div className="flex items-center gap-1">
                      <Star className="size-3.5 font-bold fill-black text-black shrink-0" />
                      <span className="font-sans font-bold text-xs text-black">{vendor.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-3 text-right">
                    <div className="inline-flex flex-col items-end">
                      <span className="font-mono text-xs font-bold text-black">{vendor.onTimeDelivery}%</span>
                      {/* Rating Progress line */}
                      <div className="w-16 h-1 bg-neutral-100 rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full bg-black" 
                          style={{ width: `${vendor.onTimeDelivery}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-3 text-right">
                    <div className="inline-flex flex-col items-end">
                      <span className="font-mono text-xs font-bold text-black">{vendor.qualityScore}%</span>
                      {/* Quality Progress line */}
                      <div className="w-16 h-1 bg-neutral-100 rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full bg-black/60" 
                          style={{ width: `${vendor.qualityScore}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <span className="font-mono text-xs font-bold text-black">
                      ${vendor.totalSpend.toLocaleString()}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filteredVendors.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs font-mono text-neutral-400">
                  No matching vendors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
