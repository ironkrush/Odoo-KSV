import React, { useState, useEffect, useMemo } from 'react';
import {
  Menu,
  Search,
  Plus,
  CheckCircle,
  X,
  Send,
  Bell,
  User,
  Mail,
  Star,
  FileText,
  PlusCircle,
  AlertCircle,
  Trash2,
  RotateCcw,
  RefreshCw,
  FolderOpen,
  DollarSign,
  Sidebar,
  LayoutGrid
} from 'lucide-react';

import DashboardSidebar from './components/DashboardSidebar';
import Dashboard, { PurchaseOrderRecord } from './components/Dashboard';

import { RFQ, Quotation, Vendor, PurchaseOrder, Invoice, ActivityItem, KPIMetric } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const [rfqs, setRfqs] = useState<RFQ[]>(() => {
    const saved = localStorage.getItem('erp_rfqs');
    return saved ? JSON.parse(saved) : [
      { id: '102', title: 'Custom Steel Fabrication', vendorCategory: 'Industrial Supplies', status: 'Draft', date: '2026-06-05', itemsCount: 15 },
      { id: '103', title: 'Raw Rubber Shipments', vendorCategory: 'Raw Materials', status: 'Sent', date: '2026-06-04', itemsCount: 40 },
      { id: '104', title: 'Corrugated Packaging Boxes', vendorCategory: 'Packaging', status: 'Received', date: '2026-06-03', itemsCount: 120 },
      { id: '105', title: 'High-Temp Wiring Harnesses', vendorCategory: 'Electronics', status: 'Closed', date: '2026-05-28', itemsCount: 25 },
    ];
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem('erp_quotations');
    return saved ? JSON.parse(saved) : [
      { id: 'QT-812', rfqId: '104', vendorName: 'Apex Industrial Supplies', amount: 8400, status: 'Pending Review', deliveryTimeDays: 5, date: '2026-06-05' },
      { id: 'QT-813', rfqId: '102', vendorName: 'Global Logistics LLC', amount: 12450, status: 'Pending Review', deliveryTimeDays: 14, date: '2026-06-05' },
      { id: 'QT-814', rfqId: '103', vendorName: 'Summit Raw Materials', amount: 35000, status: 'Approved', deliveryTimeDays: 30, date: '2026-06-04' },
      { id: 'QT-815', rfqId: '102', vendorName: 'NextGen Parts Ltd', amount: 11900, status: 'Rejected', deliveryTimeDays: 7, date: '2026-06-03' },
    ];
  });

  const [approvalsCount, setApprovalsCount] = useState<number>(5);

  const [recentPos, setRecentPos] = useState<PurchaseOrderRecord[]>(() => {
    const saved = localStorage.getItem('erp_recent_pos');
    return saved ? JSON.parse(saved) : [
      { id: '#PO-1004', vendor: 'Apex Steel Ltd', product: 'Structural Steel Beams', status: 'Delivered', qty: 150, unitPrice: 85.00, total: 12750.00 },
      { id: '#PO-1003', vendor: 'Titanium Forge Co', product: 'Grade 5 Titanium Rods', status: 'In Transit', qty: 45, unitPrice: 320.00, total: 14400.00 },
      { id: '#PO-1002', vendor: 'Global Packers', product: 'Corrugated Shipping Boxes', status: 'Pending Approval', qty: 1000, unitPrice: 1.20, total: 1200.00 },
      { id: '#PO-1001', vendor: 'Zenith Electronics', product: 'Microcontroller Units', status: 'Cancelled', qty: 500, unitPrice: 4.50, total: 2250.00 },
      { id: '#PO-1000', vendor: 'Nova Chemical Corp', product: 'Industrial Solvent Solns', status: 'Delivered', qty: 80, unitPrice: 95.00, total: 7600.00 },
    ];
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('erp_invoices');
    return saved ? JSON.parse(saved) : [
      { id: 'INV-928', poId: 'PO-902', vendorName: 'Apex Industrial Supplies', amount: 4500, status: 'Paid', date: '2026-06-01' },
      { id: 'INV-929', poId: 'PO-901', vendorName: 'Summit Raw Materials', amount: 35000, status: 'Pending', date: '2026-06-04' },
      { id: 'INV-930', poId: 'PO-903', vendorName: 'NextGen Parts Ltd', amount: 9800, status: 'Overdue', date: '2026-05-30' },
    ];
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('erp_vendors');
    return saved ? JSON.parse(saved) : [
      { id: 'VND-301', name: 'Global Logistics LLC', category: 'Logistics', rating: 4.9, status: 'Active', contactEmail: 'ops@globallogistics.com' },
      { id: 'VND-302', name: 'Apex Industrial Supplies', category: 'Industrial Supplies', rating: 4.7, status: 'Active', contactEmail: 'sales@apexsupplies.net' },
      { id: 'VND-303', name: 'Summit Raw Materials', category: 'Raw Materials', rating: 4.5, status: 'Active', contactEmail: 'procure@summitraw.org' },
      { id: 'VND-304', name: 'NextGen Parts Ltd', category: 'Electronics', rating: 4.2, status: 'Onboarding', contactEmail: 'info@nextgenparts.co' },
      { id: 'VND-305', name: 'Weston Packaging', category: 'Packaging', rating: 3.8, status: 'Inactive', contactEmail: 'contact@westonpack.com' },
    ];
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showRfqForm, setShowRfqForm] = useState<boolean>(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState<boolean>(false);
  const [rfqTitle, setRfqTitle] = useState('');
  const [rfqCategory, setRfqCategory] = useState('Industrial Supplies');
  const [rfqItemsCount, setRfqItemsCount] = useState<number>(10);
  const [invPoId, setInvPoId] = useState('PO-901');
  const [invVendor, setInvVendor] = useState('Summit Raw Materials');
  const [invAmount, setInvAmount] = useState('');
  const [invStatus, setInvStatus] = useState<'Paid' | 'Pending' | 'Overdue'>('Pending');

  useEffect(() => { localStorage.setItem('erp_rfqs', JSON.stringify(rfqs)); }, [rfqs]);
  useEffect(() => { localStorage.setItem('erp_quotations', JSON.stringify(quotations)); }, [quotations]);
  useEffect(() => { localStorage.setItem('erp_recent_pos', JSON.stringify(recentPos)); }, [recentPos]);
  useEffect(() => { localStorage.setItem('erp_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('erp_vendors', JSON.stringify(vendors)); }, [vendors]);

  const metricsList = useMemo<KPIMetric[]>(() => {
    const activeRfqCount = rfqs.filter(r => r.status === 'Sent' || r.status === 'Received').length + 22;
    const totalQuotations = quotations.length + 74;
    const invoicesCount = invoices.length + 28;
    return [
      { title: 'Active RFQ', value: activeRfqCount.toString(), delta: 3.1, subtitle: 'vs last week' },
      { title: 'Quotations', value: totalQuotations.toString(), delta: 12.4, subtitle: 'vs last week' },
      { title: 'Approvals', value: approvalsCount.toString(), delta: -0.4, subtitle: 'vs last week' },
      { title: 'Invoices', value: invoicesCount.toString(), delta: 8.7, subtitle: 'vs last week' },
    ];
  }, [rfqs, quotations, approvalsCount, invoices]);

  const handleCreateRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqTitle) return;
    const newRfq: RFQ = {
      id: Math.floor(106 + Math.random() * 900).toString(),
      title: rfqTitle,
      vendorCategory: rfqCategory,
      status: 'Sent',
      date: new Date().toISOString().split('T')[0],
      itemsCount: Number(rfqItemsCount) || 10
    };
    setRfqs([newRfq, ...rfqs]);
    setRfqTitle('');
    setShowRfqForm(false);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invAmount) return;
    const numAmount = Number(invAmount.replace(/[^0-9.]/g, ''));
    if (isNaN(numAmount) || numAmount <= 0) return;
    const newInv: Invoice = {
      id: `INV-${Math.floor(931 + Math.random() * 900)}`,
      poId: invPoId,
      vendorName: invVendor,
      amount: numAmount,
      status: invStatus,
      date: new Date().toISOString().split('T')[0]
    };
    setInvoices([newInv, ...invoices]);
    setInvAmount('');
    setShowInvoiceForm(false);
  };

  const handleApproveQuotation = (id: string) => {
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, status: 'Approved' } : q));
    if (approvalsCount > 0) setApprovalsCount(c => c - 1);
  };

  const handleRejectQuotation = (id: string) => {
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, status: 'Rejected' } : q));
    if (approvalsCount > 0) setApprovalsCount(c => c - 1);
  };

  return (
    <div
      id="dashboard-root-panel"
      className="flex h-screen w-screen overflow-hidden text-black font-sans selection:bg-neutral-200"
      style={{ backgroundColor: '#ededed' }}
    >
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div
        id="main-content-panel"
        className="relative flex flex-col flex-1 min-w-0 overflow-hidden"
        style={{ backgroundColor: '#ededed' }}
      >
        <div className="absolute left-0 top-14 -translate-x-1/2 -translate-y-1/2 z-40 text-neutral-400 font-mono text-sm pointer-events-none select-none">
          +
        </div>

        <header
          id="workspace-navbar"
          className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-[#dedede] bg-white px-6"
        >
          <div className="flex items-center gap-3">
            <button
              id="mobile-sidebar-trigger"
              className="rounded p-1.5 hover:bg-[#ededed] md:hidden text-black"
              onClick={() => setSidebarOpen(true)}
              aria-label="Toggle Side Area"
            >
              <Menu className="size-5 shrink-0" />
            </button>
            <div className="flex items-center gap-2">
              <button
                id="sidebar-toggle-desktop"
                className="hidden md:flex p-1 rounded text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title="Toggle Sidebar"
              >
                <Sidebar className="size-4 shrink-0" />
              </button>
              <div className="flex items-center gap-2 text-sm font-semibold text-black select-none md:ml-3">
                <LayoutGrid className="size-4 text-black shrink-0" />
                <span className="capitalize">{activeTab === 'dashboard' ? 'Dashboard' : activeTab}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              id="header-shortcut-fly"
              title="Quick Action Link"
              onClick={() => alert("Action triggered: Share Report Link generated for Shaban.")}
              className="p-1.5 rounded-sm hover:bg-[#ededed] text-neutral-800 transition-colors"
            >
              <Send className="size-4" />
            </button>
            <button
              id="header-toggle-bell"
              title="System Alerts"
              onClick={() => alert(`Active alerts in workspace: ${approvalsCount} approvals require immediate response.`)}
              className="p-1.5 rounded-sm hover:bg-[#ededed] text-neutral-800 relative transition-colors"
            >
              <Bell className="size-4" />
              {approvalsCount > 0 && (
                <span className="absolute top-1 right-1 size-2 rounded-full bg-red-600 animate-ping" />
              )}
            </button>
            <div className="h-7 w-7 rounded-full bg-black flex items-center justify-center p-0.5" title="Logged in as Shaban Haider">
              <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <User className="size-4 text-black shrink-0 relative top-0.5" />
              </div>
            </div>
          </div>
        </header>

        <main
          id="stage-viewport"
          className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6"
          style={{ backgroundColor: '#ededed' }}
        >
          <div className="mx-auto w-full max-w-7xl space-y-6">

            {activeTab === 'dashboard' && (
              <Dashboard
                metrics={metricsList}
                orders={recentPos}
                onViewAll={() => setActiveTab('purchaseorders')}
                onAddOrder={(newOrder) => setRecentPos([newOrder, ...recentPos])}
                onUpdateStatus={(id, status) => setRecentPos(prev => prev.map(o => o.id === id ? { ...o, status } : o))}
              />
            )}

            {activeTab === 'rfqs' && (
              <div className="bg-white border border-[#dedede] rounded p-6 animate-fade-in space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Request for Quotation (RFQs) Registry</h2>
                    <p className="text-xs text-neutral-500 font-mono mt-1">Draft, send, and review incoming requests for materials.</p>
                  </div>
                  <button
                    id="new-rfq-drawer-trigger"
                    onClick={() => setShowRfqForm(!showRfqForm)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded font-semibold text-xs uppercase tracking-wider transition-colors"
                  >
                    <Plus className="size-3.5" />
                    <span>Create RFQ Request</span>
                  </button>
                </div>

                {showRfqForm && (
                  <form onSubmit={handleCreateRFQ} className="p-4 border border-black rounded bg-neutral-50 space-y-4 animate-fade-in">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-black">New Procurement RFQ Setup</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">RFQ Title/Required Material</label>
                        <input type="text" required value={rfqTitle} onChange={(e) => setRfqTitle(e.target.value)} placeholder="e.g. Injection Molded Plastics Phase II" className="w-full text-xs p-2 bg-white border border-[#dedede] rounded outline-none focus:border-black" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">Target Vendor Category</label>
                        <select value={rfqCategory} onChange={(e) => setRfqCategory(e.target.value)} className="w-full text-xs p-2 bg-white border border-[#dedede] rounded outline-none focus:border-black font-semibold">
                          <option value="Raw Materials">Raw Materials</option>
                          <option value="Industrial Supplies">Industrial Supplies</option>
                          <option value="Packaging">Packaging</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Logistics">Logistics</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">Planned Item Quantities</label>
                        <input type="number" required value={rfqItemsCount} onChange={(e) => setRfqItemsCount(Math.max(1, Number(e.target.value)))} className="w-full text-xs p-2 bg-white border border-[#dedede] rounded outline-none focus:border-black font-mono font-bold" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 text-xs font-semibold">
                      <button type="button" onClick={() => setShowRfqForm(false)} className="px-3 py-1.5 border border-[#ced4da] rounded text-neutral-600 bg-white">Dismiss</button>
                      <button type="submit" className="px-4 py-1.5 bg-black text-white rounded hover:bg-neutral-800">Publish RFQ</button>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#dedede] text-[10px] font-mono uppercase text-neutral-400">
                        <th className="pb-3 pr-3">RFQ ID</th>
                        <th className="pb-3 pr-3">Subject Material</th>
                        <th className="pb-3 pr-3">Target Industry</th>
                        <th className="pb-3 pr-3 text-right font-semibold">Items</th>
                        <th className="pb-3 pr-3">Creation Date</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#efefef] text-xs">
                      {rfqs.map((rfq) => (
                        <tr key={rfq.id} className="hover:bg-[#fafafa] transition-colors h-12">
                          <td className="font-mono text-black font-bold">#{rfq.id}</td>
                          <td className="font-bold text-black text-sm">{rfq.title}</td>
                          <td className="font-semibold text-neutral-600">{rfq.vendorCategory}</td>
                          <td className="text-right font-mono font-bold text-black pr-3">{rfq.itemsCount.toLocaleString()} units</td>
                          <td className="font-mono text-neutral-500">{rfq.date}</td>
                          <td className="text-right">
                            <span className={`inline-block px-2 py-0.5 rounded border text-[10px] uppercase font-bold ${rfq.status === 'Sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                rfq.status === 'Received' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  rfq.status === 'Closed' ? 'bg-neutral-100 text-neutral-600 border-neutral-300' :
                                    'bg-neutral-50 text-neutral-800 border-neutral-200'
                              }`}>
                              {rfq.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'quotations' && (
              <div className="bg-white border border-[#dedede] rounded p-6 animate-fade-in space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Bid Quotations Board</h2>
                  <p className="text-xs text-neutral-500 font-mono mt-1">Vendor quotations mapped back to issued procurement files.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#dedede] text-[10px] font-mono uppercase text-neutral-400">
                        <th className="pb-3">Quote ID</th>
                        <th className="pb-3">Source RFQ</th>
                        <th className="pb-3">Vendor identity</th>
                        <th className="pb-3 text-right">Quoted price</th>
                        <th className="pb-3 text-right">Lead period</th>
                        <th className="pb-3 text-right">Status</th>
                        <th className="pb-3 text-right pr-2">Workspace Approvals</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#efefef] text-xs">
                      {quotations.map((q) => (
                        <tr key={q.id} className="hover:bg-[#fafafa] transition-colors h-14">
                          <td className="font-mono font-bold text-black">{q.id}</td>
                          <td className="font-mono text-neutral-400">#{q.rfqId}</td>
                          <td className="font-bold text-black text-sm">{q.vendorName}</td>
                          <td className="text-right font-mono font-bold text-black">${q.amount.toLocaleString()}</td>
                          <td className="text-right font-mono">{q.deliveryTimeDays} working days</td>
                          <td className="text-right">
                            <span className={`inline-block px-2.5 py-0.5 rounded border text-[10px] uppercase font-bold ${q.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                                q.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                                  'bg-amber-50 text-amber-700 border-amber-300'
                              }`}>
                              {q.status}
                            </span>
                          </td>
                          <td className="text-right">
                            {q.status === 'Pending Review' ? (
                              <div className="inline-flex gap-1.5 justify-end">
                                <button id={`approve-q-${q.id}`} onClick={() => handleApproveQuotation(q.id)} className="px-2.5 py-1 bg-black text-white text-[11px] font-semibold rounded hover:bg-neutral-800 transition-colors">Accept Bid</button>
                                <button id={`reject-q-${q.id}`} onClick={() => handleRejectQuotation(q.id)} className="px-2.5 py-1 border border-[#ced4da] rounded text-[11px] font-semibold hover:border-black transition-colors">Decline</button>
                              </div>
                            ) : (
                              <span className="font-mono text-[10px] text-neutral-400">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'approvals' && (
              <div className="bg-white border border-[#dedede] rounded p-6 animate-fade-in space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Approvals Sign-Off Queue</h2>
                  <p className="text-xs text-neutral-500 font-mono mt-1">Direct pipeline of cost authorization items requiring Shaban's clearance.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-neutral-200 rounded p-4 bg-amber-50/50 flex items-start gap-3">
                    <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-black uppercase tracking-wider">Interactive Clearances</h4>
                      <p className="text-xs text-neutral-600 mt-1 leading-normal">Click accept on the pending bids below to process. This interface dynamically reduces the primary workspace approvals counter.</p>
                    </div>
                  </div>
                  <div className="border border-neutral-200 rounded p-4 bg-[#fafafa] flex items-stretch justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-400 block uppercase font-bold">Unsigned Approvals Count</span>
                      <span className="text-3xl font-mono font-bold text-black mt-2 block">{approvalsCount}</span>
                    </div>
                    {approvalsCount === 0 && (
                      <span className="self-center px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-mono font-bold rounded">FULLY SIGNED OFF</span>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold text-xs uppercase text-neutral-400 font-mono">Bids Awaiting Signoff</h3>
                  {quotations.filter(q => q.status === 'Pending Review').map((q) => (
                    <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-[#dedede] rounded hover:border-black transition-all gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-black">Proposal from {q.vendorName}</span>
                          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">Bid #{q.id}</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">Submitted in response to RFQ #{q.rfqId}. Quoted Total: <strong className="text-black">${q.amount.toLocaleString()}</strong>.</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button id={`authorise-bid-${q.id}`} onClick={() => handleApproveQuotation(q.id)} className="px-3 py-1.5 bg-black text-white text-xs font-semibold rounded hover:bg-neutral-800 transition-all uppercase tracking-wider">Approve Bid</button>
                        <button onClick={() => handleRejectQuotation(q.id)} className="px-3 py-1.5 border border-[#ced4da] text-xs font-semibold text-neutral-600 rounded bg-white hover:border-black transition-all uppercase tracking-wider">Reject</button>
                      </div>
                    </div>
                  ))}
                  {quotations.filter(q => q.status === 'Pending Review').length === 0 && (
                    <div className="py-12 border border-dashed border-neutral-300 rounded text-center text-xs font-mono text-neutral-400">
                      All proposal clearances processed successfully! Active approval backlog is zero.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'vendors' && (
              <div className="bg-white border border-[#dedede] rounded p-6 animate-fade-in space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Registered Vendor Management</h2>
                    <p className="text-xs text-neutral-500 font-mono mt-1">Official vendor records, rating indexes and global operational status indicators.</p>
                  </div>
                  <div className="relative">
                    <input id="vendors-view-filter-search" type="text" placeholder="Filter registered vendors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full sm:w-64 pl-8 pr-3 py-2 text-xs bg-[#f5f5f5] border border-[#dedede] rounded outline-none focus:border-black placeholder:text-neutral-400" />
                    <Search className="absolute left-2.5 top-2.5 size-3.5 text-neutral-400" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#dedede] text-[10px] font-mono uppercase text-neutral-400">
                        <th className="pb-3">Vendor Id</th>
                        <th className="pb-3">Vendor legal identity</th>
                        <th className="pb-3">Materials Categorization</th>
                        <th className="pb-3">Rating Score</th>
                        <th className="pb-3">Operational Status</th>
                        <th className="pb-3 text-right">Inquiries</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#efefef] text-sm">
                      {vendors
                        .filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.category.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((v) => (
                          <tr key={v.id} className="hover:bg-[#fafafa] transition-colors h-14">
                            <td className="font-mono text-xs text-neutral-400">{v.id}</td>
                            <td>
                              <div className="font-bold text-black">{v.name}</div>
                              <span className="text-[11px] text-neutral-400 font-mono">{v.contactEmail}</span>
                            </td>
                            <td>
                              <span className="font-semibold text-xs text-neutral-700 bg-neutral-100 px-2 py-0.5 border border-neutral-200 rounded">{v.category}</span>
                            </td>
                            <td className="font-mono">
                              <div className="flex items-center gap-1 font-bold text-neutral-800">
                                <Star className="size-3.5 fill-black text-black" />
                                <span>{v.rating}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${v.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  v.status === 'Onboarding' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    'bg-neutral-100 text-neutral-500 border-neutral-300'
                                }`}>
                                {v.status}
                              </span>
                            </td>
                            <td className="text-right">
                              <a href={`mailto:${v.contactEmail}`} className="inline-flex items-center gap-1 px-2.5 py-1 bg-black text-white hover:bg-neutral-800 rounded font-bold text-[11px]">
                                <Mail className="size-3" />
                                <span>Envelope Inquire</span>
                              </a>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="bg-white border border-[#dedede] rounded p-6 animate-fade-in space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Supplies & Work Categorization</h2>
                  <p className="text-xs text-neutral-500 font-mono mt-1">Vendor profiles segregated by primary manufacturing capabilities.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {[
                    { title: 'Raw Materials', desc: 'Aggregates, alloys, chemical constituents, wood substrates.', codes: '6 Active Vendors', spend: '$148k Spend' },
                    { title: 'Industrial Supplies', desc: 'Cylinder sleeves, tooling elements, hydraulic fluids.', codes: '4 Active Vendors', spend: '$92k Spend' },
                    { title: 'Packaging', desc: 'Corrugated cartons, high-density polyethylene bags, shrink bands.', codes: '2 Active Vendors', spend: '$54k Spend' },
                    { title: 'Electronics', desc: 'Printed circuit assemblies, wiring patterns, sensor modules.', codes: '3 Active Vendors', spend: '$115k Spend' },
                    { title: 'Logistics', desc: 'Third-party transport, local ocean freight, customs clearance.', codes: '5 Active Vendors', spend: '$210k Spend' },
                  ].map((cat, i) => (
                    <div key={i} className="p-5 border border-[#dedede] hover:border-black rounded-lg transition-all space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-bold text-black">{cat.title}</span>
                        <FolderOpen className="size-4 text-neutral-400" />
                      </div>
                      <p className="text-xs text-neutral-500 leading-normal">{cat.desc}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-[#f0f0f0]">
                        <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase">{cat.codes}</span>
                        <span className="text-[10px] font-mono text-black font-bold uppercase">{cat.spend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'purchaseorders' && (
              <div className="bg-white border border-[#dedede] rounded p-6 animate-fade-in space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-neutral-900">Purchase Orders (PO) Ledger</h2>
                  <p className="text-xs text-neutral-500 font-mono mt-1">Legally binding buyer authorization certificates sent to global vendors.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#dedede] text-[10px] font-mono uppercase text-neutral-400">
                        <th className="pb-3 px-2">PO Code</th>
                        <th className="pb-3 px-2">Vendor Destination</th>
                        <th className="pb-3 px-2">Product Description</th>
                        <th className="pb-3 px-2 text-right">Items Qty</th>
                        <th className="pb-3 px-2 text-right">Unit Rate</th>
                        <th className="pb-3 px-4 text-right">Commitment Value</th>
                        <th className="pb-3 text-right pr-2">Tracking</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#efefef] text-sm">
                      {recentPos.map((po) => (
                        <tr key={po.id} className="hover:bg-[#fafafa] transition-colors h-14">
                          <td className="font-mono font-bold text-neutral-500 px-2">{po.id}</td>
                          <td className="font-bold text-black text-sm px-2">{po.vendor}</td>
                          <td className="text-neutral-500 text-xs px-2">{po.product}</td>
                          <td className="text-right font-mono text-neutral-700 px-2">{po.qty.toLocaleString()} units</td>
                          <td className="text-right font-mono text-neutral-400 px-2">${po.unitPrice.toFixed(2)}</td>
                          <td className="text-right font-mono font-bold text-black px-4">${po.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="text-right pr-2">
                            <span className={`inline-block px-2.5 py-0.5 rounded border text-[10px] font-mono font-bold uppercase ${po.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                po.status === 'In Transit' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  po.status === 'Pending Approval' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                              {po.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="bg-white border border-[#dedede] rounded p-6 animate-fade-in space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Vendor Invoices Ledger</h2>
                    <p className="text-xs text-neutral-500 font-mono mt-1">Payment requests matched back to Purchase Orders.</p>
                  </div>
                  <button id="new-invoice-form-trigger" onClick={() => setShowInvoiceForm(!showInvoiceForm)} className="flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded font-semibold text-xs uppercase tracking-wider transition-colors">
                    <Plus className="size-3.5" />
                    <span>Upload Vendor Invoice</span>
                  </button>
                </div>
                {showInvoiceForm && (
                  <form onSubmit={handleCreateInvoice} className="p-4 border border-black rounded bg-[#fafafa] space-y-4 animate-fade-in">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-black">Inbound Vendor Invoice Parameters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">Select Purchase Order (PO)</label>
                        <select value={invPoId} onChange={(e) => setInvPoId(e.target.value)} className="w-full text-xs p-2 bg-white border border-[#dedede] rounded outline-none font-mono">
                          {recentPos.map(p => (<option key={p.id} value={p.id}>{p.id} (${p.total.toLocaleString()})</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">Vendor Entity</label>
                        <select value={invVendor} onChange={(e) => setInvVendor(e.target.value)} className="w-full text-xs p-2 bg-white border border-[#dedede] rounded outline-none font-semibold">
                          {vendors.map(v => (<option key={v.id} value={v.name}>{v.name}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">Invoice Dollar value</label>
                        <input type="text" required value={invAmount} onChange={(e) => setInvAmount(e.target.value)} placeholder="e.g. 145000" className="w-full text-xs p-2 bg-white border border-[#dedede] rounded outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">Accounting Status</label>
                        <select value={invStatus} onChange={(e) => setInvStatus(e.target.value as any)} className="w-full text-xs p-2 bg-white border border-[#dedede] rounded outline-none font-semibold">
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 text-xs font-semibold">
                      <button type="button" onClick={() => setShowInvoiceForm(false)} className="px-3 py-1.5 border border-[#ced4da] rounded text-neutral-600 bg-white">Dismiss</button>
                      <button type="submit" className="px-4 py-1.5 bg-black text-white rounded hover:bg-neutral-800">Record Invoice</button>
                    </div>
                  </form>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#dedede] text-[10px] font-mono uppercase text-neutral-400">
                        <th className="pb-3">Invoice Code</th>
                        <th className="pb-3">Matched PO</th>
                        <th className="pb-3">Vendor Business</th>
                        <th className="pb-3 text-right">Invoiced Amount</th>
                        <th className="pb-3 text-right">Filing Date</th>
                        <th className="pb-3 text-right">Payment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#efefef] text-sm">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-[#fafafa] transition-colors h-14">
                          <td className="font-mono font-bold text-black">{inv.id}</td>
                          <td className="font-mono text-neutral-400">{inv.poId}</td>
                          <td className="font-bold text-black text-sm">{inv.vendorName}</td>
                          <td className="text-right font-mono font-bold text-black">${inv.amount.toLocaleString()}</td>
                          <td className="text-right font-mono text-neutral-500">{inv.date}</td>
                          <td className="text-right">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                                inv.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse' :
                                  'bg-amber-100 text-amber-800 border-amber-300'
                              }`}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="bg-white border border-[#dedede] rounded p-6 animate-fade-in space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Workspace Procurement Reports</h2>
                  <p className="text-xs text-neutral-500 font-mono mt-1">Print ready summaries generated for Shaban.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="border border-neutral-300 rounded p-6 flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-black uppercase tracking-wide">Q2 Material Procurement Report</h4>
                      <p className="text-xs text-neutral-500 mt-1 leading-normal">Consolidated ledger of all quotation bids, approved PO commitment totals, and active material supplier compliance metrics from Jan to Jun 2026.</p>
                    </div>
                    <button onClick={() => alert("Downloading PDF summary report...")} className="w-full py-2 bg-black text-white rounded text-xs font-bold uppercase tracking-wider">Export Print PDF Document</button>
                  </div>
                  <div className="border border-neutral-300 rounded p-6 flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-black uppercase tracking-wide">Registered Compliance Matrix</h4>
                      <p className="text-xs text-neutral-500 mt-1 leading-normal">Compliance logs details. Generates records summarizing delivery delay rates and quality verification rejects for Apex Industrial Supplies and other vendors.</p>
                    </div>
                    <button onClick={() => alert("Downloading CSV compliance sheet...")} className="w-full py-2 bg-black text-white rounded text-xs font-bold uppercase tracking-wider">Export CSV Spreadsheet</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="bg-white border border-[#dedede] rounded p-6 animate-fade-in space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">System Audit Event Logs</h2>
                  <p className="text-xs text-neutral-500 font-mono mt-1">Real-time non-repudiation timestamps monitoring transactions in VendorBridge.</p>
                </div>
                <div className="space-y-4">
                  {[
                    { id: 'ACT-905', title: 'Purchase Order #PO-1004 state cleared', desc: 'Apex Steel Ltd material release logged as Delivered.', time: 'Just now', type: 'po' },
                    { id: 'ACT-904', title: 'Purchase Order #PO-1003 shipment initialized', desc: 'Grade 5 Titanium Rods routed for transit clearance.', time: '14 minutes ago', type: 'po' },
                    { id: 'ACT-903', title: 'New RFQ established for supplies', desc: 'Corrugated Packaging Boxes request finalized & sent to packaging vendors.', time: '2 hours ago', type: 'rfq' },
                    { id: 'ACT-902', title: 'Vendor Apex Industrial Supplies invoice paid', desc: 'Financial ledger clearance of $4,500.00 posted.', time: '1 day ago', type: 'invoice' },
                    { id: 'ACT-901', title: 'New supplier registration onboarding status', desc: 'NextGen Parts Ltd contact verified and authenticated.', time: '3 days ago', type: 'vendor' },
                  ].map((act) => (
                    <div key={act.id} className="flex items-start justify-between p-4 border border-[#eee] rounded hover:border-black transition-colors gap-3 bg-[#fafafa]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-neutral-400">[{act.id}]</span>
                          <h4 className="text-sm font-bold text-black">{act.title}</h4>
                        </div>
                        <p className="text-xs text-neutral-600">{act.desc}</p>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono shrink-0 whitespace-nowrap">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'help' && (
              <div className="bg-white border border-[#dedede] rounded p-6 animate-fade-in space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Procurement Guide & Setup</h2>
                  <p className="text-xs text-neutral-500 font-mono mt-1">Read on how the ERP VendorBridge interface facilitates tracking procurement objects.</p>
                </div>
                <div className="space-y-4 text-xs text-neutral-700 leading-relaxed">
                  <p>Welcome to the <strong>VendorBridge ERP Workspace</strong>! This application has been rebuilt from the ground up for a sleek, light mode aesthetic.</p>
                  <p className="font-bold text-black">Key Features Implemented:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Color Scheme:</strong> Main body configured in soft #ededed while primary accents and buttons are deep solid black.</li>
                    <li><strong>Procurement Banner:</strong> The "Welcome Shaban Haider" hero contains a landscape graphic banner.</li>
                    <li><strong>Spend Analysis:</strong> Real-time charts powered by Recharts with flat black top border lines.</li>
                    <li><strong>Clear Audit Logs:</strong> Click on buttons to dismiss items or trigger quotations which updates standard states.</li>
                  </ul>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
