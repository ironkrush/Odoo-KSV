import React from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, User as UserIcon, Mail, Calendar, Key, LogOut } from "lucide-react";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#eae6df] text-black font-sans p-6 md:p-12 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header banner */}
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-24 bg-yellow-300 border-l-4 border-black -skew-x-12 translate-x-8 shrink-0 hidden md:block"></div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
            VendorBridge ERP
          </h1>
          <p className="text-zinc-600 font-mono mt-2 uppercase tracking-wide">
            // Welcome to the Control Panel
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main User Card */}
          <div className="md:col-span-2 bg-white border-4 border-black p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-6">
            <div className="flex items-center gap-4 border-b-4 border-black pb-4">
              <div className="bg-black text-white p-3 border-2 border-black rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.25)]">
                <UserIcon className="w-8.5 h-8.5" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase">{user.name}</h2>
                <span className="font-mono bg-yellow-200 border border-black px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="space-y-4 font-mono">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-zinc-500 shrink-0" />
                <span className="font-bold text-zinc-500 uppercase tracking-wide text-xs w-20">Email:</span>
                <span className="font-bold text-base">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-zinc-500 shrink-0" />
                <span className="font-bold text-zinc-500 uppercase tracking-wide text-xs w-20">Role Type:</span>
                <span className="font-bold text-base">{user.role}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-zinc-500 shrink-0" />
                <span className="font-bold text-zinc-500 uppercase tracking-wide text-xs w-20">Joined:</span>
                <span className="font-bold text-base">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-zinc-500 shrink-0" />
                <span className="font-bold text-zinc-500 uppercase tracking-wide text-xs w-20">User ID:</span>
                <span className="font-bold text-base">#{user.id}</span>
              </div>
            </div>
          </div>

          {/* Side Card / Action List */}
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-black text-xl uppercase tracking-wider border-b-2 border-black pb-2">
                System Status
              </h3>
              <ul className="space-y-2 font-mono text-sm">
                <li className="flex items-center justify-between">
                  <span>Server Status:</span>
                  <span className="font-bold text-green-600 uppercase">ONLINE</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Port:</span>
                  <span className="font-bold">5000</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Database:</span>
                  <span className="font-bold">SQLite + Prisma</span>
                </li>
              </ul>
            </div>

            <button
              onClick={logout}
              className="w-full bg-red-400 text-black border-2 border-black font-black py-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-150 flex items-center justify-center gap-2 uppercase tracking-wider text-sm mt-6 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Role Specific Board Demo */}
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-4">
          <h3 className="font-black text-2xl uppercase tracking-wide">
            Role-Based Authorization Dashboard
          </h3>
          <div className="border-2 border-black bg-zinc-50 p-6 font-mono text-sm space-y-4">
            <p className="text-zinc-600">// Conditional components loaded based on token role key:</p>
            {user.role === "Admin" && (
              <div className="bg-yellow-100 border-2 border-yellow-500 p-4 space-y-2 text-yellow-800">
                <h4 className="font-bold uppercase text-lg">🛡️ Admin Console</h4>
                <p>Welcome to the System Admin control area. You have full credentials to override procurement requests, configure schemas, and manage user roles.</p>
              </div>
            )}
            {user.role === "Procurement Officer" && (
              <div className="bg-blue-100 border-2 border-blue-500 p-4 space-y-2 text-blue-800">
                <h4 className="font-bold uppercase text-lg">📊 Procurement Dashboard</h4>
                <p>Logged in as a Procurement Officer. You can create purchase orders, request quotes from vendors, and verify delivery parameters.</p>
              </div>
            )}
            {user.role === "Vendor" && (
              <div className="bg-green-100 border-2 border-green-500 p-4 space-y-2 text-green-800">
                <h4 className="font-bold uppercase text-lg">🏪 Vendor Portal</h4>
                <p>Logged in as a Vendor. You can upload product catalogs, view incoming procurement requests, and submit bids for contracts.</p>
              </div>
            )}
            {user.role === "Manager" && (
              <div className="bg-purple-100 border-2 border-purple-500 p-4 space-y-2 text-purple-800">
                <h4 className="font-bold uppercase text-lg">📈 Management Reports</h4>
                <p>Logged in as a Manager. You can audit procurement spending reports, approve order worksheets, and evaluate vendor performance scores.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
