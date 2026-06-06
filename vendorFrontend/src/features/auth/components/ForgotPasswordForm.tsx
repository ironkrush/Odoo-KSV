import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import api from "../../../lib/api";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/forgot-password", { email });
      setResetToken(response.data.resetToken);
      setIsSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to process request.");
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
        // Reset your password
      </p>

      {error && (
        <div className="bg-[#fee2e2] border-2 border-black p-4 mb-6 text-red-700 font-mono text-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] uppercase tracking-wider font-bold">
          [ERROR] {error}
        </div>
      )}

      {isSent ? (
        <div className="bg-white border-2 border-black text-black rounded-none p-6 space-y-3 animate-fade-in shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <h3 className="font-black text-lg uppercase tracking-wider">Link Sent</h3>
          <p className="text-base leading-relaxed text-zinc-700">
            We have sent a password reset link to <strong className="text-black">{email}</strong>.
          </p>
          <div className="bg-amber-100 border-2 border-black p-4 font-mono text-xs text-black space-y-1 mt-2">
            <p className="font-bold uppercase tracking-wider">// Simulated Email Console Output:</p>
            <p className="break-all">
              <strong className="text-zinc-600">Reset Link:</strong>{" "}
              <a
                href={`http://localhost:5174/reset-password?token=${resetToken}`}
                className="underline text-black font-bold hover:text-zinc-700"
              >
                {`http://localhost:5174/reset-password?token=${resetToken}`}
              </a>
            </p>
          </div>
          <button
            onClick={() => setIsSent(false)}
            className="text-sm font-bold text-black underline hover:text-zinc-700 font-mono pt-2"
          >
            [ Reset another email ]
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
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
                Send Reset Link
              </>
            )}
          </button>
        </form>
      )}

      <p className="text-center mt-8">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-black hover:underline transition-colors font-mono uppercase tracking-wider group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>
      </p>
    </div>
  );
}
