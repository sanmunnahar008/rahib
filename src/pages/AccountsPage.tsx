import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { Payment, Dealer, Officer, Sale } from '../types/database';
import { getLocalDB, saveLocalDB } from '../lib/supabase';
import { formatBnCurrency, formatBnDate } from '../lib/format';
import { toast } from 'sonner';
import { Wallet, Plus, Search, DollarSign, X } from 'lucide-react';

export const AccountsPage: React.FC = () => {
  usePageMeta({
    title: 'হিসাব ও ডিলার লেজার',
    description: 'ডিলারদের জমা রশিদ, বকেয়া পরিশোধ ও লেজার বিবরণ'
  });

  const { user, profile, role } = useAuth();
  const isAdmin = role === 'admin';

  const [payments, setPayments] = useState<Payment[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [userTerritoryIds, setUserTerritoryIds] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDealerFilter, setSelectedDealerFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dealerId, setDealerId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('নগদ ক্যাশ');
  const [description, setDescription] = useState('');

  const loadData = () => {
    const db = getLocalDB();
    setPayments(db.payments || []);
    setDealers(db.dealers || []);
    setSales(db.sales || []);

    if (!isAdmin && user) {
      const myOfficer = (db.officers || []).find((o: Officer) => o.user_id === user.id);
      if (myOfficer && myOfficer.territory_ids) {
        setUserTerritoryIds(myOfficer.territory_ids);
      }
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ph_vision_db_updated', loadData);
    return () => window.removeEventListener('ph_vision_db_updated', loadData);
  }, []);

  const availableDealers = isAdmin
    ? dealers
    : dealers.filter((d) => userTerritoryIds.includes(d.territory_id));

  const openPaymentModal = () => {
    setDealerId(availableDealers[0]?.id || '');
    setAmount('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('নগদ ক্যাশ');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerId) {
      toast.error('ডিলার নির্বাচন করুন');
      return;
    }
    const payVal = Number(amount);
    if (isNaN(payVal) || payVal <= 0) {
      toast.error('সঠিক জমার পরিমাণ দিন');
      return;
    }

    const db = getLocalDB();
    const dealerObj = dealers.find((d) => d.id === dealerId);

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      dealer_id: dealerId,
      dealer_name: dealerObj?.name || '',
      amount: payVal,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      description,
      created_by: user?.id || 'usr-officer-1',
      created_by_name: profile?.full_name || 'অফিসার',
      created_at: new Date().toISOString()
    };

    // 1. Add payment record
    db.payments.unshift(newPayment);

    // 2. Decrement dealer's current balance
    if (dealerObj) {
      db.dealers = db.dealers.map((d: Dealer) =>
        d.id === dealerId
          ? { ...d, current_balance: Math.max(0, d.current_balance - payVal) }
          : d
      );
    }

    saveLocalDB(db);
    setIsModalOpen(false);
    toast.success('জমা রশিদ সফলভাবে সংরক্ষণ করা হয়েছে');
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      (p.dealer_name && p.dealer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.payment_method.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDealer = selectedDealerFilter === 'all' || p.dealer_id === selectedDealerFilter;

    const isAuthorized =
      isAdmin || dealers.some((d) => d.id === p.dealer_id && userTerritoryIds.includes(d.territory_id));

    return matchesSearch && matchesDealer && isAuthorized;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="হিসাব ও জমা সংগ্রহ"
        subtitle="ডিলারদের ক্যাশ জমা এন্ট্রি, পেমেন্ট রিসিভ ও লেজার স্টেটমেন্ট"
        action={
          <button
            onClick={openPaymentModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন জমা রিসিভ করুন
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-xs flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ডিলারের নাম বা পেমেন্ট মেথড..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">ডিলার ফিল্টার:</label>
          <select
            value={selectedDealerFilter}
            onChange={(e) => setSelectedDealerFilter(e.target.value)}
            className="w-full sm:w-48 py-1.5 px-3 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
          >
            <option value="all">সব ডিলার</option>
            {availableDealers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payments History Table */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">কোনো জমা বা রিসিভ রেকর্ড পাওয়া যায়নি</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
                  <th className="py-3 px-4">জমার তারিখ</th>
                  <th className="py-3 px-4">ডিলারের নাম</th>
                  <th className="py-3 px-4 text-center">পেমেন্ট মেথড</th>
                  <th className="py-3 px-4">বিবরণ / রেফারেন্স</th>
                  <th className="py-3 px-4 text-right">জমার পরিমাণ (৳)</th>
                  <th className="py-3 px-4">সংগ্রহকারী</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-semibold">{formatBnDate(p.payment_date)}</td>
                    <td className="py-3 px-4 font-bold text-foreground">{p.dealer_name || 'সাধারণ ডিলার'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{p.description || '-'}</td>
                    <td className="py-3 px-4 text-right font-black text-emerald-700 text-sm">
                      {formatBnCurrency(p.amount)}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{p.created_by_name || 'অফিসার'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                ডিলার পেমেন্ট জমা এন্ট্রি
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">ডিলার নির্বাচন করুন *</label>
                <select
                  value={dealerId}
                  onChange={(e) => setDealerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                >
                  <option value="">ডিলার বেছে নিন</option>
                  {availableDealers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} (বকেয়া: {formatBnCurrency(d.current_balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">জমার পরিমাণ (৳) *</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                  placeholder="50000"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">জমার তারিখ *</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">পেমেন্ট মাধ্যম</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                >
                  <option value="নগদ ক্যাশ">নগদ ক্যাশ</option>
                  <option value="ব্যাংক চেক">ব্যাংক চেক</option>
                  <option value="বিকাশ / রকেট / নগদ">বিকাশ / রকেট / নগদ</option>
                  <option value="ব্যাংক অনলাইন ট্রান্সফার">ব্যাংক অনলাইন ট্রান্সফার</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">বিবরণ / ব্যাংক ব্যাংক চেক নম্বর</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="যেমন: ডাচ-বাংলা ব্যাংক চেক #48920"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-muted text-foreground font-semibold rounded-lg text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg text-xs shadow-xs"
                >
                  জমা নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
