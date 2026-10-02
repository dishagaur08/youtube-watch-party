import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const VerifyEmailPage = () => {
  return (
    <div className="min-h-screen bg-vyntra-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-vyntra-card border border-white/10 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-glow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Account Verified</h2>
          <p className="text-xs text-slate-400">Your email address has been verified successfully.</p>
        </div>
        <Link
          to="/app"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-glow-sm transition-all"
        >
          <span>Enter VYNTRA Workspace</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
