import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { Product, Dealer, ProductBatch } from '../types/database';
import { getLocalDB } from '../lib/supabase';
import { formatBnCurrency, formatBnNumber, formatBnDate } from '../lib/format';
import { AlertTriangle, ShieldAlert, Store, Package, Clock } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  usePageMeta({
    title: 'সতর্কবার্তা ও নোটিফিকেশন',
    description: 'কম স্টক বার্তা, ক্রেডিট লিমিট অতিক্রম করা ডিলার ও মেয়াদ উত্তীর্ণ পণ্য'
  });

  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [overLimitDealers, setOverLimitDealers] = useState<Dealer[]>([]);
  const [expiringBatches, setExpiringBatches] = useState<ProductBatch[]>([]);

  const loadData = () => {
    const db = getLocalDB();
    const prods: Product[] = db.products || [];
    const dlrs: Dealer[] = db.dealers || [];
    const btchs: ProductBatch[] = db.product_batches || [];

    setLowStockProducts(prods.filter((p) => p.current_stock <= p.low_stock_alert));
    setOverLimitDealers(dlrs.filter((d) => d.current_balance > d.credit_limit));
    setExpiringBatches(btchs);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ph_vision_db_updated', loadData);
    return () => window.removeEventListener('ph_vision_db_updated', loadData);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="সিস্টেম অ্যালার্ট ও জরুরি সতর্কবার্তা"
        subtitle="স্টক সংকট, ডিলার বাকির সীমা অতিক্রম ও পণ্যের মেয়াদ সংক্রান্ত অটো নোটিফিকেশন"
      />

      {/* Low Stock Alerts */}
      <div className="bg-card rounded-2xl border border-amber-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-amber-50/80 border-b border-amber-200 flex items-center justify-between">
          <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            কম স্টক সতর্কবার্তা ({formatBnNumber(lowStockProducts.length)} টি পণ্য)
          </h3>
        </div>
        <div className="p-4">
          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-muted-foreground">বর্তমানে কোনো পণ্যে কম স্টকের ঘাটতি নেই।</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="p-3 bg-amber-50/40 rounded-xl border border-amber-200 text-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-foreground">{p.name}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                      স্টক সংকট
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    বর্তমান স্টক: <span className="font-bold text-rose-600">{formatBnNumber(p.current_stock)} {p.unit}</span> (সীমা: {formatBnNumber(p.low_stock_alert)})
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Credit Limit Exceeded Alerts */}
      <div className="bg-card rounded-2xl border border-rose-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-rose-50/80 border-b border-rose-200 flex items-center justify-between">
          <h3 className="font-bold text-rose-900 text-sm flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            ক্রেডিট সীমা অতিক্রম করা ডিলারগণ ({formatBnNumber(overLimitDealers.length)} জন)
          </h3>
        </div>
        <div className="p-4">
          {overLimitDealers.length === 0 ? (
            <p className="text-xs text-muted-foreground">কোনো ডিলারের বকেয়া ক্রেডিট সীমা অতিক্রম করেনি।</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {overLimitDealers.map((d) => (
                <div key={d.id} className="p-3 bg-rose-50/40 rounded-xl border border-rose-200 text-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-foreground">{d.name} ({d.dealer_code})</span>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                      লিমিট পার
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    বর্তমান বকেয়া: <span className="font-bold text-rose-600">{formatBnCurrency(d.current_balance)}</span>
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    অনুমোদিত সীমা: {formatBnCurrency(d.credit_limit)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Batch Expiry Alerts */}
      <div className="bg-card rounded-2xl border border-blue-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-blue-50/80 border-b border-blue-200 flex items-center justify-between">
          <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            পণ্যের ব্যাচ ও মেয়াদের সতর্কবার্তা
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expiringBatches.map((b) => (
              <div key={b.id} className="p-3 bg-blue-50/30 rounded-xl border border-blue-200 text-xs space-y-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-foreground">{b.product_name}</span>
                  <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded font-bold">{b.batch_number}</span>
                </div>
                <p className="text-muted-foreground">
                  উৎপাদন: {formatBnDate(b.manufacture_date)} | মেয়াদ: <span className="font-bold text-rose-600">{formatBnDate(b.expiry_date)}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
