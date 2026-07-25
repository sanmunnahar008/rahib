import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { Purchase, Supplier, RawMaterial } from '../types/database';
import { getLocalDB, saveLocalDB } from '../lib/supabase';
import { formatBnCurrency, formatBnDate, formatBnNumber } from '../lib/format';
import { toast } from 'sonner';
import { ShoppingCart, Plus, X } from 'lucide-react';

export const PurchasesPage: React.FC = () => {
  usePageMeta({
    title: 'ক্রয় চালান রেকর্ড',
    description: 'সরবরাহকারীদের কাছ থেকে কেমিক্যাল ও কাঁচামাল ক্রয় এন্ট্রি'
  });

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [rawMaterialId, setRawMaterialId] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');

  const loadData = () => {
    const db = getLocalDB();
    setPurchases(db.purchases || []);
    setSuppliers(db.suppliers || []);
    setRawMaterials(db.raw_materials || []);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ph_vision_db_updated', loadData);
    return () => window.removeEventListener('ph_vision_db_updated', loadData);
  }, []);

  const openAddModal = () => {
    setSupplierId(suppliers[0]?.id || '');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setRawMaterialId(rawMaterials[0]?.id || '');
    setQuantity('');
    setUnitPrice('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !rawMaterialId) {
      toast.error('সরবরাহকারী ও কাঁচামাল নির্বাচন করুন');
      return;
    }
    const qty = Number(quantity);
    const price = Number(unitPrice);
    if (isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
      toast.error('সঠিক পরিমাণ ও একক মূল্য দিন');
      return;
    }

    const db = getLocalDB();
    const supObj = suppliers.find((s) => s.id === supplierId);
    const rmObj = rawMaterials.find((r) => r.id === rawMaterialId);

    const total = qty * price;
    const newPurchase: Purchase = {
      id: `pur-${Date.now()}`,
      supplier_id: supplierId,
      supplier_name: supObj?.name || '',
      purchase_date: purchaseDate,
      total_amount: total,
      items: [
        {
          raw_material_id: rawMaterialId,
          name: rmObj?.name || '',
          quantity: qty,
          unit_price: price,
          total
        }
      ],
      created_at: new Date().toISOString()
    };

    // 1. Save purchase
    db.purchases.unshift(newPurchase);

    // 2. Increment raw material current stock
    db.raw_materials = db.raw_materials.map((rm: RawMaterial) =>
      rm.id === rawMaterialId ? { ...rm, current_stock: rm.current_stock + qty } : rm
    );

    saveLocalDB(db);
    setIsModalOpen(false);
    toast.success('ক্রয় চালান এন্ট্রি সফল হয়েছে এবং স্টক বৃদ্ধি করা হয়েছে');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ক্রয় চালান ও রিসিভিং"
        subtitle="ভেন্ডরদের কাছ থেকে কাঁচামাল ক্রয় চালান এবং ইনভেন্টরিতে যোগ"
        action={
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন ক্রয় এন্ট্রি
          </button>
        }
      />

      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        {purchases.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">কোনো ক্রয় রেকর্ড পাওয়া যায়নি</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
                  <th className="py-3 px-4">ক্রয়ের তারিখ</th>
                  <th className="py-3 px-4">সরবরাহকারী</th>
                  <th className="py-3 px-4">ক্রয়কৃত উপাদান</th>
                  <th className="py-3 px-4 text-right">পরিমাণ ও দর</th>
                  <th className="py-3 px-4 text-right">সর্বমোট টাকা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-semibold">{formatBnDate(p.purchase_date)}</td>
                    <td className="py-3 px-4 font-bold text-foreground">{p.supplier_name}</td>
                    <td className="py-3 px-4">{p.items.map((i) => i.name).join(', ')}</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">
                      {p.items.map((i) => `${formatBnNumber(i.quantity)} x ${formatBnCurrency(i.unit_price)}`).join(', ')}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-foreground text-sm">
                      {formatBnCurrency(p.total_amount)}
                    </td>
                  </tr>
                ))}
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
                <ShoppingCart className="w-4 h-4 text-primary" />
                নতুন ক্রয় চালান এন্ট্রি
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
                <label className="block text-xs font-semibold text-foreground mb-1">সরবরাহকারী *</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">ক্রয়কৃত কাঁচামাল *</label>
                <select
                  value={rawMaterialId}
                  onChange={(e) => setRawMaterialId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                >
                  {rawMaterials.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">পরিমাণ *</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                    placeholder="100"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">একক মূল্য (৳) *</label>
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value ? Number(e.target.value) : '')}
                    placeholder="350"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">ক্রয়ের তারিখ *</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
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
                  ক্রয় কনফার্ম
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
