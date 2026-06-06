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
  LayoutGrid,
  Printer,
  Download,
  Check,
  Settings
} from 'lucide-react';

import DashboardSidebar from './components/DashboardSidebar';
import Dashboard, { PurchaseOrderRecord } from './components/Dashboard';
import Rfqcomponents from './components/Rfqcomponents';
import Auth from './components/Auth';

import { RFQ, Quotation, Vendor, Invoice, ActivityItem, KPIMetric } from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('vb_token'));
  const [user, setUser] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [approvalsCount, setApprovalsCount] = useState<number>(0);
  const [recentPos, setRecentPos] = useState<PurchaseOrderRecord[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityItem[]>([]);
  const [spendTrend, setSpendTrend] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showRfqForm, setShowRfqForm] = useState<boolean>(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState<boolean>(false);
  const [rfqTitle, setRfqTitle] = useState('');
  const [rfqCategory, setRfqCategory] = useState('Industrial Supplies');
  const [rfqItemsCount, setRfqItemsCount] = useState<number>(10);
  const [rfqDescription, setRfqDescription] = useState('');
  const [rfqDeadline, setRfqDeadline] = useState('');
  const [rfqVendors, setRfqVendors] = useState('');

  const [invPoId, setInvPoId] = useState('');
  const [invVendor, setInvVendor] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [invStatus, setInvStatus] = useState<'Paid' | 'Pending' | 'Overdue'>('Pending');

  const [poInvoiceTab, setPoInvoiceTab] = useState<'po' | 'invoices'>('po');
  const [selectedComparisonRfq, setSelectedComparisonRfq] = useState<string>('');
  const [emailModal, setEmailModal] = useState<{ open: boolean; recipient: string; subject: string; body: string; invoiceId: string } | null>(null);
  const [printModal, setPrintModal] = useState<{ open: boolean; type: 'po' | 'invoice'; data: any } | null>(null);

  const [vQuoteRfq, setVQuoteRfq] = useState('');
  const [vQuoteAmount, setVQuoteAmount] = useState('');
  const [vQuoteDelivery, setVQuoteDelivery] = useState('7');
  const [vQuoteNotes, setVQuoteNotes] = useState('');

  const [showPoFormLedger, setShowPoFormLedger] = useState(false);
  const [ledgerPoVendor, setLedgerPoVendor] = useState('');
  const [ledgerPoProduct, setLedgerPoProduct] = useState('');
  const [ledgerPoQty, setLedgerPoQty] = useState('100');
  const [ledgerPoPrice, setLedgerPoPrice] = useState('15.00');

  const [emailSendingStep, setEmailSendingStep] = useState<'idle' | 'sending' | 'success'>('idle');

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState<boolean>(false);

  const queryApiUrl = new URLSearchParams(window.location.search).get('api_url');
  if (queryApiUrl) {
    localStorage.setItem('API_URL', queryApiUrl);
  }
  const baseUrl = queryApiUrl || localStorage.getItem('API_URL') || window.location.origin;

  // Check token and fetch user details on load
  useEffect(() => {
    if (token) {
      fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Session expired');
          return res.json();
        })
        .then(data => {
          setUser(data.user);
        })
        .catch(err => {
          console.error(err);
          handleLogout();
        });
    }
  }, [token]);

  // Logout utility
  const handleLogout = () => {
    localStorage.removeItem('vb_token');
    setToken(null);
    setUser(null);
    setActiveTab('dashboard');
  };

  // Fetch all workspace datasets
  const fetchAllData = async () => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [rfqRes, quoteRes, vendorRes, poRes, invRes, logsRes, notificationsRes] = await Promise.all([
        fetch(`${baseUrl}/api/rfqs`, { headers }),
        fetch(`${baseUrl}/api/quotations`, { headers }),
        fetch(`${baseUrl}/api/vendors`, { headers }),
        fetch(`${baseUrl}/api/purchase-orders`, { headers }),
        fetch(`${baseUrl}/api/invoices`, { headers }),
        fetch(`${baseUrl}/api/activity-logs`, { headers }).catch(() => null),
        fetch(`${baseUrl}/api/notifications`, { headers }).catch(() => null)
      ]);

      if (rfqRes.ok) {
        const rfqData = await rfqRes.json();
        setRfqs(rfqData);
        if (rfqData.length > 0 && !selectedComparisonRfq) {
          setSelectedComparisonRfq(rfqData[0].id);
        }
      }
      if (quoteRes.ok) {
        const quoteData = await quoteRes.json();
        setQuotations(quoteData);
        setApprovalsCount(quoteData.filter((q: any) => q.status === 'Pending Review').length);
      }
      if (vendorRes.ok) {
        const vendorData = await vendorRes.json();
        setVendors(vendorData);
      }
      if (poRes.ok) {
        const poData = await poRes.json();
        setRecentPos(poData);
        if (poData.length > 0 && !invPoId) {
          setInvPoId(poData[0].id);
        }
      }
      if (invRes.ok) {
        setInvoices(await invRes.json());
      }
      if (logsRes && logsRes.ok) {
        setActivityLogs(await logsRes.json());
      }
      if (notificationsRes && notificationsRes.ok) {
        setNotifications(await notificationsRes.json());
      }

      // Spend trends for analytics role
      if (user && ['Admin', 'Manager / Approver'].includes(user.role)) {
        const trendRes = await fetch(`${baseUrl}/api/analytics/spend-trend`, { headers });
        if (trendRes.ok) setSpendTrend(await trendRes.json());
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchAllData();
    }
  }, [user, token]);

  // Create RFQ
  const handleCreateRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqTitle) return;

    try {
      const res = await fetch(`${baseUrl}/api/rfqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: rfqTitle,
          vendorCategory: rfqCategory,
          itemsCount: Number(rfqItemsCount),
          description: rfqDescription,
          deadline: rfqDeadline,
          assignedVendors: rfqVendors
        })
      });

      if (!res.ok) throw new Error('Failed to create RFQ');
      
      setRfqTitle('');
      setRfqDescription('');
      setRfqDeadline('');
      setRfqVendors('');
      setShowRfqForm(false);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePublishNewRfq = async (title: string, category: string, itemsCount: number) => {
    try {
      const res = await fetch(`${baseUrl}/api/rfqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          vendorCategory: category,
          itemsCount: Number(itemsCount)
        })
      });

      if (!res.ok) throw new Error('Failed to create RFQ');
      
      setActiveTab('rfqs');
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Submit quote proposal
  const handleVendorSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vQuoteRfq || !vQuoteAmount) return;

    try {
      const res = await fetch(`${baseUrl}/api/quotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rfqId: vQuoteRfq,
          amount: Number(vQuoteAmount),
          deliveryTimeDays: Number(vQuoteDelivery),
          notes: vQuoteNotes
        })
      });

      if (!res.ok) throw new Error('Failed to submit quote');

      alert("Quote submitted to organizational registry successfully!");
      setVQuoteAmount('');
      setVQuoteNotes('');
      setActiveTab('rfqs');
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Generate PO manually
  const handleLedgerCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ledgerPoVendor || !ledgerPoProduct) return;

    try {
      const res = await fetch(`${baseUrl}/api/purchase-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          vendorName: ledgerPoVendor,
          product: ledgerPoProduct,
          qty: parseInt(ledgerPoQty, 10),
          unitPrice: parseFloat(ledgerPoPrice)
        })
      });

      if (!res.ok) throw new Error('Failed to create PO');

      setLedgerPoVendor('');
      setLedgerPoProduct('');
      setLedgerPoQty('100');
      setLedgerPoPrice('15.00');
      setShowPoFormLedger(false);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Create Invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invAmount || !invPoId) return;

    try {
      const res = await fetch(`${baseUrl}/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          poId: invPoId,
          vendorName: invVendor || (vendors.length > 0 ? vendors[0].name : 'Vendor'),
          amount: Number(invAmount),
          status: invStatus
        })
      });

      if (!res.ok) throw new Error('Failed to create invoice');

      setInvAmount('');
      setShowInvoiceForm(false);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Approve / Reject quotation
  const handleApproveQuotation = async (id: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/quotations/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Approved', approvalRemarks: 'Cleared by Manager Approver.' })
      });
      if (!res.ok) throw new Error('Approval action failed.');
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRejectQuotation = async (id: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/quotations/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Rejected', approvalRemarks: 'Declined by Manager Approver.' })
      });
      if (!res.ok) throw new Error('Rejection action failed.');
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Download PDF
  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      const response = await fetch(`${baseUrl}/api/invoices/${invoice.id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to generate PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${invoice.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(`Download failed: ${err.message}`);
    }
  };

  // Send real email via Nodemailer
  const handleEmailInvoice = async () => {
    if (!emailModal) return;
    setEmailSendingStep('sending');
    try {
      const res = await fetch(`${baseUrl}/api/invoices/${emailModal.invoiceId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ emailRecipient: emailModal.recipient })
      });

      if (!res.ok) throw new Error('Mailer dispatch failed.');
      const data = await res.json();
      
      setEmailSendingStep('success');
      setTimeout(() => {
        setEmailSendingStep('idle');
        setEmailModal(null);
      }, 2000);
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
      setEmailSendingStep('idle');
    }
  };

  // Dynamic KPI Grid mapping
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

  // Auth Guard
  if (!token || !user) {
    return <Auth onAuthSuccess={(t, u) => {
      localStorage.setItem('vb_token', t);
      setToken(t);
      setUser(u);
    }} />;
  }

  const currentRole = user.role;

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
        currentRole={currentRole}
      />

      <div
        id="main-content-panel"
        className="relative flex flex-col flex-1 min-w-0 overflow-hidden"
        style={{ backgroundColor: '#ededed' }}
      >
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
            <div className="flex items-center gap-2 text-sm font-semibold text-black select-none">
              <LayoutGrid className="size-4 text-black shrink-0" />
              <span className="capitalize">{activeTab === 'dashboard' ? 'Procurement Hub' : activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 border border-[#dedede] px-2.5 py-1 bg-neutral-50">
              <span className="text-[9px] font-mono font-bold uppercase text-neutral-400">Authenticated:</span>
              <span className="text-[11px] font-bold text-emerald-700 font-mono">{user.fullName} ({currentRole})</span>
            </div>

            <div className="relative">
              <button
                id="header-toggle-bell"
                title="System Alerts"
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="p-1.5 rounded-sm hover:bg-[#ededed] text-neutral-800 relative transition-colors cursor-pointer"
              >
                <Bell className="size-4" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 size-1.5 rounded-full bg-red-600 animate-ping" />
                )}
              </button>
              {showNotificationsDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotificationsDropdown(false)} />
                  <div className="absolute right-0 mt-1.5 z-50 w-80 rounded border border-[#dedede] bg-white shadow-lg py-2 text-xs text-neutral-850 max-h-96 overflow-y-auto">
                    <div className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider text-neutral-400 border-b border-[#efefef] font-bold flex justify-between items-center select-none">
                      <span>Notifications</span>
                      {notifications.filter(n => !n.read).length > 0 && (
                        <button
                          onClick={async () => {
                            await fetch(`${baseUrl}/api/notifications/read-all`, {
                              method: 'POST',
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            fetchAllData();
                          }}
                          className="text-black underline hover:text-neutral-600 cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-neutral-400 font-mono text-[10px] select-none">No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={async () => {
                            if (!n.read) {
                              await fetch(`${baseUrl}/api/notifications/${n.id}/read`, {
                                method: 'PATCH',
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              fetchAllData();
                            }
                          }}
                          className={`p-3 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors ${!n.read ? 'bg-neutral-50/50 font-bold text-black' : 'text-neutral-500'}`}
                        >
                          <p className="leading-normal">{n.message}</p>
                          <span className="text-[9px] font-mono text-neutral-400 mt-1 block select-none">{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out Session"
              className="px-2.5 py-1 text-[11px] border border-black hover:bg-black hover:text-white transition-colors uppercase font-bold tracking-wider rounded cursor-pointer"
            >
              Log Out
            </button>
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
                onViewAll={() => setActiveTab('purchaseorders_invoices')}
                onAddOrder={(newOrder) => setRecentPos([newOrder, ...recentPos])}
                onUpdateStatus={async (id, status) => {
                  try {
                    await fetch(`${baseUrl}/api/purchase-orders/${id}/status`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                      },
                      body: JSON.stringify({ status })
                    });
                    fetchAllData();
                  } catch (err) {
                    console.error(err);
                  }
                }}
                currentRole={currentRole}
                spendTrend={spendTrend}
              />
            )}

            {activeTab === 'rfqs' && (
              <div className="bg-white border border-[#dedede] rounded p-6 animate-fade-in space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Request for Quotation (RFQs) Registry</h2>
                    <p className="text-xs text-neutral-500 font-mono mt-1">Draft, send, and review incoming requests for materials.</p>
                  </div>
                  {currentRole === 'Procurement Officer' && (
                    <button
                      id="new-rfq-drawer-trigger"
                      onClick={() => setActiveTab('rfqs_new')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded font-semibold text-xs uppercase tracking-wider transition-colors"
                    >
                      <Plus className="size-3.5" />
                      <span>Create RFQ Request</span>
                    </button>
                  )}
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
                        <th className="pb-3 pr-3">Deadline</th>
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
                          <td className="font-mono text-neutral-500">{rfq.deadline || 'N/A'}</td>
                          <td className="text-right">
                            <span className={`inline-block px-2 py-0.5 rounded border text-[10px] uppercase font-bold ${
                              rfq.status === 'Sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
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

            {activeTab === 'rfqs_new' && (
              <Rfqcomponents
                onPublish={handlePublishNewRfq}
                onCancel={() => setActiveTab('rfqs')}
              />
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
                        <th className="pb-3">Vendor Identity</th>
                        <th className="pb-3 text-right">Quoted Price</th>
                        <th className="pb-3 text-right">Lead Period</th>
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
                            <span className={`inline-block px-2.5 py-0.5 rounded border text-[10px] uppercase font-bold ${
                              q.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                              q.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                              'bg-amber-50 text-amber-700 border-amber-300'
                            }`}>
                              {q.status}
                            </span>
                          </td>
                          <td className="text-right">
                            {q.status === 'Pending Review' && ['Admin', 'Manager / Approver'].includes(currentRole) ? (
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
                  <p className="text-xs text-neutral-500 font-mono mt-1">Direct pipeline of cost authorization items requiring clearance.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-neutral-200 rounded p-4 bg-amber-50/50 flex items-start gap-3">
                    <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-black uppercase tracking-wider">Interactive Clearances</h4>
                      <p className="text-xs text-neutral-600 mt-1 leading-normal">Click accept on the pending bids below to process. This interface dynamically updates the workspace approvals counter.</p>
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
                        <th className="pb-3">Vendor ID</th>
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
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${
                                v.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
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

            {activeTab === 'comparison' && (
              <div className="bg-white border border-[#dedede] p-6 animate-fade-in space-y-6 shadow-xs rounded-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dedede] pb-5">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-neutral-900">Quotation Comparison Hub</h2>
                    <p className="text-xs text-neutral-500 font-mono mt-1">Side-by-side analysis of incoming vendor bids to determine lowest price.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-mono font-bold uppercase text-neutral-400">Compare RFQ:</label>
                    <select
                      value={selectedComparisonRfq}
                      onChange={(e) => setSelectedComparisonRfq(e.target.value)}
                      className="text-xs p-2 bg-white border border-[#dedede] outline-none focus:border-black font-semibold transition-colors cursor-pointer"
                    >
                      {rfqs.map(r => (
                        <option key={r.id} value={r.id}>#{r.id} - {r.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {(() => {
                  const comparedQuotes = quotations.filter(q => q.rfqId === selectedComparisonRfq);
                  if (comparedQuotes.length === 0) {
                    return (
                      <div className="py-12 border border-dashed border-neutral-300 text-center text-xs font-mono text-neutral-400">
                        No quotations submitted for this RFQ yet.
                      </div>
                    );
                  }

                  const minAmount = Math.min(...comparedQuotes.map(q => q.amount));
                  const maxAmount = Math.max(...comparedQuotes.map(q => q.amount));
                  const avgAmount = comparedQuotes.reduce((acc, q) => acc + q.amount, 0) / comparedQuotes.length;
                  const fastestLead = Math.min(...comparedQuotes.map(q => q.deliveryTimeDays));

                  return (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 border border-[#dedede] divide-y md:divide-y-0 md:divide-x divide-[#dedede] bg-neutral-50/50">
                        <div className="p-4 flex flex-col">
                          <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">Lowest Quoted Bid</span>
                          <span className="text-2xl font-mono font-bold text-emerald-700 mt-1">${minAmount.toLocaleString()}</span>
                          <span className="text-[10px] text-neutral-500 mt-1">Best Cost Advantage</span>
                        </div>
                        <div className="p-4 flex flex-col">
                          <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">Average Quotation</span>
                          <span className="text-2xl font-mono font-bold text-black mt-1">${Math.round(avgAmount).toLocaleString()}</span>
                          <span className="text-[10px] text-neutral-500 mt-1">Market Standard Baseline</span>
                        </div>
                        <div className="p-4 flex flex-col">
                          <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">Highest Bid Price</span>
                          <span className="text-2xl font-mono font-bold text-rose-700 mt-1">${maxAmount.toLocaleString()}</span>
                          <span className="text-[10px] text-neutral-500 mt-1">Maximum Risk Premium</span>
                        </div>
                        <div className="p-4 flex flex-col">
                          <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">Fastest Delivery</span>
                          <span className="text-2xl font-mono font-bold text-blue-700 mt-1">{fastestLead} Days</span>
                          <span className="text-[10px] text-neutral-500 mt-1">Optimal Lead Time Match</span>
                        </div>
                      </div>

                      <div className="border border-[#dedede] p-5 space-y-4">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-black font-mono">Relative Pricing Spectrum</h3>
                        <div className="space-y-3">
                          {comparedQuotes.map((q) => {
                            const isLowest = q.amount === minAmount;
                            const percentageOfMin = Math.round(((q.amount - minAmount) / minAmount) * 100);
                            const widthPercent = Math.max(10, Math.min(100, (q.amount / maxAmount) * 100));
                            return (
                              <div key={q.id} className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-black flex items-center gap-1.5">
                                    {q.vendorName}
                                    {isLowest && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[8px] font-bold uppercase tracking-wide">Lowest</span>}
                                  </span>
                                  <span className="font-mono text-neutral-600">
                                    ${q.amount.toLocaleString()} {q.amount > minAmount && <span className="text-rose-600 font-bold">(+{percentageOfMin}%)</span>}
                                  </span>
                                </div>
                                <div className="h-4 bg-neutral-100 relative">
                                  <div
                                    className={`h-full transition-all duration-500 ${isLowest ? 'bg-emerald-600' : 'bg-neutral-800'}`}
                                    style={{ width: `${widthPercent}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border border-[#dedede] overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[#dedede] bg-neutral-50 text-[10px] font-mono uppercase text-neutral-500">
                              <th className="py-3 px-4 font-bold">Supplier Identity</th>
                              <th className="py-3 px-4 text-center font-bold">Lead Time</th>
                              <th className="py-3 px-4 text-right font-bold">Bid Offer</th>
                              <th className="py-3 px-4 text-center font-bold">Clearance Status</th>
                              <th className="py-3 px-4 text-right font-bold">Workspace Approvals</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#efefef] text-xs">
                            {comparedQuotes.map((q) => {
                              const isLowest = q.amount === minAmount;
                              return (
                                <tr key={q.id} className={`h-12 hover:bg-neutral-50/50 transition-colors ${isLowest ? 'bg-emerald-50/20' : ''}`}>
                                  <td className="py-2 px-4">
                                    <div className="font-bold text-black text-sm">{q.vendorName}</div>
                                    <span className="text-[10px] text-neutral-400 font-mono">Proposal Reference {q.id}</span>
                                  </td>
                                  <td className="py-2 px-4 text-center font-mono">{q.deliveryTimeDays} working days</td>
                                  <td className="py-2 px-4 text-right font-mono font-bold text-neutral-800">${q.amount.toLocaleString()}</td>
                                  <td className="py-2 px-4 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded border text-[9px] uppercase font-bold ${
                                      q.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                      q.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                      'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                      {q.status}
                                    </span>
                                  </td>
                                  <td className="py-2 px-4 text-right">
                                    {q.status === 'Pending Review' && ['Admin', 'Manager / Approver'].includes(currentRole) ? (
                                      <div className="inline-flex gap-1.5 justify-end">
                                        <button
                                          id={`accept-comparison-${q.id}`}
                                          onClick={() => handleApproveQuotation(q.id)}
                                          className="px-2.5 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                                        >
                                          Accept Bid
                                        </button>
                                        <button
                                          onClick={() => handleRejectQuotation(q.id)}
                                          className="px-2.5 py-1 border border-[#ced4da] rounded text-[10px] font-bold uppercase tracking-wider hover:border-black transition-colors cursor-pointer"
                                        >
                                          Decline
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="font-mono text-[10px] text-neutral-400">Processed</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === 'purchaseorders_invoices' && (
              <div className="bg-white border border-[#dedede] rounded-xl p-6 animate-fade-in space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dedede] pb-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-neutral-900">Purchase Orders & Invoices Ledger</h2>
                    <p className="text-xs text-neutral-500 font-mono mt-1">Review, generate, print, and email official procurement files.</p>
                  </div>
                  {currentRole !== 'Vendor' && (
                    <div className="inline-flex rounded-lg border border-[#dedede] p-1 bg-neutral-50 shrink-0">
                      <button
                        onClick={() => setPoInvoiceTab('po')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${
                          poInvoiceTab === 'po' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
                        }`}
                      >
                        Purchase Orders
                      </button>
                      <button
                        onClick={() => setPoInvoiceTab('invoices')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${
                          poInvoiceTab === 'invoices' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
                        }`}
                      >
                        Invoices
                      </button>
                    </div>
                  )}
                </div>

                {(poInvoiceTab === 'po' || currentRole === 'Vendor') ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-black">Purchase Orders</h3>
                      {currentRole === 'Procurement Officer' && (
                        <button
                          onClick={() => setShowPoFormLedger(!showPoFormLedger)}
                          className="flex items-center gap-1 px-3 py-1.5 border border-[#dedede] hover:border-black rounded-lg text-xs font-semibold bg-white text-neutral-700 hover:text-black transition-colors"
                        >
                          <Plus className="size-3.5" />
                          <span>Generate PO</span>
                        </button>
                      )}
                    </div>

                    {showPoFormLedger && (
                      <form onSubmit={handleLedgerCreatePo} className="p-4 border border-black rounded-xl bg-neutral-50 space-y-4 animate-fade-in">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-black">New Procurement Purchase Order Parameters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">Vendor/Supplier</label>
                            <input type="text" required placeholder="e.g. Apex Industrial Supplies" value={ledgerPoVendor} onChange={(e) => setLedgerPoVendor(e.target.value)} className="w-full text-xs p-2 bg-white border border-[#dedede] rounded-lg outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">Product Description</label>
                            <input type="text" required placeholder="e.g. Grade 5 Titanium Rods" value={ledgerPoProduct} onChange={(e) => setLedgerPoProduct(e.target.value)} className="w-full text-xs p-2 bg-white border border-[#dedede] rounded-lg outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">Quantity</label>
                            <input type="number" required value={ledgerPoQty} onChange={(e) => setLedgerPoQty(e.target.value)} className="w-full text-xs p-2 bg-white border border-[#dedede] rounded-lg outline-none font-mono font-bold" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">Unit Price ($)</label>
                            <input type="text" required value={ledgerPoPrice} onChange={(e) => setLedgerPoPrice(e.target.value)} className="w-full text-xs p-2 bg-white border border-[#dedede] rounded-lg outline-none font-mono font-bold" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 text-xs font-semibold">
                          <button type="button" onClick={() => setShowPoFormLedger(false)} className="px-3 py-1.5 border border-[#ced4da] rounded-lg text-neutral-600 bg-white">Dismiss</button>
                          <button type="submit" className="px-4 py-1.5 bg-black text-white rounded-lg hover:bg-neutral-800">Generate PO File</button>
                        </div>
                      </form>
                    )}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-[#dedede] text-[10px] font-mono uppercase text-neutral-400">
                            <th className="pb-3 px-2">PO Code</th>
                            <th className="pb-3 px-2">Vendor Destination</th>
                            <th className="pb-3 px-2">Product Description</th>
                            <th className="pb-3 px-2 text-right">Items Qty</th>
                            <th className="pb-3 px-4 text-right">Commitment Value</th>
                            <th className="pb-3 text-right">Tracking</th>
                            <th className="pb-3 text-center pr-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#efefef] text-xs">
                          {recentPos.map((po) => (
                            <tr key={po.id} className="hover:bg-[#fafafa] transition-colors h-14">
                              <td className="font-mono font-bold text-neutral-500 px-2">{po.id}</td>
                              <td className="font-bold text-black text-sm px-2">{po.vendorName}</td>
                              <td className="text-neutral-500 text-xs px-2">{po.product}</td>
                              <td className="text-right font-mono text-neutral-700 px-2">{po.qty.toLocaleString()} units</td>
                              <td className="text-right font-mono font-bold text-black px-4">${po.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td>
                                <span className={`inline-block px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase ${
                                  po.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  po.status === 'In Transit' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  po.status === 'Pending Approval' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  {po.status}
                                </span>
                              </td>
                              <td className="text-right pr-2">
                                <span className="text-[10px] font-mono text-neutral-400">View Only</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-black">Recorded Invoices</h3>
                      {currentRole === 'Procurement Officer' && (
                        <button
                          onClick={() => setShowInvoiceForm(!showInvoiceForm)}
                          className="flex items-center gap-1 px-3 py-1.5 border border-[#dedede] hover:border-black rounded-lg text-xs font-semibold bg-white text-neutral-700 hover:text-black transition-colors"
                        >
                          <Plus className="size-3.5" />
                          <span>Upload Invoice</span>
                        </button>
                      )}
                    </div>

                    {showInvoiceForm && (
                      <form onSubmit={handleCreateInvoice} className="p-4 border border-black rounded-xl bg-neutral-50 space-y-4 animate-fade-in">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-black">Inbound Vendor Invoice Parameters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">Select Purchase Order (PO)</label>
                            <select value={invPoId} onChange={(e) => setInvPoId(e.target.value)} className="w-full text-xs p-2 bg-white border border-[#dedede] rounded-lg outline-none font-mono">
                              <option value="">-- Choose PO --</option>
                              {recentPos.map(p => (<option key={p.id} value={p.id}>{p.id} (${p.total.toLocaleString()})</option>))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">Vendor Entity</label>
                            <select value={invVendor} onChange={(e) => setInvVendor(e.target.value)} className="w-full text-xs p-2 bg-white border border-[#dedede] rounded-lg outline-none font-semibold">
                              <option value="">-- Choose Vendor --</option>
                              {vendors.map(v => (<option key={v.id} value={v.name}>{v.name}</option>))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">Invoice Dollar value</label>
                            <input type="text" required value={invAmount} onChange={(e) => setInvAmount(e.target.value)} placeholder="e.g. 14500" className="w-full text-xs p-2 bg-white border border-[#dedede] rounded-lg outline-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">Accounting Status</label>
                            <select value={invStatus} onChange={(e) => setInvStatus(e.target.value as any)} className="w-full text-xs p-2 bg-white border border-[#dedede] rounded-lg outline-none font-semibold">
                              <option value="Pending">Pending</option>
                              <option value="Paid">Paid</option>
                              <option value="Overdue">Overdue</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 text-xs font-semibold">
                          <button type="button" onClick={() => setShowInvoiceForm(false)} className="px-3 py-1.5 border border-[#ced4da] rounded-lg text-neutral-600 bg-white">Dismiss</button>
                          <button type="submit" className="px-4 py-1.5 bg-black text-white rounded-lg hover:bg-neutral-800">Record Invoice</button>
                        </div>
                      </form>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-[#dedede] text-[10px] font-mono uppercase text-neutral-400">
                            <th className="pb-3 px-2">Invoice Code</th>
                            <th className="pb-3 px-2">Matched PO</th>
                            <th className="pb-3 px-2">Vendor Business</th>
                            <th className="pb-3 px-2 text-right">Invoiced Amount</th>
                            <th className="pb-3 text-right">Payment Status</th>
                            <th className="pb-3 text-center pr-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#efefef] text-sm">
                          {invoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-[#fafafa] transition-colors h-14">
                              <td className="font-mono font-bold text-black px-2">{inv.id}</td>
                              <td className="font-mono text-neutral-400 px-2">{inv.poId}</td>
                              <td className="font-bold text-black text-sm px-2">{inv.vendorName}</td>
                              <td className="text-right font-mono font-bold text-black px-2">${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td>
                                <span className={`inline-block px-2.5 py-0.5 rounded border text-[9px] uppercase font-bold ${
                                  inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                                  inv.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                                  'bg-amber-100 text-amber-800 border-amber-300'
                                }`}>
                                  {inv.status}
                                </span>
                              </td>
                              <td className="text-right pr-2">
                                <div className="inline-flex items-center gap-1.5 justify-end">
                                  <button
                                    onClick={() => handleDownloadPDF(inv)}
                                    className="p-1.5 rounded hover:bg-neutral-100 text-neutral-600 hover:text-black transition-colors border border-neutral-200 cursor-pointer font-bold flex items-center gap-1"
                                    title="Download PDF"
                                  >
                                    <Download className="size-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const matchedVendor = vendors.find(v => v.name === inv.vendorName);
                                      const recipientEmail = matchedVendor ? matchedVendor.contactEmail : user.email;
                                      setEmailModal({ open: true, recipient: recipientEmail, subject: `[Invoice Attached] Invoice ${inv.id}`, body: `Please find attached Invoice ${inv.id} for $${inv.amount}.`, invoiceId: inv.id });
                                    }}
                                    className="p-1.5 rounded hover:bg-neutral-100 text-neutral-600 hover:text-black transition-colors border border-neutral-200 cursor-pointer"
                                    title="Email PDF"
                                  >
                                    <Mail className="size-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'vendor_submit_quote' && (
              <div className="bg-white border border-[#dedede] rounded-xl p-6 animate-fade-in space-y-6 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-neutral-900">Submit Quote Proposal</h2>
                  <p className="text-xs text-neutral-500 font-mono mt-1">Submit quotation bid details in response to an active organization RFQ.</p>
                </div>

                <form onSubmit={handleVendorSubmitQuote} className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-neutral-400 mb-1.5">Select Target RFQ</label>
                    <select
                      value={vQuoteRfq}
                      onChange={(e) => setVQuoteRfq(e.target.value)}
                      className="w-full text-xs p-3 bg-white border border-[#dedede] outline-none focus:border-black font-semibold"
                    >
                      <option value="">-- Choose RFQ --</option>
                      {rfqs.map(r => (
                        <option key={r.id} value={r.id}>#{r.id} - {r.title} ({r.vendorCategory})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-neutral-400 mb-1.5">Supplier Name</label>
                    <input
                      type="text"
                      disabled
                      value={user.fullName}
                      className="w-full text-xs p-3 bg-neutral-100 border border-[#dedede] outline-none font-bold text-neutral-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-neutral-400 mb-1.5">Quoted Price ($)</label>
                      <input
                        type="number"
                        required
                        value={vQuoteAmount}
                        onChange={(e) => setVQuoteAmount(e.target.value)}
                        placeholder="e.g. 12500"
                        className="w-full text-xs p-3 bg-white border border-[#dedede] outline-none focus:border-black font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-neutral-400 mb-1.5">Delivery Lead Time (Days)</label>
                      <input
                        type="number"
                        required
                        value={vQuoteDelivery}
                        onChange={(e) => setVQuoteDelivery(e.target.value)}
                        className="w-full text-xs p-3 bg-white border border-[#dedede] outline-none focus:border-black font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-neutral-400 mb-1.5">Quotation Remarks</label>
                    <textarea
                      value={vQuoteNotes}
                      onChange={(e) => setVQuoteNotes(e.target.value)}
                      placeholder="Special logistics terms, discount offers, etc."
                      className="w-full text-xs p-3 bg-white border border-[#dedede] outline-none focus:border-black resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Submit Quote Proposal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white border border-[#dedede] rounded-xl p-6 animate-fade-in space-y-6 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">System & Account Settings</h2>
                  <p className="text-xs text-neutral-500 font-mono mt-1">Configure ERP configurations, workflows, and role-based access parameters.</p>
                </div>
                <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-100 text-xs">
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-black">Role-Based Approvals</p>
                      <p className="text-neutral-500">Require supervisor signatures for purchases exceeding $10,000.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="accent-black" />
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-black">Automatic Sourcing Matches</p>
                      <p className="text-neutral-500">Allow AI Smart Sourcing to auto-tag preferred vendors on RFQ publication.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="accent-black" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="bg-white border border-[#dedede] rounded p-6 animate-fade-in space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Workspace Procurement Reports</h2>
                  <p className="text-xs text-neutral-500 font-mono mt-1">Export summary compliance datasets directly in CSV formats.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="border border-neutral-300 rounded p-6 flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-black uppercase tracking-wide">Q2 Material Procurement Report</h4>
                      <p className="text-xs text-neutral-500 mt-1 leading-normal">Consolidated ledger of all quotation bids, approved PO commitment totals, and active material supplier compliance metrics.</p>
                    </div>
                    <button onClick={() => window.print()} className="w-full py-2 bg-black text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer">Print PDF Document</button>
                  </div>
                  <div className="border border-neutral-300 rounded p-6 flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-black uppercase tracking-wide">Registered Compliance Matrix</h4>
                      <p className="text-xs text-neutral-500 mt-1 leading-normal">Compliance logs details summarizing delivery delay rates and quality verification rejects for all registered vendors.</p>
                    </div>
                    <button
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8," 
                          + "Vendor ID,Name,Category,Email,Rating,Status\n"
                          + vendors.map(v => `${v.id},"${v.name}","${v.category}","${v.contactEmail}",${v.rating},${v.status}`).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "vendor_compliance_report.csv");
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                      }}
                      className="w-full py-2 bg-black text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Export CSV Spreadsheet
                    </button>
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
                  {activityLogs.map((act) => (
                    <div key={act.id} className="flex items-start justify-between p-4 border border-[#eee] rounded hover:border-black transition-colors gap-3 bg-[#fafafa]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-neutral-400">[{act.id.substring(0, 8)}]</span>
                          <h4 className="text-sm font-bold text-black">{act.title}</h4>
                        </div>
                        <p className="text-xs text-neutral-600">{act.detail}</p>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono shrink-0 whitespace-nowrap">{new Date(act.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                  {activityLogs.length === 0 && (
                    <div className="py-12 border border-dashed border-neutral-300 rounded text-center text-xs font-mono text-neutral-400">
                      No system events logged in this organization session yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white border border-[#dedede] p-0 animate-fade-in space-y-0 shadow-xs rounded-none overflow-hidden">
                <div className="h-48 w-full relative">
                  <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
                    alt="Corporate Workspace Hero"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/45" />
                  <div className="absolute bottom-6 left-6 flex items-end gap-4">
                    <div className="h-20 w-20 border-2 border-white bg-black flex items-center justify-center text-white font-bold text-xl uppercase">
                      {user.fullName.substring(0, 2)}
                    </div>
                    <div className="mb-1 text-white">
                      <h2 className="text-xl font-bold">{user.fullName}</h2>
                      <p className="text-xs text-neutral-300 font-mono font-medium">{currentRole} • Enterprise Sourcing</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-black uppercase tracking-wider font-mono">Profile Details</h3>
                    <p className="text-xs text-neutral-500 font-mono mt-0.5">Primary user details matching role configurations.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-neutral-400 mb-1">Full Name</label>
                        <input
                          type="text"
                          disabled
                          value={user.fullName}
                          className="w-full p-2.5 bg-neutral-50 border border-[#dedede] text-neutral-600 font-bold outline-none cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-neutral-400 mb-1">Email Coordinates</label>
                        <input
                          type="text"
                          disabled
                          value={user.email}
                          className="w-full p-2.5 bg-neutral-50 border border-[#dedede] text-neutral-600 font-mono outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-neutral-400 mb-1">Functional Department</label>
                        <input
                          type="text"
                          disabled
                          value={currentRole === 'Procurement Officer' ? 'Global Supply Sourcing' : currentRole === 'Vendor' ? 'Industrial Logistics' : currentRole === 'Manager / Approver' ? 'Executive Oversight' : 'System Administration'}
                          className="w-full p-2.5 bg-neutral-50 border border-[#dedede] text-neutral-600 font-bold outline-none cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-neutral-400 mb-1">Assigned Security Permissions</label>
                        <div className="p-2.5 border border-[#dedede] bg-neutral-50 font-mono text-[10px] text-neutral-500 uppercase tracking-tight font-bold">
                          {currentRole === 'Procurement Officer' ? 'CREATE_RFQ, GENERATE_PO, COMPARE_BIDS, RECORD_INVOICES' :
                           currentRole === 'Vendor' ? 'SUBMIT_BIDS, TRACK_RFQ, READ_PO' :
                           currentRole === 'Manager / Approver' ? 'APPROVE_QUOTES, DECLINE_QUOTES, AUDIT_WORKFLOWS' :
                           'MANAGE_SYSTEM, VIEW_ANALYTICS, ALL_OPERATIONS'}
                        </div>
                      </div>
                    </div>
                  </div>
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
                    <li><strong>Spend Analysis:</strong> Real-time charts powered by Recharts with flat black top border lines.</li>
                    <li><strong>Clear Audit Logs:</strong> Click on buttons to dismiss items or trigger quotations which updates standard states.</li>
                  </ul>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Email Modal Dialog Overlay */}
      {emailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-neutral-200 overflow-hidden">
            <div className="flex justify-between items-center border-b border-neutral-100 p-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                Email Document Transfer
              </span>
              <button onClick={() => setEmailModal(null)} className="text-neutral-400 hover:text-black">
                <X className="size-4" />
              </button>
            </div>
            
            {emailSendingStep === 'sending' ? (
              <div className="p-8 flex flex-col items-center justify-center gap-3 text-xs">
                <svg className="animate-spin size-8 text-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="font-mono text-neutral-500 animate-pulse">Engaging SMTP Handshakes & Attaching Invoice PDF...</p>
              </div>
            ) : emailSendingStep === 'success' ? (
              <div className="p-8 flex flex-col items-center justify-center gap-3 text-xs">
                <div className="size-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold animate-bounce">
                  ✓
                </div>
                <p className="font-mono text-emerald-700 font-bold">Email Transmitted Successfully!</p>
              </div>
            ) : (
              <>
                <div className="p-5 space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase text-neutral-400">Recipient Email Address</label>
                    <input
                      type="email"
                      value={emailModal.recipient}
                      onChange={(e) => setEmailModal({ ...emailModal, recipient: e.target.value })}
                      className="w-full text-xs p-2.5 bg-white border border-[#dedede] rounded-lg outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase text-neutral-400">Subject Title</label>
                    <input
                      type="text"
                      value={emailModal.subject}
                      onChange={(e) => setEmailModal({ ...emailModal, subject: e.target.value })}
                      className="w-full text-xs p-2.5 bg-white border border-[#dedede] rounded-lg outline-none focus:border-black transition-colors font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase text-neutral-400">Message Context Body</label>
                    <textarea
                      rows={4}
                      value={emailModal.body}
                      onChange={(e) => setEmailModal({ ...emailModal, body: e.target.value })}
                      className="w-full text-xs p-2.5 bg-white border border-[#dedede] rounded-lg outline-none focus:border-black transition-colors resize-none leading-relaxed"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-neutral-100 p-4 bg-neutral-50/50">
                  <button
                    onClick={() => setEmailModal(null)}
                    className="px-4 py-2 border border-[#dedede] bg-white text-neutral-700 hover:bg-neutral-50 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={handleEmailInvoice}
                    className="flex items-center gap-1.5 px-5 py-2 bg-black text-white hover:bg-neutral-800 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Send className="size-3.5" />
                    <span>Send PDF Invoice</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
