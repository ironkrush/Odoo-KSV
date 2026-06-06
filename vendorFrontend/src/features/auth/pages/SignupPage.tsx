import { Navigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { SignupForm } from "../components/SignupForm";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
}