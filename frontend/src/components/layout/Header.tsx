import React from 'react';
import { Menu, Search, Bell, HelpCircle, MessageSquare, ChevronDown } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';

export const Header: React.FC = () => {
  const { toggleSidebar } = useUIStore();

  return (
    <header className="sticky top-0 right-0 z-20 flex items-center justify-between w-full h-16 px-comfortable bg-white border-b border-border-main shadow-sm md:w-[calc(100%-240px)] md:ml-[240px]">
      {/* Left side actions */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile menu trigger */}
        <button 
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-64 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary h-[18px] w-[18px]" />
          <input 
            type="text" 
            placeholder="Search..."
            className="w-full h-[36px] pl-10 pr-4 bg-background border border-border-main rounded-input font-body-sm text-body-sm text-text-primary focus:border-primary focus:ring-2 focus:ring-tint-green outline-none transition-all"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Quick Utilities */}
        <div className="flex items-center gap-1.5">
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-container hover:text-primary transition-colors">
            <Bell className="h-[18px] w-[18px]" />
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-container hover:text-primary transition-colors">
            <MessageSquare className="h-[18px] w-[18px]" />
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-container hover:text-primary transition-colors">
            <HelpCircle className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-border-main"></div>

        {/* User Profile Info Mock */}
        <button className="flex items-center gap-2 hover:opacity-85 transition-opacity py-1 px-1.5 rounded-lg">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5HWy0qRVSxNYvYlrB0WBacjIKTUohJEy2-ksPNMJk4wpLXWiH0V3hjXk-v3xmgefBy2g0wkugFBgwx9tN1o6RvpGQLas2Pfp5AYwI1faUMIDk5VenqjsDpQbw1Zfa50H4nZc6A-ldxmjSvpSmJ4-s2bxmPYjiYSi7BX17oI2zYarXY_a4dA2r9AMJPQLBss3b2lvf5tEEEP0fIXXTVmqiFhUmb7PracE8ZZ79gC4r3LvkCxQTMPzUFH1umOU0QBptZB8hIDvTK2k" 
            alt="User Avatar"
            className="w-8 h-8 rounded-full border border-border-main object-cover"
          />
          <span className="text-body-sm font-semibold text-text-primary hidden md:inline">Aman Patel</span>
          <ChevronDown className="h-4 w-4 text-text-secondary" />
        </button>
      </div>
    </header>
  );
};
