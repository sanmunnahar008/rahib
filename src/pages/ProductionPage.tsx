import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { Production, Product, RawMaterial } from '../types/database';
import { getLocalDB, saveLocalDB } from '../lib/supabase';
import { formatBnDate, formatBnNumber } from '../lib/format';
import { toast } from 'sonner';
import { Factory, Plus, X } from 'lucide-react';

export const ProductionPage: React.FC = () => {
  usePageMeta({
    title: 'কারখানা ও উৎপাদন এন্ট্রি',
    description: 'কারখানায় ফিনিশড গুঁড়া ও তরল কীটনাশক ফরমুলেশন ও উৎপাদন এন্ট্রি'
  });

  const [productionList, setProductionList] = useState<Production[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [productionDate, setProductionDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = () => {
    const db = getLocalDB();
    setProductionList(db.production || []);
    setProducts(db.products || []);
    setRawMaterials(db.raw_materials || []);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ph_vision_db_updated', loadData);
    return () => window.removeEventListener('ph_vision_db_updated', loadData);
  }, []);

  const openAddModal = () => {
    setProductId(products[0]?.id || '');
    setQuantity('');
    setProductionDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      toast.error('উৎপাদিত পণ্য নির্বাচন করুন');
      return;
    }
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error('সঠিক উৎপাদনের পরিমাণ লিখুন');
      return;
    }

    const db = getLocalDB();
    const prodObj = products.find((p) => p.id === productId);

    const newRun: Production = {
      id: `prod-run-${Date.now()}`,
      product_id: productId,
      product_name: prodObj?.name || '',
      quantity: qty,
      production_date: productionDate,
      raw_materials_used: [],
      created_at: new Date().toISOString()
    };

    // 1. Add production record
    db.production.unshift(newRun);

    // 2. Increment product current stock
    db.products = db.products.map((p: Product) =>
      p.id === productId ? { ...p, current_stock: p.current_stock + qty } : p
    );

    saveLocalDB(db);
    setIsModalOpen(false);
    toast.success('উৎপাদন এন্ট্রি সফল হয়েছে এবং স্টক বৃদ্ধি করা হয়েছে');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="উৎপাদন ও প্রসেসিং ব্যাচ এন্ট্রি"
        subtitle="কারখানায় নতুন লট উৎপাদন এন্ট্রি এবং ফিনিশড গুডস ইনভেন্টরি আপডেট"
        action={
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন উৎপাদন এন্ট্রি
          </button>
        }
      />

      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        {productionList.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">কোনো উৎপাদন রেকর্ড পাওয়া যায়নি</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
                  <th className="py-3 px-4">উৎপাদনের তারিখ</th>
                  <th className="py-3 px-4">উৎপাদিত পণ্য</th>
                  <th className="py-3 px-4 text-right">উৎপাদনের পরিমাণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {productionList.map((run) => {
                  const prod = products.find((p) => p.id === run.product_id);
                  return (
                    <tr key={run.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-semibold">{formatBnDate(run.production_date)}</td>
                      <td className="py-3 px-4 font-bold text-foreground">{prod?.name || run.product_name}</td>
                      <td className="py-3 px-4 text-right font-black text-emerald-700 text-sm">
                        + {formatBnNumber(run.quantity)} {prod?.unit || 'একক'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Factory className="w-4 h-4 text-primary" />
                নতুন কারখানা উৎপাদন এন্ট্রি
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">উৎপাদিত পণ্য *</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                >
                  <option value="">পণ্য নির্বাচন করুন</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">উৎপাদনের পরিমাণ *</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                  placeholder="500"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">উৎপাদনের তারিখ *</label>
                <input
                  type="date"
                  value={productionDate}
                  onChange={(e) => setProductionDate(e.target.value)}
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
                  উৎপাদন এন্ট্রি নিশ্চিত
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
