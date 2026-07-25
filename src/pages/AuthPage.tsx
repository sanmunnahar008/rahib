import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { z } from 'zod';
import { toast } from 'sonner';
import { GlossyIcon } from '../components/3d/GlossyIcon';
import { LogIn, UserPlus, Lock, Mail, Phone, User, ShieldCheck } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('সঠিক ইমেইল ঠিকানা প্রদান করুন'),
  password: z.string().min(1, 'পাসওয়ার্ড আবশ্যক')
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'কমপক্ষে ২ অক্ষরের নাম লিখুন'),
  mobile: z.string().min(11, '১১ ডিজিটের সঠিক মোবাইল নম্বর লিখুন'),
  email: z.string().email('সঠিক ইমেইল ঠিকানা প্রদান করুন'),
  password: z.string().min(6, 'কমপক্ষে ৬ ডিজিটের পাসওয়ার্ড প্রদান করুন')
});

export const AuthPage: React.FC = () => {
  usePageMeta({
    title: 'লগইন ও সাইনআপ',
    description: 'PH VISION LTD কোম্পানি ম্যানেজমেন্ট সিস্টেমে প্রবেশ করুন'
  });

  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    const res = await login(loginEmail, loginPassword);
    setSubmitting(false);

    if (res.success) {
      toast.success('সফলভাবে লগইন সম্পন্ন হয়েছে');
      navigate('/');
    } else {
      toast.error(res.error || 'ইমেইল বা পাসওয়ার্ড ভুল হয়েছে');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signupSchema.safeParse({
      fullName: signupName,
      mobile: signupMobile,
      email: signupEmail,
      password: signupPassword
    });

    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    const res = await signup(signupName, signupMobile, signupEmail, signupPassword);
    setSubmitting(false);

    if (res.success) {
      toast.success('অ্যাকাউন্ট তৈরি সফল হয়েছে। অ্যাডমিন অনুমোদনের অপেক্ষা করুন।');
      navigate('/pending-approval');
    } else {
      toast.error(res.error || 'অ্যাকাউন্ট তৈরি করতে ব্যর্থ হয়েছে');
    }
  };

  const handleQuickDemoLogin = async (email: string) => {
    setSubmitting(true);
    const res = await login(email, 'admin123');
    setSubmitting(false);
    if (res.success) {
      toast.success('ডেমো অ্যাকাউন্টে প্রবেশ সফল হয়েছে');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary-light via-background to-accent-light flex flex-col justify-between p-4 sm:p-6">
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-xl overflow-hidden p-6 sm:p-8">
          {/* Logo and Title */}
          <div className="text-center mb-6">
            <div className="inline-block p-2 bg-primary-light rounded-2xl shadow-inner mb-3">
              <GlossyIcon name="logo" size="lg" className="mx-auto" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">PH VISION LTD</h1>
            <p className="text-xs font-semibold text-primary mt-0.5">কোম্পানি ম্যানেজমেন্ট সিস্টেম (বাংলা)</p>
          </div>

          {/* Login / Signup Tabs */}
          <div className="flex bg-muted p-1 rounded-xl mb-6">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              লগইন
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'signup'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              নতুন অ্যাকাউন্ট
            </button>
          </div>

          {/* Form */}
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">ইমেইল ঠিকানা</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@phvision.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">পাসওয়ার্ড</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                {submitting ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">পূর্ণ নাম</label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="মোঃ আবদুর রহিম"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">মোবাইল নম্বর</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={signupMobile}
                    onChange={(e) => setSignupMobile(e.target.value)}
                    placeholder="01711000000"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">ইমেইল ঠিকানা</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="user@phvision.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">পাসওয়ার্ড</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ সংখ্যা"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                {submitting ? 'নিবন্ধন হচ্ছে...' : 'অ্যাকাউন্ট খুলুন'}
              </button>
            </form>
          )}

          {/* Quick Demo Login Preset Buttons */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-[11px] font-semibold text-center text-muted-foreground mb-2">
              তাতক্ষণিক ডেমো প্রবেশ:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickDemoLogin('admin@phvision.com')}
                className="flex items-center justify-center gap-1.5 p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                অ্যাডমিন লগইন
              </button>
              <button
                onClick={() => handleQuickDemoLogin('officer@phvision.com')}
                className="flex items-center justify-center gap-1.5 p-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition-colors"
              >
                <User className="w-3.5 h-3.5 text-blue-600" />
                অফিসার লগইন
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Credit */}
      <footer className="text-center py-2 text-xs text-muted-foreground font-medium">
        কৃতিত্ব: রেদওয়ান করিম রাহিব
      </footer>
    </div>
  );
};
