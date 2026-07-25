import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { Dealer, Territory, Officer } from '../types/database';
import { getLocalDB, saveLocalDB } from '../lib/supabase';
import { formatBnCurrency, formatBnNumber } from '../lib/format';
import { toast } from 'sonner';
import { Store, Plus, Search, Edit2, Phone, MapPin, CreditCard, X } from 'lucide-react';

export const DealersPage: React.FC = () => {
  usePageMeta({
    title: 'ডিলার নেটওয়ার্ক',
    description: 'PH VISION LTD অনুমোদিত ডিলার তালিকা, হিসাব ও ক্রেডিট লিমিট'
  });

  const { user, role } = useAuth();
  const isAdmin = role === 'admin';

  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [userTerritoryIds, setUserTerritoryIds] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTerritory, setSelectedTerritory] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [territoryId, setTerritoryId] = useState('');
  const [creditLimit, setCreditLimit] = useState<number | ''>(300000);

  const loadData = () => {
    const db = getLocalDB();
    setDealers(db.dealers || []);
    setTerritories(db.territories || []);
    setOfficers(db.officers || []);

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

  const availableTerritories = isAdmin
    ? territories
    : territories.filter((t) => userTerritoryIds.includes(t.id));

  const openAddModal = () => {
    setEditingDealer(null);
    setName('');
    setMobile('');
    setAddress('');
    setTerritoryId(availableTerritories[0]?.id || '');
    setCreditLimit(300000);
    setIsModalOpen(true);
  };

  const openEditModal = (d: Dealer) => {
    setEditingDealer(d);
    setName(d.name);
    setMobile(d.mobile);
    setAddress(d.address);
    setTerritoryId(d.territory_id);
    setCreditLimit(d.credit_limit);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('ডিলারের নাম আবশ্যক');
      return;
    }
    if (!mobile.trim()) {
      toast.error('মোবাইল নম্বর লিখুন');
      return;
    }
    if (!territoryId) {
      toast.error('টেরিটরি নির্বাচন করুন');
      return;
    }

    const db = getLocalDB();
    const terObj = territories.find((t) => t.id === territoryId);

    if (editingDealer) {
      db.dealers = db.dealers.map((d: Dealer) =>
        d.id === editingDealer.id
          ? {
              ...d,
              name,
              mobile,
              address,
              territory_id: territoryId,
              territory_name: terObj?.name || '',
              credit_limit: Number(creditLimit || 0)
            }
          : d
      );
      toast.success('ডিলার তথ্য আপডেট করা হয়েছে');
    } else {
      // Auto dealer code generation DLR-100X
      const count = (db.dealers || []).length + 1001;
      const dealerCode = `DLR-${count}`;

      const newDealer: Dealer = {
        id: `dlr-${Date.now()}`,
        name,
        mobile,
        address,
        territory_id: territoryId,
        territory_name: terObj?.name || '',
        dealer_code: dealerCode,
        current_balance: 0,
        credit_limit: Number(creditLimit || 300000),
        created_at: new Date().toISOString()
      };
      db.dealers.push(newDealer);
      toast.success(`নতুন ডিলার সংযুক্ত করা হয়েছে (কোড: ${dealerCode})`);
    }

    saveLocalDB(db);
    setIsModalOpen(false);
  };

  const filteredDealers = dealers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.dealer_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.mobile.includes(searchTerm);

    const matchesTerritory =
      selectedTerritory === 'all' || d.territory_id === selectedTerritory;

    // Officer territory restriction filter
    const officerTerritoryMatch = isAdmin || userTerritoryIds.includes(d.territory_id);

    return matchesSearch && matchesTerritory && officerTerritoryMatch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="ডিলার ও পরিবেশক তালিকা"
        subtitle="মাঠ পর্যায়ের অনুমোদিত ডিলারবৃন্দ, বকেয়া লেজার ও ক্রেডিট সীমা"
        action={
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন ডিলার যোগ করুন
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
            placeholder="ডিলারের নাম, মোবাইল বা কোড দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">টেরিটরি ফিল্টার:</label>
          <select
            value={selectedTerritory}
            onChange={(e) => setSelectedTerritory(e.target.value)}
            className="w-full sm:w-48 py-1.5 px-3 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
          >
            <option value="all">সব টেরিটরি</option>
            {availableTerritories.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dealers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDealers.map((d) => {
          const ter = territories.find((t) => t.id === d.territory_id);
          const isOverLimit = d.current_balance > d.credit_limit;

          return (
            <div
              key={d.id}
              className="bg-card p-5 rounded-xl border border-border shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm leading-snug">{d.name}</h3>
                      <span className="inline-block px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px] font-bold mt-0.5">
                        {d.dealer_code}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => openEditModal(d)}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    aria-label="সম্পাদনা করুন"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{d.mobile}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{d.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>টেরিটরি: {ter?.name || d.territory_name || '-'}</span>
                  </p>
                </div>
              </div>

              {/* Balance & Credit Info */}
              <div className="pt-3 border-t border-border bg-muted/20 -mx-5 -mb-5 p-4 rounded-b-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground block font-semibold">বর্তমান বকেয়া:</span>
                  <span className={`font-black text-sm ${isOverLimit ? 'text-rose-600' : 'text-foreground'}`}>
                    {formatBnCurrency(d.current_balance)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block font-semibold">ক্রেডিট সীমা:</span>
                  <span className="font-bold text-muted-foreground">
                    {formatBnCurrency(d.credit_limit)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Dealer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-sm">
                {editingDealer ? 'ডিলার তথ্য সংশোধন' : 'নতুন ডিলার নিবন্ধন'}
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
                <label className="block text-xs font-semibold text-foreground mb-1">ডিলার বা প্রতিষ্ঠানের নাম *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="মেসার্স মদিনা ট্রেডার্স"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">মোবাইল নম্বর *</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="01712000111"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">ঠিকানা</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="বাজার মোড়, জয়দেবপুর"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">অ্যাসাইনকৃত টেরিটরি *</label>
                <select
                  value={territoryId}
                  onChange={(e) => setTerritoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                >
                  <option value="">টেরিটরি বাছাই করুন</option>
                  {availableTerritories.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">সর্বোচ্চ ক্রেডিট সীমা (৳)</label>
                <input
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value ? Number(e.target.value) : '')}
                  placeholder="300000"
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
