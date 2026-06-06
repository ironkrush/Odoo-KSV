import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Filter, Plus, MoreHorizontal, ArrowRight, X, Check } from 'lucide-react';
import { KPIMetric } from '../types';

export interface PurchaseOrderRecord {
  id: string;
  vendor: string;
  vendorName?: string;
  product: string;
  status: 'Delivered' | 'In Transit' | 'Pending Approval' | 'Cancelled';
  qty: number;
  unitPrice: number;
  total: number;
}

interface DashboardProps {
  metrics: KPIMetric[];
  orders: PurchaseOrderRecord[];
  onViewAll: () => void;
  onAddOrder: (newOrder: PurchaseOrderRecord) => void;
  onUpdateStatus: (id: string, newStatus: PurchaseOrderRecord['status']) => void;
  currentRole: 'Procurement Officer' | 'Vendor' | 'Manager / Approver' | 'Admin';
  spendTrend?: { day: string; spend: number }[];
}

const dailySpend = [
  { day: 'Mon', spend: 8200 },
  { day: 'Tue', spend: 7400 },
  { day: 'Wed', spend: 11200 },
  { day: 'Thu', spend: 12800 },
  { day: 'Fri', spend: 14900 },
  { day: 'Sat', spend: 12100 },
  { day: 'Sun', spend: 19800 },
];

function GradientBar(props: any) {
  const { x, y, width, height, index } = props;
  const gId = `bar-grad-${index}`;
  if (!width || !height || width <= 0 || height <= 0) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={2.5} fill="#000" stroke="none" />
      <rect x={x} y={y + 2.5} width={width} height={height - 2.5} fill={`url(#${gId})`} stroke="none" />
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.02" />
        </linearGradient>
      </defs>
    </g>
  );
}

