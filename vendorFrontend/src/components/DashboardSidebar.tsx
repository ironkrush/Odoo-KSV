import React, { useState } from 'react';
import {
  LayoutGrid,
  Briefcase,
  Users,
  Package,
  BarChart2,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  BookOpen,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function DashboardSidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) {
  const [procurementOpen, setProcurementOpen] = useState(true);

  return (
    <>
      {isOpen && (
        <div
          id="sidebar-backdrop"
          className="fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed inset-y-4 left-4 z-50 flex w-64 flex-col
border border-[#dedede] bg-[#fafafa] text-[#111]
rounded-xl shadow-lg
transition-transform duration-300
md:static md:translate-x-0 md:inset-y-0 md:left-0 md:rounded-none md:shadow-none
${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-[#dedede] px-6">
          <div className="flex items-center gap-2 select-none">
            <div className="flex size-6 items-center justify-center text-black" title="VendorBridge Logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black">
                <rect x="2" y="8" width="6" height="8" rx="1.5" fill="black" />
                <rect x="16" y="8" width="6" height="8" rx="1.5" fill="black" />
                <rect x="8" y="11" width="8" height="2" fill="black" />
              </svg>
            </div>
            <span className="font-bold text-black tracking-tight text-sm">VendorBridge</span>
          </div>
          <button
            id="close-sidebar-button"
            className="rounded-md p-1 hover:bg-[#ededed] text-black md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
          <div>
            <p className="px-3 mb-3 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              Core Modules
            </p>
            <nav id="primary-navigation" className="space-y-1">

              <button
                id="nav-item-dashboard"
                onClick={() => {
                  setActiveTab('dashboard');
                  setIsOpen(false);
                }}
                className={`nav-indicator flex w-full items-center gap-3 rounded px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === 'dashboard'
                  ? 'active bg-[#ededed] text-black font-bold'
                  : 'text-neutral-700 hover:bg-[#ededed] hover:text-black'
                  }`}
              >
                <LayoutGrid className="size-4 shrink-0" />
                <span>Dashboard</span>
              </button>

              <div className="space-y-0.5">
                <button
                  id="nav-group-procurement"
                  onClick={() => setProcurementOpen(!procurementOpen)}
                  className="nav-indicator flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm font-medium text-neutral-700 hover:bg-[#ededed] hover:text-black transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Briefcase className="size-4 shrink-0" />
                    <span>Procurement</span>
                  </span>
                  {procurementOpen ? <ChevronDown className="size-3.5 text-neutral-400" /> : <ChevronRight className="size-3.5 text-neutral-400" />}
                </button>
                {procurementOpen && (
                  <div className="pl-9 space-y-1 py-1">
                    <button
                      id="nav-item-rfqs"
                      onClick={() => { setActiveTab('rfqs'); setIsOpen(false); }}
                      className={`nav-indicator flex w-full items-center rounded py-1.5 text-left text-xs font-medium transition-colors ${activeTab === 'rfqs'
                        ? 'active text-black font-bold'
                        : 'text-neutral-500 hover:text-black'
                        }`}
                    >
                      RFQs
                    </button>
                    <button
                      id="nav-item-quotations"
                      onClick={() => { setActiveTab('quotations'); setIsOpen(false); }}
                      className={`nav-indicator flex w-full items-center rounded py-1.5 text-left text-xs font-medium transition-colors ${activeTab === 'quotations'
                        ? 'active text-black font-bold'
                        : 'text-neutral-500 hover:text-black'
                        }`}
                    >
                      Quotations
                    </button>
                    <button
                      id="nav-item-approvals"
                      onClick={() => { setActiveTab('approvals'); setIsOpen(false); }}
                      className={`nav-indicator flex w-full items-center rounded py-1.5 text-left text-xs font-medium transition-colors ${activeTab === 'approvals'
                        ? 'active text-black font-bold'
                        : 'text-neutral-500 hover:text-black'
                        }`}
                    >
                      Approvals
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-0.5">
                <button
                  id="nav-group-vendor"
                  onClick={() => {
                    setActiveTab('vendors');
                    setIsOpen(false);
                  }}
                  className={`nav-indicator flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm font-medium transition-colors ${activeTab === 'vendors' || activeTab === 'categories'
                    ? 'active bg-[#ededed] text-black font-bold'
                    : 'text-neutral-700 hover:bg-[#ededed] hover:text-black hover:font-bold'
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <Users className="size-4 shrink-0" />
                    <span>Vendor Management</span>
                  </span>
                  <ChevronRight className={`size-3.5 ${activeTab === 'vendors' || activeTab === 'categories' ? 'text-black' : 'text-neutral-400'}`} />
                </button>
              </div>

              <div className="space-y-0.5">
                <button
                  id="nav-group-orders"
                  onClick={() => {
                    setActiveTab('purchaseorders');
                    setIsOpen(false);
                  }}
                  className={`nav-indicator flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm font-medium transition-colors ${activeTab === 'purchaseorders' || activeTab === 'invoices'
                    ? 'active bg-[#ededed] text-black font-bold'
                    : 'text-neutral-700 hover:bg-[#ededed] hover:text-black hover:font-bold'
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <Package className="size-4 shrink-0" />
                    <span>Orders</span>
                  </span>
                  <ChevronRight className={`size-3.5 ${activeTab === 'purchaseorders' || activeTab === 'invoices' ? 'text-black' : 'text-neutral-400'}`} />
                </button>
              </div>

              <div className="space-y-0.5">
                <button
                  id="nav-group-analytics"
                  onClick={() => {
                    setActiveTab('reports');
                    setIsOpen(false);
                  }}
                  className={`nav-indicator flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm font-medium transition-colors ${activeTab === 'reports' || activeTab === 'activity'
                    ? 'active bg-[#ededed] text-black font-bold'
                    : 'text-neutral-700 hover:bg-[#ededed] hover:text-black hover:font-bold'
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <BarChart2 className="size-4 shrink-0" />
                    <span>Analytics</span>
                  </span>
                  <ChevronRight className={`size-3.5 ${activeTab === 'reports' || activeTab === 'activity' ? 'text-black' : 'text-neutral-400'}`} />
                </button>
              </div>

            </nav>
          </div>
        </div>

        <div id="sidebar-footer" className="border-t border-[#dedede] px-4 py-4 space-y-4 bg-[#fcfcfc]">
          <div className="bg-[#f0f0f0] p-3 border border-[#e0e0e0] rounded select-none">
            <span className="text-[9px] font-mono tracking-widest font-bold text-neutral-400 block uppercase mb-1">Changelog</span>
            <p className="text-xs font-bold text-black mb-0.5 leading-tight">Product update</p>
            <p className="text-[11px] text-neutral-500 leading-snug mb-2">Performance boosts and UI polish.</p>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); alert("Viewing latest releases changelog"); }}
              className="text-xs font-semibold text-black underline tracking-tight block hover:text-neutral-600"
            >
              Learn more
            </a>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => { setActiveTab('help'); }}
              className="nav-indicator flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-left text-xs font-medium text-neutral-600 hover:bg-[#ededed] hover:text-black transition-colors"
            >
              <HelpCircle className="size-4 text-neutral-400" />
              <span>Help Center</span>
            </button>
            <button
              onClick={() => { setActiveTab('help'); }}
              className="nav-indicator flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-left text-xs font-medium text-neutral-600 hover:bg-[#ededed] hover:text-black transition-colors"
            >
              <BookOpen className="size-4 text-neutral-400" />
              <span>Documentation</span>
            </button>
          </div>

          <div className="text-[10px] text-neutral-400 font-mono pl-2">
            © 2026 Efferd LLC
          </div>
        </div>
      </aside>
    </>
  );
}
