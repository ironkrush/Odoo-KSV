import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  FileText, 
  ClipboardCheck, 
  ShoppingCart, 
  Receipt, 
  History, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Headphones, 
  LogOut,
  X
} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/vendors', label: 'Vendors', icon: Store },
  { to: '/rfqs', label: 'RFQs', icon: FileText },
  { to: '/approvals', label: 'Approvals', icon: ClipboardCheck },
  { to: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
  { to: '/invoices', label: 'Invoices', icon: Receipt },
  { to: '/logs', label: 'Activity Logs', icon: History },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, closeSidebar } = useUIStore();

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    // Logic for auth clear will go here
    console.log('Signing out...');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) => {
    const base = 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm font-medium transition-all duration-200';
    if (isActive) {
      return `${base} bg-tint-green text-primary border-r-4 border-primary font-bold shadow-sm`;
    }
    return `${base} text-text-secondary hover:bg-surface-container hover:text-text-primary`;
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Main Navigation Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col w-[240px] bg-white border-r border-border-main transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-comfortable border-b border-border-soft">
          <div>
            <span className="text-headline-lg font-bold text-primary tracking-tight">VendorBridge</span>
            <p className="text-caption text-text-muted mt-0.5">Procurement Portal</p>
          </div>
          {/* Mobile close button */}
          <button 
            onClick={closeSidebar}
            className="p-1 rounded-full text-text-secondary hover:bg-surface-container md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Scrollable Area */}
        <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.to} 
                to={item.to} 
                end={item.end}
                onClick={closeSidebar}
                className={navLinkClass}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-4 border-t border-border-soft flex flex-col gap-1.5 mt-auto">
          <NavLink 
            to="/help" 
            onClick={closeSidebar}
            className={({ isActive }) => navLinkClass({ isActive })}
          >
            <HelpCircle className="h-[18px] w-[18px]" />
            Help Center
          </NavLink>
          <a 
            href="/support"
            onClick={(e) => { e.preventDefault(); closeSidebar(); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm font-medium text-text-secondary hover:bg-surface-container hover:text-text-primary transition-all"
          >
            <Headphones className="h-[18px] w-[18px]" />
            Support
          </a>
          <a 
            href="#signout" 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm font-medium text-status-red hover:bg-status-red-soft hover:text-status-red transition-all"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign Out
          </a>
        </div>
      </aside>
    </>
  );
};
