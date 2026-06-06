import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#eae6df] flex items-center justify-center font-mono">
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin mx-auto mb-4"></div>
          <span className="font-bold text-lg uppercase tracking-wider">Validating Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#eae6df] flex items-center justify-center p-4">
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-md w-full font-mono">
          <h1 className="text-3xl font-black text-red-500 uppercase tracking-tight mb-4 border-b-4 border-black pb-2">
            Access Denied
          </h1>
          <p className="text-black font-semibold mb-6">
            Your role (<strong className="bg-amber-200 px-1">{user.role}</strong>) is not authorized to access this resource.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-black text-white font-bold py-3 px-6 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150 uppercase text-sm"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
