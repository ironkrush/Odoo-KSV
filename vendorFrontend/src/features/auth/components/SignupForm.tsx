import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function SignupForm() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Procurement Officer");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await signup(name, email, password, role);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-5xl font-black tracking-tight text-black">
        VendorBridge
      </h1>

      <p className="text-zinc-500 mt-2 mb-8 text-base font-mono">
        // Create your account
      </p>

      {error && (
        <div className="bg-[#fee2e2] border-2 border-black p-4 mb-6 text-red-700 font-mono text-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] uppercase tracking-wider font-bold">
          [ERROR] {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name Input Wrapper */}
        <div className="relative flex items-center group bg-white border-2 border-black rounded-none shadow-[3px_3px_0px_rgba(0,0,0,1)] focus-within:shadow-[6px_6px_0px_rgba(0,0,0,1)] focus-within:-translate-x-[3px] focus-within:-translate-y-[3px] transition-all duration-200">
          <span className="pl-4 pr-3 border-r-2 border-black text-black group-focus-within:bg-black group-focus-within:text-white py-4 transition-all duration-200 shrink-0">
            <User className="w-5 h-5" />
          </span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full bg-transparent py-4 px-4 text-black placeholder-zinc-400 focus:outline-none text-base font-semibold"
          />
        </div>

        {/* Email Input Wrapper */}
        <div className="relative flex items-center group bg-white border-2 border-black rounded-none shadow-[3px_3px_0px_rgba(0,0,0,1)] focus-within:shadow-[6px_6px_0px_rgba(0,0,0,1)] focus-within:-translate-x-[3px] focus-within:-translate-y-[3px] transition-all duration-200">
          <span className="pl-4 pr-3 border-r-2 border-black text-black group-focus-within:bg-black group-focus-within:text-white py-4 transition-all duration-200 shrink-0">
            <Mail className="w-5 h-5" />
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full bg-transparent py-4 px-4 text-black placeholder-zinc-400 focus:outline-none text-base font-semibold"
          />
        </div>

        {/* Role Select Wrapper */}
        <div className="relative flex items-center group bg-white border-2 border-black rounded-none shadow-[3px_3px_0px_rgba(0,0,0,1)] focus-within:shadow-[6px_6px_0px_rgba(0,0,0,1)] focus-within:-translate-x-[3px] focus-within:-translate-y-[3px] transition-all duration-200">
          <span className="pl-4 pr-3 border-r-2 border-black text-black group-focus-within:bg-black group-focus-within:text-white py-4 transition-all duration-200 shrink-0">
            <Shield className="w-5 h-5" />
          </span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-transparent py-4 px-4 text-black focus:outline-none text-base font-semibold appearance-none cursor-pointer"
          >
            <option value="Procurement Officer">Procurement Officer</option>
            <option value="Vendor">Vendor</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
          {/* Custom dropdown arrow for neo-brutalist select */}
          <div className="absolute right-4 pointer-events-none text-black font-black font-mono">
            ▼
          </div>
        </div>

        {/* Password Input Wrapper */}
        <div className="relative flex items-center group bg-white border-2 border-black rounded-none shadow-[3px_3px_0px_rgba(0,0,0,1)] focus-within:shadow-[6px_6px_0px_rgba(0,0,0,1)] focus-within:-translate-x-[3px] focus-within:-translate-y-[3px] transition-all duration-200">
          <span className="pl-4 pr-3 border-r-2 border-black text-black group-focus-within:bg-black group-focus-within:text-white py-4 transition-all duration-200 shrink-0">
            <Lock className="w-5 h-5" />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-transparent py-4 pl-4 pr-12 text-black placeholder-zinc-400 focus:outline-none text-base font-semibold"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-zinc-400 hover:text-black transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Confirm Password Input Wrapper */}
        <div className="relative flex items-center group bg-white border-2 border-black rounded-none shadow-[3px_3px_0px_rgba(0,0,0,1)] focus-within:shadow-[6px_6px_0px_rgba(0,0,0,1)] focus-within:-translate-x-[3px] focus-within:-translate-y-[3px] transition-all duration-200">
          <span className="pl-4 pr-3 border-r-2 border-black text-black group-focus-within:bg-black group-focus-within:text-white py-4 transition-all duration-200 shrink-0">
            <Lock className="w-5 h-5" />
          </span>
          <input
            type={showConfirmPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full bg-transparent py-4 pl-4 pr-12 text-black placeholder-zinc-400 focus:outline-none text-base font-semibold"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 text-zinc-400 hover:text-black transition-colors focus:outline-none"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Submit Button with tactile shadow slide */}
        <button
          type="submit"
          disabled={isLoading}
          className="
            relative
            w-full
            bg-black
            text-white
            border-2
            border-black
            font-bold
            py-4
            rounded-none
            shadow-[4px_4px_0px_rgba(0,0,0,1)]
            hover:shadow-none
            hover:translate-x-[4px]
            hover:translate-y-[4px]
            active:bg-zinc-900
            transition-all
            duration-150
            flex
            items-center
            justify-center
            cursor-pointer
            disabled:opacity-75
            disabled:cursor-not-allowed
            text-base
            uppercase
            tracking-wider
            mt-6
          "
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-none animate-spin" />
          ) : (
            <>
              Create Account
            </>
          )}
        </button>
      </form>

      <p className="text-center text-zinc-500 text-sm font-mono mt-8">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-bold text-black hover:underline transition-colors"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}