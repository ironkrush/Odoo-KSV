import React from 'react';
import {
  LayoutGrid,
  Briefcase,
  FileText,
  Scale,
  CheckSquare,
  Receipt,
  Settings,
  HelpCircle,
  Plus,
  User,
  X,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentRole: 'Procurement Officer' | 'Vendor' | 'Manager / Approver' | 'Admin';
  logout: () => void;
}

export default function DashboardSidebar({ activeTab, setActiveTab, isOpen, setIsOpen, currentRole, logout }: SidebarProps) {
  const menuCategories = [
    {
      title: 'Core Operations',
      items: [
        { id: 'dashboard', label: 'Procurement Hub', icon: LayoutGrid, roles: ['Procurement Officer', 'Manager / Approver', 'Admin'] }
      ]
    },
    {
      title: 'Procurement & Bids',
      items: [
        { id: 'rfqs', label: 'RFQs & Tenders', icon: FileText, roles: ['Procurement Officer', 'Vendor'] },
        { id: 'vendor_submit_quote', label: 'Submit Quotation', icon: Plus, roles: ['Vendor'] },
        { id: 'comparison', label: 'Comparison Hub', icon: Scale, roles: ['Procurement Officer'] },
        { id: 'approvals', label: 'Approvals Queue', icon: CheckSquare, roles: ['Manager / Approver'] }
      ]
    },
    {
      title: 'Partners & Directory',
      items: [
        { id: 'vendors', label: 'Registered Vendors', icon: Briefcase, roles: ['Procurement Officer', 'Admin'] }
      ]
    },
    {
      title: 'Financial Ledger',
      items: [
        { id: 'purchaseorders_invoices', label: 'PO & Invoices', icon: Receipt, roles: ['Procurement Officer', 'Vendor'] }
      ]
    }
  ];

  // Determine user name based on role
  const getUserName = () => {
    switch (currentRole) {
      case 'Procurement Officer': return 'Shaban Haider';
      case 'Vendor': return 'Apex Supplier';
      case 'Manager / Approver': return 'Sarah Jenkins';
      case 'Admin': return 'Admin User';
      default: return 'User';
    }
  };

  return (
    <>
      {isOpen && (
        <div
          id="sidebar-backdrop"
          className="fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden rounded-none"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col
border-r border-[#dedede] bg-[#fafafa] text-[#111] rounded-none
transition-transform duration-300
md:static md:translate-x-0 md:shadow-none
${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Sidebar Header */}
        <div className="flex h-14 items-center justify-between border-b border-[#dedede] px-6 shrink-0 rounded-none">
          <div className="flex items-center gap-2 select-none">
            <div className="flex size-6 items-center justify-center text-black" title="VendorBridge Logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black">
                <rect x="2" y="8" width="6" height="8" rx="1" fill="black" />
                <rect x="16" y="8" width="6" height="8" rx="1" fill="black" />
                <rect x="8" y="11" width="8" height="2" fill="black" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-black tracking-tight text-sm leading-tight">VendorBridge</span>
              <span className="text-[9px] font-medium text-neutral-400 font-mono tracking-wider">Enterprise Procurement</span>
            </div>
          </div>
          <button
            id="close-sidebar-button"
            className="p-1 hover:bg-[#ededed] text-black md:hidden rounded-none"
            onClick={() => setIsOpen(false)}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Navigation Menus grouped by Category */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-5 rounded-none">
          {menuCategories.map((category) => {
            const visibleItems = category.items.filter(item => item.roles.includes(currentRole));
            if (visibleItems.length === 0) return null;

            return (
              <div key={category.title} className="space-y-1 rounded-none">
                <span className="px-3 text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-1.5 select-none">
                  {category.title}
                </span>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id || (item.id === 'rfqs' && activeTab === 'rfqs_new');
                  return (
                    <button
                      key={item.id}
                      id={`nav-item-${item.id}`}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider transition-colors ${
                        isActive
                          ? 'bg-[#ededed] text-black font-bold'
                          : 'text-neutral-700 hover:bg-[#ededed]/50 hover:text-black'
                      }`}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div id="sidebar-footer" className="border-t border-[#dedede] bg-[#fcfcfc] shrink-0 rounded-none">
          {/* Settings & Help */}
          <div className="px-3 py-3 space-y-0.5 rounded-none">
            {currentRole === 'Admin' && (
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-[#ededed] text-black font-bold'
                    : 'text-neutral-600 hover:bg-[#ededed]/50 hover:text-black'
                }`}
              >
                <Settings className="size-4 text-neutral-400" />
                <span>Settings</span>
              </button>
            )}
            <button
              onClick={() => {
                setActiveTab('help');
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'help'
                  ? 'bg-[#ededed] text-black font-bold'
                  : 'text-neutral-600 hover:bg-[#ededed]/50 hover:text-black'
              }`}
            >
              <HelpCircle className="size-4 text-neutral-400" />
              <span>Help Center</span>
            </button>
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-none px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider transition-colors text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="size-4 text-red-500" />
              <span>Log Out</span>
            </button>
          </div>

          {/* User Profile Card */}
          <div
            onClick={() => {
              setActiveTab('profile');
              setIsOpen(false);
            }}
            className="flex items-center gap-3 p-4 border-t border-[#dedede] bg-neutral-50/50 rounded-none cursor-pointer hover:bg-[#ededed]/50 transition-colors"
          >
            <div className="h-8 w-8 rounded-none bg-black flex items-center justify-center p-0.5" title={`Logged in as ${getUserName()}`}>
              <div className="h-full w-full rounded-none bg-white flex items-center justify-center overflow-hidden">
                <User className="size-4 text-black shrink-0 relative top-0.5" />
              </div>
            </div>
            <div className="flex flex-col min-w-0 rounded-none">
              <span className="text-xs font-bold text-neutral-800 truncate">{getUserName()}</span>
              <span className="text-[10px] text-neutral-400 font-mono tracking-tight font-medium truncate">{currentRole}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
