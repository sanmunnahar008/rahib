import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { Sale, SaleItem, Dealer, Product, Officer } from '../types/database';
import { getLocalDB, saveLocalDB } from '../lib/supabase';
import { formatBnCurrency, formatBnDate, formatBnNumber } from '../lib/format';
import { PrintInvoiceModal } from '../components/sales/PrintInvoiceModal';
import { toast } from 'sonner';
import {
  Receipt,
  Plus,
  ShoppingCart,
  Printer,
  Trash2,
  X,
  Search,
  CheckCircle2
} from 'lucide-react';

export const SalesPage: React.FC = () => {
  usePageMeta({
    title: 'বিক্রয় ও ইনভয়েস',
    description: 'ডিলারদের জন্য নতুন বিক্রয় চালান তৈরি, মুদ্রণ ও পূর্ববর্তী ইনভয়েস'
  });

  const { user, profile, role } = useAuth();
  const isAdmin = role === 'admin';

  const [sales, setSales] = useState<Sale[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [userTerritoryIds, setUserTerritoryIds] = useState<string[]>([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');

  // New Sale Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDealerId, setSelectedDealerId] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState<number | ''>(0);
  const [paidAmount, setPaidAmount] = useState<number | ''>(0);

  // Cart Add item state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState<number | ''>(1);

  // Invoice Print Modal State
  const [selectedSaleForPrint, setSelectedSaleForPrint] = useState<Sale | null>(null);

  const loadData = () => {
    const db = getLocalDB();
    setSales(db.sales || []);
    setDealers(db.dealers || []);
    setProducts(db.products || []);

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

  const openNewSaleModal = () => {
    setSelectedDealerId(availableDealers[0]?.id || '');
    setSaleDate(new Date().toISOString().split('T')[0]);
    setCart([]);
    setDiscount(0);
    setPaidAmount(0);
    setSelectedProductId('');
    setItemQuantity(1);
    setIsModalOpen(true);
  };

  const handleAddToCart = () => {
    if (!selectedProductId) {
      toast.error('পণ্য নির্বাচন করুন');
      return;
    }
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const qty = Number(itemQuantity);
    if (qty <= 0) {
      toast.error('সঠিক পরিমাণ দিন');
      return;
    }

    if (qty > prod.current_stock) {
      toast.error(`পর্যাপ্ত স্টক নেই! বর্তমান স্টক: ${prod.current_stock} ${prod.unit}`);
      return;
    }

    const existingIndex = cart.findIndex((i) => i.product_id === selectedProductId);
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      const newQty = updatedCart[existingIndex].quantity + qty;
      if (newQty > prod.current_stock) {
        toast.error(`স্টক সীমা অতিক্রম হয়েছে! সর্বোচ্চ: ${prod.current_stock} ${prod.unit}`);
        return;
      }
      updatedCart[existingIndex].quantity = newQty;
      updatedCart[existingIndex].total = newQty * prod.price;
      setCart(updatedCart);
    } else {
      const newItem: SaleItem = {
        product_id: prod.id,
        name: prod.name,
        unit: prod.unit,
        quantity: qty,
        unit_price: prod.price,
        total: qty * prod.price
      };
      setCart([...cart, newItem]);
    }

    setSelectedProductId('');
    setItemQuantity(1);
  };

  const removeFromCart = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const totalAmount = Math.max(0, subtotal - Number(discount || 0));
  const dueAmount = Math.max(0, totalAmount - Number(paidAmount || 0));

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealerId) {
      toast.error('ডিলার নির্বাচন করুন');
      return;
    }
    if (cart.length === 0) {
      toast.error('কার্টে অন্তত একটি পণ্য যোগ করুন');
      return;
    }

    const db = getLocalDB();
    const dealerObj = dealers.find((d) => d.id === selectedDealerId);

    const invCount = (db.sales || []).length + 1001;
    const invoiceNo = `INV-2026-${invCount}`;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      dealer_id: selectedDealerId,
      dealer_name: dealerObj?.name || '',
      sale_date: saleDate,
      total_amount: totalAmount,
      discount: Number(discount || 0),
      paid_amount: Number(paidAmount || 0),
      due_amount: dueAmount,
      items: cart,
      invoice_no: invoiceNo,
      created_by: user?.id || 'usr-officer-1',
      created_by_name: profile?.full_name || 'অফিসার',
      created_at: new Date().toISOString()
    };

    // 1. Append Sale
    db.sales.unshift(newSale);

    // 2. Update Dealer Balance
    if (dealerObj) {
      db.dealers = db.dealers.map((d: Dealer) =>
        d.id === selectedDealerId
          ? { ...d, current_balance: d.current_balance + dueAmount }
          : d
      );
    }

    // 3. Update Product Stocks
    cart.forEach((cartItem) => {
      db.products = db.products.map((p: Product) =>
        p.id === cartItem.product_id
          ? { ...p, current_stock: Math.max(0, p.current_stock - cartItem.quantity) }
          : p
      );
    });

    saveLocalDB(db);
    setIsModalOpen(false);
    toast.success(`চালান ${invoiceNo} সফলভাবে তৈরি হয়েছে`);

    // Open print preview automatically
    setSelectedSaleForPrint(newSale);
  };

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.dealer_name && s.dealer_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const isAuthorized =
      isAdmin ||
      dealers.some((d) => d.id === s.dealer_id && userTerritoryIds.includes(d.territory_id));

    return matchesSearch && isAuthorized;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="বিক্রয় চালান ও ইনভয়েস"
        subtitle="ডিলারদের অনুকূলে নতুন চালান তৈরি, চালানের কপি প্রিন্ট ও রিপোর্ট"
        action={
          <button
            onClick={openNewSaleModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন বিক্রয় এন্ট্রি
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
            placeholder="ইনভয়েস নম্বর বা ডিলারের নাম..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
          />
        </div>
      </div>

      {/* Sales Invoices List Table */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">কোনো বিক্রয় ইনভয়েস পাওয়া যায়নি</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
                  <th className="py-3 px-4">ইনভয়েস নম্বর</th>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">ডিলারের নাম</th>
                  <th className="py-3 px-4 text-right">মোট টাকা</th>
                  <th className="py-3 px-4 text-right">জমা প্রদান</th>
                  <th className="py-3 px-4 text-right">বকেয়া</th>
                  <th className="py-3 px-4 text-center">প্রিন্ট / অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary">{s.invoice_no}</td>
                    <td className="py-3 px-4">{formatBnDate(s.sale_date)}</td>
                    <td className="py-3 px-4 font-semibold text-foreground">{s.dealer_name || 'সাধারণ ডিলার'}</td>
                    <td className="py-3 px-4 text-right font-bold">{formatBnCurrency(s.total_amount)}</td>
                    <td className="py-3 px-4 text-right text-emerald-700 font-semibold">{formatBnCurrency(s.paid_amount)}</td>
                    <td className="py-3 px-4 text-right font-bold text-rose-600">
                      {s.due_amount > 0 ? formatBnCurrency(s.due_amount) : <span className="text-emerald-600 font-bold">পরিশোধিত</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedSaleForPrint(s)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        ইনভয়েস প্রিন্ট
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                নতুন বিক্রয় এন্ট্রি / ইনভয়েস ফর্ম
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="space-y-4">
              {/* Dealer and Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">ডিলার নির্বাচন করুন *</label>
                  <select
                    value={selectedDealerId}
                    onChange={(e) => setSelectedDealerId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                  >
                    <option value="">ডিলার বেছে নিন</option>
                    {availableDealers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.dealer_code}) - {d.territory_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">বিক্রয়ের তারিখ *</label>
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Add Product to Cart Box */}
              <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-3">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  কার্টে পণ্য সংযুক্ত করুন
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">পণ্য বেছে নিন</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                    >
                      <option value="">পণ্য নির্বাচন...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — ৳{p.price} (স্টক: {p.current_stock} {p.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">পরিমাণ</label>
                    <input
                      type="number"
                      min={1}
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="w-full py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      যোগ করুন
                    </button>
                  </div>
                </div>
              </div>

              {/* Cart Table */}
              <div className="border border-border rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted border-b border-border text-muted-foreground font-bold">
                      <th className="py-2 px-3">পণ্যের বিবরণ</th>
                      <th className="py-2 px-3 text-center">পরিমাণ</th>
                      <th className="py-2 px-3 text-right">একক মূল্য</th>
                      <th className="py-2 px-3 text-right">মোট (৳)</th>
                      <th className="py-2 px-3 text-center">মুছুন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {cart.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-muted-foreground text-xs">
                          কার্ট ফাঁকা রয়েছে। পণ্য যোগ করুন।
                        </td>
                      </tr>
                    ) : (
                      cart.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-semibold text-foreground">{item.name}</td>
                          <td className="py-2 px-3 text-center font-bold">
                            {formatBnNumber(item.quantity)} {item.unit}
                          </td>
                          <td className="py-2 px-3 text-right">{formatBnCurrency(item.unit_price)}</td>
                          <td className="py-2 px-3 text-right font-bold">{formatBnCurrency(item.total)}</td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeFromCart(idx)}
                              className="text-rose-600 hover:text-rose-800 p-1"
                              aria-label="কার্ট থেকে সরান"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Payment Summary Calculation */}
              <div className="p-4 bg-muted/20 rounded-xl border border-border space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>সাবটোটাল:</span>
                  <span className="font-bold text-foreground">{formatBnCurrency(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-foreground">ডিসকাউন্ট/ছাড় (৳):</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value ? Number(e.target.value) : 0)}
                    className="w-32 px-2 py-1 text-xs text-right rounded border border-input bg-background font-bold text-rose-600"
                  />
                </div>

                <div className="flex justify-between font-bold text-sm text-foreground border-t border-border pt-1">
                  <span>মোট বিক্রয় মূল্য:</span>
                  <span>{formatBnCurrency(totalAmount)}</span>
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <span className="font-semibold text-emerald-700">নগদ/জমা প্রাপ্তি (৳):</span>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value ? Number(e.target.value) : 0)}
                    className="w-32 px-2 py-1 text-xs text-right rounded border border-input bg-background font-bold text-emerald-700"
                  />
                </div>

                <div className="flex justify-between font-extrabold text-sm text-rose-600 border-t border-border pt-1">
                  <span>অবশিষ্ট বকেয়া (Due):</span>
                  <span>{formatBnCurrency(dueAmount)}</span>
                </div>
              </div>

              {/* Action Buttons */}
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
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  ইনভয়েস কনফার্ম করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Print Modal */}
      {selectedSaleForPrint && (
        <PrintInvoiceModal
          sale={selectedSaleForPrint}
          dealer={dealers.find((d) => d.id === selectedSaleForPrint.dealer_id)}
          onClose={() => setSelectedSaleForPrint(null)}
        />
      )}
    </div>
  );
};
