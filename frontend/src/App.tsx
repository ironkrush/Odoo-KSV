import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Shared Layouts
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

// Features and Pages
import { Login } from '@/features/auth/pages/Login';
import { Register } from '@/features/auth/pages/Register';
import { Dashboard } from '@/features/dashboard/pages/Dashboard';
import { VendorsList } from '@/features/vendors/pages/VendorsList';
import { RfqList } from '@/features/rfq/pages/RfqList';
import { CreateRfq } from '@/features/rfq/pages/CreateRfq';
import { QuotationComparison } from '@/features/rfq/pages/QuotationComparison';
import { ApprovalWorkflow } from '@/features/approvals/pages/ApprovalWorkflow';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

// Initialize TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Workspace Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Core Features */}
            <Route index element={<Dashboard />} />
            <Route path="vendors" element={<VendorsList />} />
            <Route path="rfqs" element={<RfqList />} />
            <Route path="rfqs/create" element={<CreateRfq />} />
            <Route path="rfqs/:rfqId/compare" element={<QuotationComparison />} />
            <Route path="approvals" element={<ApprovalWorkflow />} />

            {/* Development Placeholder Modules */}
            <Route path="purchase-orders" element={<PlaceholderPage title="Purchase Orders Pipeline" />} />
            <Route path="invoices" element={<PlaceholderPage title="Invoices Directory" />} />
            <Route path="logs" element={<PlaceholderPage title="Activity Logs Audit" />} />
            <Route path="reports" element={<PlaceholderPage title="Reports & Spend Analytics" />} />
            <Route path="settings" element={<PlaceholderPage title="Settings Panel" />} />
            <Route path="help" element={<PlaceholderPage title="Help & Documentation Center" />} />
          </Route>

          {/* Catch-all Wildcard redirects back to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