export default function Dashboard({ metrics, orders, onViewAll, onAddOrder, onUpdateStatus, currentRole, spendTrend }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showNewPoForm, setShowNewPoForm] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [newVendor, setNewVendor] = useState('');
  const [newProduct, setNewProduct] = useState('');
  const [newQty, setNewQty] = useState('100');
  const [newPrice, setNewPrice] = useState('15.00');
  const [newStatus, setNewStatus] = useState<PurchaseOrderRecord['status']>('Pending Approval');

  const chartData = (spendTrend || dailySpend).map(d => ({ name: d.day, val: d.spend }));

  const filteredOrders = useMemo(() => {
    return orders.filter(item => {
      const matchSearch =
        (item.vendor || item.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleSubmitNewPo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor || !newProduct) return;
    const qtyNum = parseInt(newQty, 10);
    const unitPriceNum = parseFloat(newPrice);
    if (isNaN(qtyNum) || qtyNum <= 0 || isNaN(unitPriceNum) || unitPriceNum < 0) return;
    const numberString = orders.length > 0
      ? (Math.max(...orders.map(o => parseInt(o.id.replace('#PO-', ''), 10))) + 1).toString()
      : '1005';
    onAddOrder({
      id: `#PO-${numberString}`,
      vendor: newVendor,
      product: newProduct,
      status: newStatus,
      qty: qtyNum,
      unitPrice: unitPriceNum,
      total: qtyNum * unitPriceNum
    });
    setNewVendor('');
    setNewProduct('');
    setNewQty('100');
    setNewPrice('15.00');
    setNewStatus('Pending Approval');
    setShowNewPoForm(false);
  };

  const getStatusStyle = (status: PurchaseOrderRecord['status']) => {
    switch (status) {
      case 'Delivered': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'In Transit': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Pending Approval': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Cancelled': return 'text-rose-700 bg-rose-50 border-rose-200';
      default: return 'text-neutral-700 bg-neutral-100 border-neutral-200';
    }
  };

  return (
    <>
      {/* WELCOME BANNER */}
      <div
        id="welcome-procurement-banner"
        className="relative rounded-md overflow-hidden bg-[#fafafa] border border-[#dedede] p-12 min-h-[180px] flex items-center shadow-xs"
      >
        <div className="absolute inset-0 z-0">
          <img
            src="/image.jpeg"
            alt="Workspace Landscape Illustration"
            className="w-full h-full object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-transparent z-10" />
        </div>
        <div className="relative z-20 flex flex-col items-start justify-center w-full max-w-xl">
          <h2 className="text-3xl font-bold text-black tracking-tight leading-tight">
            Welcome {currentRole === 'Procurement Officer' ? 'Shaban Haider' : currentRole === 'Vendor' ? 'Apex Supplier' : currentRole === 'Manager / Approver' ? 'Sarah Jenkins' : 'Admin User'}
          </h2>
          <p className="text-sm text-neutral-600 mt-2 font-medium">
            Here is the latest overview of your procurement workspace as {currentRole === 'Admin' ? 'an' : 'a'} {currentRole}.
          </p>
        </div>
        <div className="absolute right-12 top-1/2 -translate-y-1/2 z-20 hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
            alt="User Account Profile"
            className="size-20 border-2 border-black object-cover rounded-none"
          />
        </div>
      </div>

      {/* KPI + CHART + TABLE — zero gap between them */}
      <div className="space-y-0">

        {/* KPI GRID */}
        <div
          id="kpi-cards-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 bg-white border border-[#dedede] rounded-t-md divide-y lg:divide-y-0 lg:divide-x divide-[#dedede] shadow-xs"
        >
          {metrics.map((metric) => {
            const isPositive = metric.delta >= 0;
            return (
              <div
                key={metric.title}
                id={`kpi-card-${metric.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="relative flex flex-col bg-white p-8 transition-colors hover:bg-neutral-50/50 rounded-none"
              >
                <div className="mb-4">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                    {metric.title}
                  </span>
                </div>
                <div className="mb-2">
                  <p className="font-bold text-4xl text-black tracking-tight">{metric.value}</p>
                </div>

                {/* Horizontal Divider Line going all the way edge-to-edge */}
                <hr className="border-t border-[#dedede] my-4 -mx-8" />

                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className={`font-bold flex items-center gap-0.5 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isPositive ? '▲' : '▼'} {Math.abs(metric.delta)}%
                  </span>
                  <span className="text-neutral-400 font-medium">{metric.subtitle}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* PROCUREMENT SPEND CHART */}
        <div
          id="procurement-spend-chart-card"
          className="flex flex-col bg-white p-6 border-l border-r border-b border-[#dedede] rounded-none shadow-xs"
        >
          <div className="flex items-start justify-between gap-4 mb-6 select-none">
            <div>
              <h3 className="font-bold text-lg text-black tracking-tight">Procurement Spend Trend</h3>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">Daily procurement spend, last 7 days.</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1">
              <span>▲</span>
              <span>16.4%</span>
            </div>
          </div>
          <div id="spend-chart-viewport" className="h-64 w-full md:h-80 select-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  className="text-xs font-bold text-neutral-400 fill-neutral-400"
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded border border-[#dedede] bg-white p-3 shadow-sm">
                          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-0.5">
                            {payload[0].payload.name}
                          </p>
                          <p className="font-bold text-sm text-black">
                            ${payload[0].value?.toLocaleString()}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="val" fill="#000" shape={<GradientBar />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT PURCHASE ORDERS */}
        <div
          id="recent-purchase-orders-section"
          className="flex flex-col bg-white border-l border-r border-b border-[#dedede] rounded-b-md shadow-xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-[#dedede]">
            <div>
              <h3 className="font-bold text-lg text-black tracking-tight">Recent purchase orders</h3>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">Supplier status logs and details.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  id="recent-po-search-input"
                  type="text"
                  placeholder="Search purchase orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-60 pl-8 pr-3 py-1.5 text-xs bg-[#f5f5f5] border border-[#dedede] rounded outline-none focus:border-black transition-colors placeholder:text-neutral-400 font-mono"
                />
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-neutral-400" />
              </div>
              <div className="relative">
                <button
                  id="recent-po-filter-btn"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className={`flex items-center gap-1 px-3 py-1.5 border border-[#dedede] rounded text-xs font-semibold bg-white text-neutral-700 hover:text-black hover:border-black transition-colors ${statusFilter !== 'All' ? 'border-black bg-neutral-50 text-black' : ''}`}
                >
                  <Filter className="size-3 text-neutral-500" />
                  <span>Filter{statusFilter !== 'All' ? `: ${statusFilter}` : ''}</span>
                </button>
                {showFilterDropdown && (
                  <div id="po-status-filter-popover" className="absolute right-0 mt-1.5 z-40 w-44 rounded border border-[#dedede] bg-white shadow-lg py-1 text-xs">
                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-400 border-b border-[#efefef] font-bold">Filter by status</div>
                    {['All', 'Delivered', 'In Transit', 'Pending Approval', 'Cancelled'].map((st) => (
                      <button
                        key={st}
                        onClick={() => { setStatusFilter(st); setShowFilterDropdown(false); }}
                        className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-[#f5f5f5] transition-colors"
                      >
                        <span>{st}</span>
                        {statusFilter === st && <Check className="size-3.5 text-black" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {currentRole === 'Procurement Officer' && (
                <button
                  id="recent-po-create-btn"
                  onClick={() => setShowNewPoForm(!showNewPoForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded text-xs font-semibold transition-colors"
                >
                  <Plus className="size-3.5" />
                  <span>New PO</span>
                </button>
              )}
            </div>
          </div>

          {currentRole === 'Procurement Officer' && showNewPoForm && (
            <div className="border-b border-[#dedede] bg-neutral-50 p-6 animate-fade-in">
              <form onSubmit={handleSubmitNewPo} className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-neutral-400">Generate New Procurement Order</span>
                  <button type="button" onClick={() => setShowNewPoForm(false)} className="text-neutral-400 hover:text-black p-0.5 rounded">
                    <X className="size-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">Supplier/Vendor</label>
                    <input type="text" required placeholder="e.g. Titanium Forge Co" value={newVendor} onChange={(e) => setNewVendor(e.target.value)} className="w-full text-xs p-2 bg-white border border-[#dedede] rounded outline-none focus:border-black" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">Product Description</label>
                    <input type="text" required placeholder="e.g. Grade 5 Titanium Rods" value={newProduct} onChange={(e) => setNewProduct(e.target.value)} className="w-full text-xs p-2 bg-white border border-[#dedede] rounded outline-none focus:border-black" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">Qty</label>
                      <input type="number" required min="1" value={newQty} onChange={(e) => setNewQty(e.target.value)} className="w-full text-xs p-2 bg-white border border-[#dedede] rounded outline-none focus:border-black font-mono font-bold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">Price ($)</label>
                      <input type="text" required value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full text-xs p-2 bg-white border border-[#dedede] rounded outline-none focus:border-black font-mono font-bold" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-1">Initial Status</label>
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as any)} className="w-full text-xs p-2 bg-white border border-[#dedede] rounded outline-none focus:border-black font-semibold">
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full py-2 bg-black hover:bg-neutral-800 text-white rounded text-xs font-bold transition-all uppercase tracking-wider">Generate PO File</button>
                  </div>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#dedede] bg-neutral-50/50 text-[11px] font-semibold text-neutral-500 uppercase tracking-tight">
                  <th className="py-3 px-6 h-10">PO ID</th>
                  <th className="py-3 px-2 h-10">Vendor</th>
                  <th className="py-3 px-2 h-10">Product</th>
                  <th className="py-3 px-2 h-10">Status</th>
                  <th className="py-3 px-2 h-10 text-right">Qty</th>
                  <th className="py-3 px-2 h-10 text-right">Unit Price</th>
                  <th className="py-3 px-4 h-10 text-right">Total</th>
                  <th className="py-3 px-6 h-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efefef]">
                {filteredOrders.map((item) => (
                  <tr key={item.id} className="group hover:bg-neutral-50/70 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-neutral-500">{item.id}</td>
                    <td className="py-4 px-2 font-bold text-sm text-black">{item.vendor || item.vendorName}</td>
                    <td className="py-4 px-2 text-xs text-neutral-500">{item.product}</td>
                    <td className="py-4 px-2">
                      <span className={`inline-block px-2.5 py-0.5 rounded border text-[10px] font-mono uppercase tracking-tight font-bold ${getStatusStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right font-mono text-xs text-neutral-800 font-bold">{item.qty.toLocaleString()}</td>
                    <td className="py-4 px-2 text-right font-mono text-xs text-neutral-500">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-4 px-4 text-right font-mono text-sm font-bold text-black">${item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-4 px-6 text-center relative">
                      {currentRole === 'Procurement Officer' ? (
                        <>
                          <button
                            id={`po-menu-btn-${item.id}`}
                            onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                            className="p-1 rounded hover:bg-[#ededed] text-neutral-400 hover:text-black transition-colors"
                          >
                            <MoreHorizontal className="size-4" />
                          </button>
                          {activeMenuId === item.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                              <div className="absolute right-6 top-10 z-50 w-44 rounded border border-[#dedede] bg-white shadow-lg py-1 text-left text-xs">
                                <div className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider text-neutral-400 border-b border-[#efefef] font-bold">Quick status update</div>
                                {(['Delivered', 'In Transit', 'Pending Approval', 'Cancelled'] as PurchaseOrderRecord['status'][]).map((st) => (
                                  <button
                                    key={st}
                                    onClick={() => { onUpdateStatus(item.id, st); setActiveMenuId(null); }}
                                    className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-[#f1f1f1] transition-all"
                                  >
                                    <span>Mark {st}</span>
                                    {item.status === st && <Check className="size-3 text-black font-bold" />}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] font-mono text-neutral-400">View Only</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-xs font-mono text-neutral-400">
                      No purchase orders matched your current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-[#dedede] bg-neutral-50/55 text-xs text-neutral-500 font-mono select-none">
            <div>Showing {filteredOrders.length} recent purchase orders</div>
            <button
              id="po-view-all-redirect"
              onClick={onViewAll}
              className="flex items-center gap-1 font-semibold text-[#111111] hover:underline hover:text-neutral-600 transition-colors"
            >
              <span>View all orders</span>
              <ArrowRight className="size-3.5 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
