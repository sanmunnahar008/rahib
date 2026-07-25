import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { useNavigate } from 'react-router-dom';
import { Clock, RefreshCw, LogOut } from 'lucide-react';
import { GlossyIcon } from '../components/3d/GlossyIcon';

export const PendingApprovalPage: React.FC = () => {
  usePageMeta({
    title: 'অনুমোদন পেন্ডিং',
    description: 'আপনার অ্যাকাউন্টের ভূমিকা নির্ধারণ পেন্ডিং রয়েছে'
  });

  const { profile, refreshUserData, logout, role } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (role) {
      navigate('/');
    }
  }, [role, navigate]);

  const handleCheck = () => {
    refreshUserData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-background to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl border border-amber-200 shadow-xl p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shadow-inner">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div>
          <GlossyIcon name="logo" size="md" className="mx-auto mb-2" />
          <h2 className="text-xl font-black text-foreground">অনুমোদনের অপেক্ষায় রয়েছে</h2>
          <p className="text-xs text-muted-foreground mt-1">
            সম্মানিত <span className="font-bold text-foreground">{profile?.full_name}</span>, আপনার নিবন্ধন সফলভাবে সম্পন্ন হয়েছে।
          </p>
        </div>

        <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 text-left space-y-2">
          <p className="font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            অ্যাডমিন অনুমোদনের নোটিশ:
          </p>
          <p>
            নতুন অ্যাকাউন্টে কোনো ভূমিকা (অ্যাডমিন/অফিসার) দেওয়া হয়নি। সিস্টেম অ্যাডমিন কর্তৃক আপনাকে ভূমিকা অর্পণ করার পর আপনি সিস্টেমে প্রবেশ করতে পারবেন।
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={handleCheck}
            className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            স্ট্যাটাস পুনরায় যাচাই করুন
          </button>

          <button
            onClick={logout}
            className="w-full py-2.5 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
            লগআউট করুন
          </button>
        </div>
      </div>
    </div>
  );
};
