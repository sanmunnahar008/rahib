import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { Area, Territory, Dealer, Sale, Payment } from '../types/database';
import { getLocalDB } from '../lib/supabase';
import { formatBnCurrency, formatBnNumber } from '../lib/format';
import { Map, Layers } from 'lucide-react';

export const AreaReportsPage: React.FC = () => {
  usePageMeta({
    title: 'এরিয়াভিত্তিক সেলস রিপোর্ট',
    description: 'এরিয়া জোন ও টেরিটরি অনুযায়ী বিক্রয়, বকেয়া ও ক্যাশ রিকভারি পারফরম্যান্স'
  });

  const [areas, setAreas] = useState<Area[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const loadData = () => {
    const db = getLocalDB();
    setAreas(db.areas || []);
    setTerritories(db.territories || []);
    setDealers(db.dealers || []);
    setSales(db.sales || []);
    setPayments(db.payments || []);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ph_vision_db_updated', loadData);
    return () => window.removeEventListener('ph_vision_db_updated', loadData);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="এরিয়া ও টেরিটরিভিত্তিক সেলস রিপোর্ট"
        subtitle="আঞ্চলিক জোন ও অঞ্চল অনুযায়ী বিক্রয় ও আদায়ের তুলনামূলক বিশ্লেষণ"
      />

      <div className="space-y-6">
        {areas.map((area) => {
          const areaTerritories = territories.filter((t) => t.area_id === area.id);
          const areaDealers = dealers.filter((d) =>
            areaTerritories.some((t) => t.id === d.territory_id)
          );

          const areaSales = sales.filter((s) =>
            areaDealers.some((d) => d.id === s.dealer_id)
          );
          const areaPayments = payments.filter((p) =>
            areaDealers.some((d) => d.id === p.dealer_id)
          );

          const totalAreaSales = areaSales.reduce((sum, s) => sum + s.total_amount, 0);
          const totalAreaCollections = areaPayments.reduce((sum, p) => sum + p.amount, 0);
          const totalAreaDue = areaDealers.reduce((sum, d) => sum + d.current_balance, 0);

          return (
            <div key={area.id} className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
              <div className="p-5 bg-muted/40 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Map className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-foreground text-base">{area.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      মোট ডিলার: {formatBnNumber(areaDealers.length)} জন | টেরিটরি: {formatBnNumber(areaTerritories.length)} টি
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">মোট বিক্রয়:</span>
                    <span className="text-emerald-700 font-black">{formatBnCurrency(totalAreaSales)}</span>
                  </div>
                  <div className="border-l border-border pl-4">
                    <span className="text-muted-foreground block text-[10px]">ক্যাশ জমা:</span>
                    <span className="text-blue-700 font-black">{formatBnCurrency(totalAreaCollections)}</span>
                  </div>
                  <div className="border-l border-border pl-4">
                    <span className="text-muted-foreground block text-[10px]">বর্তমান বকেয়া:</span>
                    <span className="text-rose-600 font-black">{formatBnCurrency(totalAreaDue)}</span>
                  </div>
                </div>
              </div>

              {/* Territory breakdown list */}
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border font-bold">
                      <th className="py-2 px-3">টেরিটরির নাম</th>
                      <th className="py-2 px-3 text-center">ডিলার সংখ্যা</th>
                      <th className="py-2 px-3 text-right">বিক্রয় (৳)</th>
                      <th className="py-2 px-3 text-right">জমা (৳)</th>
                      <th className="py-2 px-3 text-right">বকেয়া (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {areaTerritories.map((ter) => {
                      const terDealers = dealers.filter((d) => d.territory_id === ter.id);
                      const terSales = sales
                        .filter((s) => terDealers.some((d) => d.id === s.dealer_id))
                        .reduce((sum, s) => sum + s.total_amount, 0);
                      const terPayments = payments
                        .filter((p) => terDealers.some((d) => d.id === p.dealer_id))
                        .reduce((sum, p) => sum + p.amount, 0);
                      const terDue = terDealers.reduce((sum, d) => sum + d.current_balance, 0);

                      return (
                        <tr key={ter.id} className="hover:bg-muted/20">
                          <td className="py-2.5 px-3 font-bold text-foreground flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-primary" />
                            {ter.name}
                          </td>
                          <td className="py-2.5 px-3 text-center">{formatBnNumber(terDealers.length)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-foreground">{formatBnCurrency(terSales)}</td>
                          <td className="py-2.5 px-3 text-right text-blue-700 font-bold">{formatBnCurrency(terPayments)}</td>
                          <td className="py-2.5 px-3 text-right text-rose-600 font-black">{formatBnCurrency(terDue)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
