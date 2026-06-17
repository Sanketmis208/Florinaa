import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { authAPI } from "../services/api";

const AdminLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Check if already authenticated
  const { data: user, isLoading: checkLoading } = useQuery({
    queryKey: ["me"],
    queryFn: authAPI.getMe,
    retry: false,
    enabled: true,
  });

  // Redirect if logged in
  useEffect(() => {
    if (user && user.role === "admin") {
      navigate("/admin/dashboard");
    }
  }, [user, navigate]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => authAPI.login(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data);
      navigate("/admin/dashboard");
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.error || "Invalid login credentials. Please try again.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    setErrorMsg("");
    loginMutation.mutate({ email, password });
  };

  if (checkLoading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-6 pt-16">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 shadow-2xl border border-accent/10">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/FLORINAA_Logo_Transparent.png"
            alt="Florinaa Logo"
            className="h-12 w-auto object-contain mx-auto mb-4"
          />
          <h2 className="font-serif text-2xl md:text-3xl text-primary font-medium">
            Admin Console
          </h2>
          <p className="text-xs text-neutral-400 uppercase tracking-widest mt-1.5">
            Florinaa sleep in style
          </p>
        </div>

        {/* Error alert */}
        {errorMsg && (
          <div className="mb-6 p-4 text-xs bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center gap-2 text-left">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-neutral-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@florinaa.com"
                className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-xl bg-white text-primary text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-neutral-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-xl bg-white text-primary text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-neutral-900 text-white font-medium text-sm tracking-wide uppercase transition-colors shadow-lg disabled:bg-neutral-400 cursor-pointer"
          >
            {loginMutation.isPending ? "Verifying..." : "Sign In"}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-xs text-neutral-400 hover:text-accent font-semibold transition-colors"
          >
            ← Back to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
