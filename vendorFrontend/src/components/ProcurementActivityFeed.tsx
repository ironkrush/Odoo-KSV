import React, { useState } from 'react';
import { Send, CheckCircle, FileText, ArrowRightLeft, Shield, Sparkles, Filter, Trash2 } from 'lucide-react';
import { ActivityItem } from '../types';

interface ActivityFeedProps {
  items?: ActivityItem[];
  onAddActivity?: (activity: ActivityItem) => void;
}

export const defaultActivityItems: ActivityItem[] = [
  { 
    id: 'act1', 
    type: 'rfq', 
    title: 'RFQ #102 created', 
    timestamp: '10 min ago',
    detail: 'Request for custom metal plating sent to Vendor A.'
  },
  { 
    id: 'act2', 
    type: 'quotation', 
    title: 'Quotation submitted', 
    timestamp: '1 hour ago',
    detail: '$12,450 quoted by Summit Raw Materials for RFQ #102.'
  },
  { 
    id: 'act3', 
    type: 'po', 
    title: 'PO generated', 
    timestamp: '3 hours ago',
    detail: 'Purchase Order #PO-904 generated for Apex Industrial Supplies.'
  },
  { 
    id: 'act4', 
    type: 'invoice', 
    title: 'Invoice sent', 
    timestamp: '2 days ago',
    detail: 'Invoice #INV-928 sent to billing workflow.'
  },
  {
    id: 'act5',
    type: 'vendor',
    title: 'Vendor A registered status updated',
    timestamp: '3 days ago',
    detail: 'Successfully passed automated compliance checklist.'
  }
];

export default function ProcurementActivityFeed({ items = defaultActivityItems, onAddActivity }: ActivityFeedProps) {
  const [activeItems, setActiveItems] = useState<ActivityItem[]>(items);
  const [filterType, setFilterType] = useState<string>('all');

  const getIcon = (type: string) => {
    switch (type) {
      case 'rfq':
        return <Send className="size-4 text-black" />;
      case 'quotation':
        return <ArrowRightLeft className="size-4 text-black" />;
      case 'po':
        return <FileText className="size-4 text-black" />;
      case 'invoice':
        return <CheckCircle className="size-4 text-black" />;
      default:
        return <Shield className="size-4 text-black" />;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'rfq': return 'bg-neutral-100 text-neutral-800 border-neutral-300';
      case 'quotation': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'po': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'invoice': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default: return 'bg-neutral-50 text-neutral-600 border-neutral-200';
    }
  };

  const handleClear = () => {
    setActiveItems([]);
  };

  const filteredItems = filterType === 'all' 
    ? activeItems 
    : activeItems.filter(item => item.type === filterType);

  return (
    <div 
      id="procurement-activity-feed-card"
      className="flex flex-col bg-white border border-[#dedede] rounded animate-fade-in"
    >
      {/* Feed Header */}
      <div className="p-6 border-b border-[#dedede] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-sans font-bold text-lg text-black tracking-tight">
            Recent Activity Feed
          </h3>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Realtime audit log of procurement events.
          </p>
        </div>

        {/* Dense Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded bg-[#f5f5f5] px-2 py-1 border border-[#dedede]">
            <Filter className="size-3 text-neutral-500" />
            <select
              id="activity-filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-xs text-black border-none outline-none font-sans font-semibold cursor-pointer"
            >
              <option value="all">All Logs</option>
              <option value="rfq">RFQs</option>
              <option value="quotation">Quotations</option>
              <option value="po">POs</option>
              <option value="invoice">Invoices</option>
            </select>
          </div>

          <button
            id="clear-logs-btn"
            onClick={handleClear}
            className="flex items-center gap-1 px-3 py-1 bg-black text-white hover:bg-neutral-800 rounded text-xs font-semibold"
          >
            <Trash2 className="size-3" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Feed Area */}
      <div className="flex-1 divide-y divide-[#efefef] max-h-[420px] overflow-y-auto">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            id={`procurement-activity-item-${item.id}`}
            className="flex items-start gap-4 p-5 hover:bg-[#fafafa] transition-colors"
          >
            {/* Left Circle Icon */}
            <div className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-[#dedede] bg-[#f5f5f5]">
              {getIcon(item.type)}
            </div>

            {/* Content Mid */}
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-sans text-sm font-bold text-black hover:underline cursor-pointer">
                  {item.title}
                </span>
                <span className={`inline-block text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${getBadgeStyle(item.type)}`}>
                  {item.type}
                </span>
              </div>
              {item.detail && (
                <p className="font-sans text-xs text-neutral-500 leading-normal">
                  {item.detail}
                </p>
              )}
            </div>

            {/* Timestamp Right */}
            <span className="font-mono text-[11px] text-neutral-400 shrink-0 select-none">
              {item.timestamp}
            </span>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="py-12 text-center text-xs font-mono text-neutral-400 select-none">
            No active logs to display. Move actions to generate logs.
          </div>
        )}
      </div>
    </div>
  );
}
