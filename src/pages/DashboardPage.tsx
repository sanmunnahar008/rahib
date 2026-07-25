import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { getLocalDB } from '../lib/supabase';
import { formatBnCurrency, formatBnDate, formatBnNumber } from '../lib/format';
import { Sale, Product, Dealer } from '../types/database';
import {
  TrendingUp,
  Receipt,
  CreditCard,
  AlertTriangle,
  Store,
  PlusCircle,
  FileText,
  DollarSign,
  ArrowRight
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  usePageMeta({
    title: 'ড্যাশবোর্ড',
    description: 'PH VISION LTD ওভারভিউ এবং ব্যবসায়িক সূচকসমূহ'
  });

  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = () => {
      const db = getLocalDB();
      setSales(db.sales || []);
      setProducts(db.products || []);
      setDealers(db.dealers || []);
    };
    load();
    window.addEventListener('ph_vision_db_updated', load);
    return () => window.removeEventListener('ph_vision_db_updated', load);
  }, []);

  // Compute metrics
  const totalSalesAmount = sales.reduce((sum, s) => sum + s.total_amount, 0);
  const totalPaidAmount = sales.reduce((sum, s) => sum + s.paid_amount, 0);
  const totalDueAmount = sales.reduce((sum, s) => sum + s.due_amount, 0);

  const lowStockProducts = products.filter((p) => p.current_stock <= p.low_stock_alert);

  return (
    <div className="space-y-6">
      <PageHeader
        title="ব্যবসায়িক ড্যাশবোর্ড"
        subtitle="কোম্পানির সামগ্রিক বিক্রয়, বকেয়া এবং ইনভেন্টরি পরিস্থিতি"
        badge="লাইভ মোড"
        action={
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/sales')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              নতুন বিক্রয় ইনভয়েস
            </button>
          </div>
        }
      />

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Card */}
        <div className="bg-card p-5 rounded-xl border border-border shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">মোট বিক্রয়</span>
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-foreground">{formatBnCurrency(totalSalesAmount)}</p>
            <p className="text-xs text-muted-foreground mt-1">মোট {formatBnNumber(sales.length)} টি বিক্রয় চালান</p>
          </div>
        </div>

        {/* Total Dues Card */}
        <div className="bg-card p-5 rounded-xl border border-border shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">মোট ডিলার বকেয়া</span>
            <div className="p-2.5 bg-rose-100 text-rose-800 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-rose-600">{formatBnCurrency(totalDueAmount)}</p>
            <p className="text-xs text-muted-foreground mt-1">আদায় হয়েছে: {formatBnCurrency(totalPaidAmount)}</p>
          </div>
        </div>

        {/* Low Stock Card */}
        <div className="bg-card p-5 rounded-xl border border-border shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">কম স্টক পণ্য</span>
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-amber-600">{formatBnNumber(lowStockProducts.length)} টি</p>
            <p className="text-xs text-muted-foreground mt-1">জরুরি রি-অর্ডার প্রয়োজন</p>
          </div>
        </div>

        {/* Total Dealers Card */}
        <div className="bg-card p-5 rounded-xl border border-border shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">নিবন্ধিত ডিলার</span>
            <div className="p-2.5 bg-blue-100 text-blue-800 rounded-lg">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-foreground">{formatBnNumber(dealers.length)} জন</p>
            <p className="text-xs text-muted-foreground mt-1">সক্রিয় ডিলার নেটওয়ার্ক</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Sales + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales Invoices (2 Cols) */}
        <div className="lg:col-span-2 bg-card p-5 rounded-xl border border-border shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              সাম্প্রতিক বিক্রয় চালানসমূহ
            </h3>
            <button
              onClick={() => navigate('/sales')}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              সব দেখুন <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {sales.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">কোনো বিক্রয় রেকর্ড পাওয়া যায়নি</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="py-2.5 px-3">চালান নম্বর</th>
                    <th className="py-2.5 px-3">তারিখ</th>
                    <th className="py-2.5 px-3">ডিলার</th>
                    <th className="py-2.5 px-3 text-right">মোট টাকা</th>
                    <th className="py-2.5 px-3 text-right">বকেয়া</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sales.slice(0, 5).map((sale) => (
                    <tr key={sale.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-primary">{sale.invoice_no}</td>
                      <td className="py-3 px-3">{formatBnDate(sale.sale_date)}</td>
                      <td className="py-3 px-3 font-medium">{sale.dealer_name || 'সাধারণ ডিলার'}</td>
                      <td className="py-3 px-3 text-right font-bold text-foreground">{formatBnCurrency(sale.total_amount)}</td>
                      <td className="py-3 px-3 text-right font-bold text-rose-600">
                        {sale.due_amount > 0 ? formatBnCurrency(sale.due_amount) : <span className="text-emerald-600 font-semibold">পরিশোধিত</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts Box (1 Col) */}
        <div className="bg-card p-5 rounded-xl border border-border shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              কম স্টক অ্যালার্ট
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
              {formatBnNumber(lowStockProducts.length)} টি
            </span>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">সব পণ্যের স্টক পর্যাপ্ত রয়েছে</div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((prod) => (
                <div key={prod.id} className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-foreground">{prod.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      সতর্কতা লেভেল: {formatBnNumber(prod.low_stock_alert)} {prod.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 bg-amber-200 text-amber-900 font-extrabold text-xs rounded-md">
                      {formatBnNumber(prod.current_stock)} {prod.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => navigate('/products')}
            className="w-full mt-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-lg text-xs transition-colors"
          >
            পণ্য ব্যবস্থাপনা দেখুন
          </button>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="bg-card p-5 rounded-xl border border-border shadow-xs">
        <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-4">তাতক্ষণিক নেভিগেশন ও কাজ</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/sales')}
            className="p-4 bg-muted/50 hover:bg-primary-light/50 border border-border rounded-xl text-left transition-all hover:border-primary/40 group"
          >
            <Receipt className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-xs text-foreground">বিক্রয় চালান এন্ট্রি</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">নতুন ইনভয়েস তৈরি করুন</p>
          </button>

          <button
            onClick={() => navigate('/accounts')}
            className="p-4 bg-muted/50 hover:bg-emerald-50 border border-border rounded-xl text-left transition-all hover:border-emerald-300 group"
          >
            <DollarSign className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-xs text-foreground">ডিলার পেমেন্ট গ্রহণ</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">বকেয়া টাকা জমা এন্ট্রি</p>
          </button>

          <button
            onClick={() => navigate('/dealers')}
            className="p-4 bg-muted/50 hover:bg-blue-50 border border-border rounded-xl text-left transition-all hover:border-blue-300 group"
          >
            <Store className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-xs text-foreground">ডিলার তালিকা</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">ব্যালেন্স ও ক্রেডিট লিমিট</p>
          </button>

          <button
            onClick={() => navigate('/reports')}
            className="p-4 bg-muted/50 hover:bg-purple-50 border border-border rounded-xl text-left transition-all hover:border-purple-300 group"
          >
            <FileText className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-xs text-foreground">সার্বিক রিপোর্ট</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">বিক্রয় ও আদায় রিপোর্ট</p>
          </button>
        </div>
      </div>
    </div>
  );
};
