import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { Product, ProductBatch, StockMovement, Godown } from '../types/database';
import { getLocalDB, saveLocalDB } from '../lib/supabase';
import { formatBnDate, formatBnNumber } from '../lib/format';
import { toast } from 'sonner';
import { BarChart3, ArrowUpRight, ArrowDownLeft, RefreshCw, Plus, X } from 'lucide-react';

export const StockPage: React.FC = () => {
  usePageMeta({
    title: 'স্টক ও গতিবিধি',
    description: 'পণ্য স্টক লেভেল, ব্যাচ নম্বর, মেয়ার ও গোডাউন ট্রান্সফার'
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  const [tab, setTab] = useState<'levels' | 'batches' | 'movements'>('levels');

  // Transfer Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [productId, setProductId] = useState('');
  const [fromGodownId, setFromGodownId] = useState('');
  const [toGodownId, setToGodownId] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');

  const loadData = () => {
    const db = getLocalDB();
    setProducts(db.products || []);
    setBatches(db.product_batches || []);
    setGodowns(db.godowns || []);
    setMovements(db.stock_movements || []);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ph_vision_db_updated', loadData);
    return () => window.removeEventListener('ph_vision_db_updated', loadData);
  }, []);

  const openTransferModal = () => {
    setProductId(products[0]?.id || '');
    setFromGodownId(godowns[0]?.id || '');
    setToGodownId(godowns[1]?.id || godowns[0]?.id || '');
    setQuantity('');
    setIsTransferModalOpen(true);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !fromGodownId || !toGodownId) {
      toast.error('সকল প্রয়োজনীয় তথ্য নির্বাচন করুন');
      return;
    }
    if (fromGodownId === toGodownId) {
      toast.error('একই গোডাউনে ট্রান্সফার সম্ভব নয়');
      return;
    }
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error('সঠিক পরিমাণ দিন');
      return;
    }

    const db = getLocalDB();
    const prodObj = products.find((p) => p.id === productId);
    const fromGodObj = godowns.find((g) => g.id === fromGodownId);
    const toGodObj = godowns.find((g) => g.id === toGodownId);

    // Record stock movement (out from source, in to destination)
    const mov1: StockMovement = {
      id: `mov-${Date.now()}-1`,
      product_id: productId,
      product_name: prodObj?.name,
      godown_id: fromGodownId,
      godown_name: fromGodObj?.name,
      type: 'out',
      quantity: qty,
      created_at: new Date().toISOString()
    };

    const mov2: StockMovement = {
      id: `mov-${Date.now()}-2`,
      product_id: productId,
      product_name: prodObj?.name,
      godown_id: toGodownId,
      godown_name: toGodObj?.name,
      type: 'in',
      quantity: qty,
      created_at: new Date().toISOString()
    };

    db.stock_movements.unshift(mov1, mov2);
    saveLocalDB(db);

    setIsTransferModalOpen(false);
    toast.success('স্টক গোডাউন ট্রান্সফার সফল হয়েছে');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="স্টক ও ইনভেন্টরি ট্র্যাকিং"
        subtitle="পণ্যের বর্তমান স্টক, লট/ব্যাচ নম্বর, মেয়াদ এবং ট্রান্সফার বিবরণ"
        action={
          <button
            onClick={openTransferModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-xs transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            গোডাউন স্টক ট্রান্সফার
          </button>
        }
      />

      {/* Navigation Tabs */}
      <div className="flex bg-muted p-1 rounded-xl max-w-md">
        <button
          onClick={() => setTab('levels')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            tab === 'levels' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
          }`}
        >
          মোট স্টক লেভেল
        </button>
        <button
          onClick={() => setTab('batches')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            tab === 'batches' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
          }`}
        >
          পণ্যের ব্যাচ ও মেয়াদ
        </button>
        <button
          onClick={() => setTab('movements')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            tab === 'movements' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
          }`}
        >
          স্টক মুভমেন্ট লগ
        </button>
      </div>

      {/* Tab 1: Overall Stock Levels */}
      {tab === 'levels' && (
        <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
                  <th className="py-3 px-4">পণ্যের নাম</th>
                  <th className="py-3 px-4">একক</th>
                  <th className="py-3 px-4 text-center">কম স্টক এলার্ট সীমা</th>
                  <th className="py-3 px-4 text-right">বর্তমান মোট স্টক</th>
                  <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => {
                  const isLow = p.current_stock <= p.low_stock_alert;
                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-foreground">{p.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{p.unit}</td>
                      <td className="py-3 px-4 text-center">{formatBnNumber(p.low_stock_alert)}</td>
                      <td className="py-3 px-4 text-right font-black text-sm">{formatBnNumber(p.current_stock)}</td>
                      <td className="py-3 px-4 text-center">
                        {isLow ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                            কম স্টক
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            পর্যাপ্ত
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Product Batches */}
      {tab === 'batches' && (
        <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
                  <th className="py-3 px-4">ব্যাচ নম্বর</th>
                  <th className="py-3 px-4">পণ্যের নাম</th>
                  <th className="py-3 px-4 text-center">উৎপাদন তারিখ</th>
                  <th className="py-3 px-4 text-center">মেয়াদ উত্তীর্ণ তারিখ</th>
                  <th className="py-3 px-4 text-right">ব্যাচ স্টক</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {batches.map((b) => {
                  const prod = products.find((p) => p.id === b.product_id);
                  return (
                    <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{b.batch_number}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{prod?.name || b.product_name}</td>
                      <td className="py-3 px-4 text-center">{formatBnDate(b.manufacture_date)}</td>
                      <td className="py-3 px-4 text-center font-semibold text-rose-600">{formatBnDate(b.expiry_date)}</td>
                      <td className="py-3 px-4 text-right font-bold">{formatBnNumber(b.quantity)} {prod?.unit}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Stock Movement Logs */}
      {tab === 'movements' && (
        <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
                  <th className="py-3 px-4">তারিখ ও সময়</th>
                  <th className="py-3 px-4">পণ্যের নাম</th>
                  <th className="py-3 px-4">গোডাউন</th>
                  <th className="py-3 px-4 text-center">মুভমেন্ট টাইপ</th>
                  <th className="py-3 px-4 text-right">পরিমাণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {movements.map((m) => {
                  const prod = products.find((p) => p.id === m.product_id);
                  const god = godowns.find((g) => g.id === m.godown_id);
                  return (
                    <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-muted-foreground">{formatBnDate(m.created_at)}</td>
                      <td className="py-3 px-4 font-bold text-foreground">{prod?.name || m.product_name}</td>
                      <td className="py-3 px-4">{god?.name || m.godown_name}</td>
                      <td className="py-3 px-4 text-center">
                        {m.type === 'in' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            <ArrowDownLeft className="w-3.5 h-3.5" /> স্টক ইন (In)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                            <ArrowUpRight className="w-3.5 h-3.5" /> স্টক আউট (Out)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-black">{formatBnNumber(m.quantity)} {prod?.unit}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-sm">গোডাউন স্টক ট্রান্সফার এন্ট্রি</h3>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">পণ্য নির্বাচন করুন *</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (স্টক: {p.current_stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">উৎস গোডাউন (From) *</label>
                <select
                  value={fromGodownId}
                  onChange={(e) => setFromGodownId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                >
                  {godowns.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">গন্তব্য গোডাউন (To) *</label>
                <select
                  value={toGodownId}
                  onChange={(e) => setToGodownId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                >
                  {godowns.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">ট্রান্সফার পরিমাণ *</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                  placeholder="100"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 bg-muted text-foreground font-semibold rounded-lg text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg text-xs shadow-xs"
                >
                  ট্রান্সফার কনফার্ম
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
