import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { Expense } from '../types/database';
import { getLocalDB, saveLocalDB } from '../lib/supabase';
import { formatBnCurrency, formatBnDate } from '../lib/format';
import { toast } from 'sonner';
import { DollarSign, Plus, Trash2, X } from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  usePageMeta({
    title: 'কোম্পানি ব্যয় ও খরচ',
    description: 'অফিস প্রসাধন, পরিবহন, বেতন ও অন্যান্য অফিসিয়াল খরচের রেকর্ড'
  });

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [category, setCategory] = useState('পরিবহন ও যাতায়াত খরচ');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  const loadExpenses = () => {
    const db = getLocalDB();
    setExpenses(db.expenses || []);
  };

  useEffect(() => {
    loadExpenses();
    window.addEventListener('ph_vision_db_updated', loadExpenses);
    return () => window.removeEventListener('ph_vision_db_updated', loadExpenses);
  }, []);

  const openAddModal = () => {
    setCategory('পরিবহন ও যাতায়াত খরচ');
    setAmount('');
    setDescription('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amount);
    if (isNaN(val) || val <= 0) {
      toast.error('খরচের সঠিক পরিমাণ লিখুন');
      return;
    }

    const db = getLocalDB();
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      category,
      amount: val,
      description,
      expense_date: expenseDate,
      created_by: 'usr-admin-1',
      created_at: new Date().toISOString()
    };

    db.expenses.unshift(newExp);
    saveLocalDB(db);
    setIsModalOpen(false);
    toast.success('খরচ সফলভাবে যুক্ত হয়েছে');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('আপনি কি এই খরচের এন্ট্রিটি মুছে ফেলতে চান?')) {
      const db = getLocalDB();
      db.expenses = db.expenses.filter((e: Expense) => e.id !== id);
      saveLocalDB(db);
      toast.success('খরচ মুছে ফেলা হয়েছে');
    }
  };

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="কোম্পানি ব্যয় ও পরিচালন খরচ"
        subtitle="অফিস, ট্রান্সপোর্ট, ইউটিলিটি বিল ও অন্যান্য প্রশাসনিক খরচের বিবরণ"
        action={
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন খরচ এন্ট্রি
          </button>
        }
      />

      {/* Expense Total Overview Box */}
      <div className="bg-card p-5 rounded-xl border border-border shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-muted-foreground uppercase">সর্বমোট নথিবদ্ধ খরচ</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{formatBnCurrency(totalExpense)}</p>
        </div>
        <div className="p-3 bg-rose-100 text-rose-800 rounded-xl">
          <DollarSign className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        {expenses.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">কোনো খরচের এন্ট্রি পাওয়া যায়নি</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">খরচের খাত/ক্যাটাগরি</th>
                  <th className="py-3 px-4">বিবরণ</th>
                  <th className="py-3 px-4 text-right">পরিমাণ (৳)</th>
                  <th className="py-3 px-4 text-center">মুছুন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-semibold">{formatBnDate(e.expense_date)}</td>
                    <td className="py-3 px-4 font-bold text-foreground">{e.category}</td>
                    <td className="py-3 px-4 text-muted-foreground">{e.description || '-'}</td>
                    <td className="py-3 px-4 text-right font-black text-rose-600 text-sm">
                      {formatBnCurrency(e.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        aria-label="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
              <h3 className="font-bold text-foreground text-sm">নতুন খরচ এন্ট্রি</h3>
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
                <label className="block text-xs font-semibold text-foreground mb-1">খরচের খাত/ক্যাটাগরি *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                >
                  <option value="পরিবহন ও যাতায়াত খরচ">পরিবহন ও যাতায়াত খরচ</option>
                  <option value="অফিস প্রসাধন ও বিদ্যুৎ">অফিস প্রসাধন ও বিদ্যুৎ</option>
                  <option value="আপ্যায়ন ও বিনোদন">আপ্যায়ন ও বিনোদন</option>
                  <option value="প্রমোশন ও মার্কেটিং">প্রমোশন ও মার্কেটিং</option>
                  <option value="অন্যান্য সাধারণ খরচ">অন্যান্য সাধারণ খরচ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">টাকার পরিমাণ (৳) *</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                  placeholder="5000"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">খরচের তারিখ *</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">সংক্ষিপ্ত বিবরণ</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="যেমন: ট্রাক ভাড়া / ইলেকট্রিক বিল"
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
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
