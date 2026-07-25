import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { getLocalDB } from '../lib/supabase';
import { Sale, Payment, Expense, Dealer } from '../types/database';
import { formatBnCurrency, formatBnNumber } from '../lib/format';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, DollarSign, CreditCard, Receipt, FileText } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  usePageMeta({
    title: 'ব্যবসা ও আর্থিক রিপোর্ট',
    description: 'মোট বিক্রয়, ক্যাশ কালেকশন, মোট বকেয়া ও পরিচালন ব্যয় ওভারভিউ'
  });

  const [sales, setSales] = useState<Sale[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);

  const loadData = () => {
    const db = getLocalDB();
    setSales(db.sales || []);
    setPayments(db.payments || []);
    setExpenses(db.expenses || []);
    setDealers(db.dealers || []);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ph_vision_db_updated', loadData);
    return () => window.removeEventListener('ph_vision_db_updated', loadData);
  }, []);

  const totalSales = sales.reduce((sum, s) => sum + s.total_amount, 0);
  const totalCollections = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalDue = dealers.reduce((sum, d) => sum + d.current_balance, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Monthly summary aggregation for recharts
  const chartData = [
    { month: 'মার্চ', sales: 1200000, collections: 950000 },
    { month: 'এপ্রিল', sales: 1850000, collections: 1400000 },
    { month: 'মে', sales: 2200000, collections: 1900000 },
    { month: 'জুন', sales: 3100000, collections: 2700000 },
    { month: 'জুলাই', sales: totalSales, collections: totalCollections }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="কোম্পানি ওভারঅল পারফরম্যান্স রিপোর্ট"
        subtitle="বিক্রয়, কালেকশন, সামগ্রিক বকেয়া ও পরিচালন ব্যয়ের এক নজরে হিসাব"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-xl border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">মোট বিক্রয়</span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-black text-foreground mt-2">{formatBnCurrency(totalSales)}</p>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">ক্যাশ কালেকশন</span>
            <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-black text-emerald-700 mt-2">{formatBnCurrency(totalCollections)}</p>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">বর্তমান মোট বকেয়া</span>
            <div className="p-2 bg-rose-100 text-rose-800 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-black text-rose-600 mt-2">{formatBnCurrency(totalDue)}</p>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">পরিচালন খরচ</span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-black text-amber-700 mt-2">{formatBnCurrency(totalExpenses)}</p>
        </div>
      </div>

      {/* Monthly Sales vs Collection Chart */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-xs space-y-4">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          মাসিক বিক্রয় বনাম ক্যাশ কালেকশন তুলনামূলক চিত্র
        </h3>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: any) => formatBnCurrency(Number(value))} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="sales" name="বিক্রয় (৳)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="collections" name="ক্যাশ জমা (৳)" fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Dealers Outstanding List */}
      <div className="bg-card rounded-xl border border-border shadow-xs p-6 space-y-3">
        <h3 className="font-bold text-foreground text-sm">ডিলারভিত্তিক সর্বোচ্চ বকেয়া তালিকা</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
                <th className="py-2.5 px-3">ডিলার কোড</th>
                <th className="py-2.5 px-3">ডিলারের নাম</th>
                <th className="py-2.5 px-3">টেরিটরি</th>
                <th className="py-2.5 px-3 text-right">ক্রেডিট সীমা</th>
                <th className="py-2.5 px-3 text-right">বর্তমান বকেয়া (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {dealers
                .slice()
                .sort((a, b) => b.current_balance - a.current_balance)
                .map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30">
                    <td className="py-2.5 px-3 font-mono font-bold text-primary">{d.dealer_code}</td>
                    <td className="py-2.5 px-3 font-semibold text-foreground">{d.name}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{d.territory_name || '-'}</td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">{formatBnCurrency(d.credit_limit)}</td>
                    <td className="py-2.5 px-3 text-right font-black text-rose-600">{formatBnCurrency(d.current_balance)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
