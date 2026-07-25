import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==========================================
// LOCAL PERSISTENT AGRO-CHEMICAL DATA ENGINE
// ==========================================
// Provides instant, fully interactive database state in preview mode

const STORAGE_KEY = 'ph_vision_db_v1';

const INITIAL_DATA = {
  profiles: [
    { id: 'usr-admin-1', full_name: 'আরিফুল ইসলাম', mobile: '01711000111', email: 'admin@phvision.com', created_at: '2026-01-01T00:00:00Z' },
    { id: 'usr-officer-1', full_name: 'মোঃ তানভীর আহমেদ', mobile: '01812999222', email: 'officer@phvision.com', created_at: '2026-01-02T00:00:00Z' },
    { id: 'usr-pending-1', full_name: 'কাজী রফিকুল ইসলাম', mobile: '01913888333', email: 'pending@phvision.com', created_at: '2026-02-15T00:00:00Z' }
  ],
  user_roles: [
    { id: 'ur-1', user_id: 'usr-admin-1', role: 'admin', created_at: '2026-01-01T00:00:00Z' },
    { id: 'ur-2', user_id: 'usr-officer-1', role: 'officer', created_at: '2026-01-02T00:00:00Z' }
  ],
  areas: [
    { id: 'area-1', name: 'ঢাকা দক্ষিণ ও মধ্যাঞ্চল', created_at: '2026-01-01T00:00:00Z' },
    { id: 'area-2', name: 'বগুড়া ও উত্তরবঙ্গ জোন', created_at: '2026-01-01T00:00:00Z' },
    { id: 'area-3', name: 'যশোর ও দক্ষিণ-পশ্চিমাঞ্চল', created_at: '2026-01-01T00:00:00Z' }
  ],
  territories: [
    { id: 'ter-1', name: 'গাজীপুর সদর টেরিটরি', area_id: 'area-1', created_at: '2026-01-01T00:00:00Z' },
    { id: 'ter-2', name: 'শেরপুর জেলা টেরিটরি', area_id: 'area-2', created_at: '2026-01-01T00:00:00Z' },
    { id: 'ter-3', name: 'ঝিনাইদহ সদর টেরিটরি', area_id: 'area-3', created_at: '2026-01-01T00:00:00Z' }
  ],
  officers: [
    { id: 'off-1', name: 'মোঃ তানভীর আহমেদ', mobile: '01812999222', user_id: 'usr-officer-1', created_at: '2026-01-02T00:00:00Z', territory_ids: ['ter-1', 'ter-2'] },
    { id: 'off-2', name: 'শাহীনুর রহমান', mobile: '01715444555', user_id: null, created_at: '2026-01-05T00:00:00Z', territory_ids: ['ter-3'] }
  ],
  officer_territories: [
    { officer_id: 'off-1', territory_id: 'ter-1' },
    { officer_id: 'off-1', territory_id: 'ter-2' },
    { officer_id: 'off-2', territory_id: 'ter-3' }
  ],
  categories: [
    { id: 'cat-1', name: 'কীটনাশক (Insecticide)', description: 'ফসল সুরক্ষায় দানাদার ও তরল কীটনাশক' },
    { id: 'cat-2', name: 'ছত্রাকনাশক (Fungicide)', description: 'ধান ও সবজির জন্য উন্নত ছত্রাকনাশক' },
    { id: 'cat-3', name: 'গাছের ভিটামিন ও পিজিআর (PGR)', description: 'বৃদ্ধি সহায়ক ও ফলন বৃদ্ধির বিশেষ ফরমুলেশন' }
  ],
  products: [
    { id: 'prod-1', name: 'ভিশন থিওভিট ৮০ ডব্লিউডিজি', category_id: 'cat-2', unit: 'কেজি', price: 680, current_stock: 450, low_stock_alert: 100, created_at: '2026-01-01T00:00:00Z' },
    { id: 'prod-2', name: 'অ্যাগ্রো সুপার সলোমন ২০ ইসি', category_id: 'cat-1', unit: 'লিটার', price: 1250, current_stock: 35, low_stock_alert: 50, created_at: '2026-01-01T00:00:00Z' },
    { id: 'prod-3', name: 'ভিশন গোল্ড গ্রোথ প্লাস', category_id: 'cat-3', unit: 'মি.লি.', price: 420, current_stock: 220, low_stock_alert: 40, created_at: '2026-01-01T00:00:00Z' },
    { id: 'prod-4', name: 'পাওয়ার ফিল্ড ১০ জি দানাদার', category_id: 'cat-1', unit: 'কেজি', price: 290, current_stock: 15, low_stock_alert: 30, created_at: '2026-01-01T00:00:00Z' }
  ],
  product_batches: [
    { id: 'batch-1', product_id: 'prod-1', batch_number: 'PV-THI-2026A', quantity: 300, manufacture_date: '2026-01-10', expiry_date: '2028-01-10' },
    { id: 'batch-2', product_id: 'prod-2', batch_number: 'PV-SOL-2026B', quantity: 35, manufacture_date: '2025-11-01', expiry_date: '2026-08-15' },
    { id: 'batch-3', product_id: 'prod-3', batch_number: 'PV-GLD-2026C', quantity: 220, manufacture_date: '2026-02-01', expiry_date: '2027-02-01' }
  ],
  godowns: [
    { id: 'god-1', name: 'কেন্দ্রীয় ওয়ারহাউস গাজীপুর', location: 'জয়দেবপুর চত্বর, গাজীপুর', officer_id: 'off-1', created_at: '2026-01-01T00:00:00Z' },
    { id: 'god-2', name: 'শেরপুর রিজিওনাল গোডাউন', location: 'নয়ানী বাজার, শেরপুর', officer_id: 'off-1', created_at: '2026-01-01T00:00:00Z' },
    { id: 'god-3', name: 'যশোর ডিপো', location: 'নিউ মার্কেট মোড়, যশোর', officer_id: 'off-2', created_at: '2026-01-01T00:00:00Z' }
  ],
  dealers: [
    { id: 'dlr-1', name: 'মেসার্স বিসমিল্লাহ ট্রেডার্স', mobile: '01712111222', address: 'চৌরাস্তা, গাজীপুর', territory_id: 'ter-1', dealer_code: 'DLR-1001', current_balance: 145000, credit_limit: 500000, created_at: '2026-01-05T00:00:00Z' },
    { id: 'dlr-2', name: 'রহমান অ্যাগ্রো সেনসিভ', mobile: '01819333444', address: 'শেরপুর বাসস্ট্যান্ড, শেরপুর', territory_id: 'ter-2', dealer_code: 'DLR-1002', current_balance: 82000, credit_limit: 300000, created_at: '2026-01-08T00:00:00Z' },
    { id: 'dlr-3', name: 'আল মদিনা ক্রপ কেয়ার', mobile: '01911555666', address: 'কোটচাঁদপুর বাজার, ঝিনাইদহ', territory_id: 'ter-3', dealer_code: 'DLR-1003', current_balance: 210000, credit_limit: 400000, created_at: '2026-01-10T00:00:00Z' }
  ],
  suppliers: [
    { id: 'sup-1', name: 'গ্লোবাল কেমিক্যালস সলিউশনস', mobile: '01710999888', address: 'তেজগাঁও শিল্প এলাকা, ঢাকা', created_at: '2026-01-01T00:00:00Z' },
    { id: 'sup-2', name: 'সিনথেটিক প্লাস্টিকস এন্ড প্যাক', mobile: '01815777666', address: 'টঙ্গী বিসিক, গাজীপুর', created_at: '2026-01-01T00:00:00Z' }
  ],
  raw_materials: [
    { id: 'raw-1', name: 'সালফার গ্র্যানিউলস ৯৯.৫%', unit: 'কেজি', current_stock: 1200, low_stock_alert: 200, created_at: '2026-01-01T00:00:00Z' },
    { id: 'raw-2', name: 'ইমিডাক্লোপ্রিড টেকনিক্যাল ৯৭%', unit: 'কেজি', current_stock: 45, low_stock_alert: 50, created_at: '2026-01-01T00:00:00Z' },
    { id: 'raw-3', name: 'এইচডিপিই বোতল ৫০ মি.লি.', unit: 'পিস', current_stock: 5000, low_stock_alert: 1000, created_at: '2026-01-01T00:00:00Z' }
  ],
  purchases: [
    {
      id: 'pur-1',
      supplier_id: 'sup-1',
      purchase_date: '2026-02-01',
      total_amount: 450000,
      items: [
        { raw_material_id: 'raw-1', name: 'সালফার গ্র্যানিউলস ৯৯.৫%', quantity: 1000, unit_price: 350, total: 350000 },
        { raw_material_id: 'raw-2', name: 'ইমিডাক্লোপ্রিড টেকনিক্যাল ৯৭%', quantity: 20, unit_price: 5000, total: 100000 }
      ],
      created_at: '2026-02-01T00:00:00Z'
    }
  ],
  production: [
    {
      id: 'prod-run-1',
      product_id: 'prod-1',
      quantity: 500,
      production_date: '2026-02-05',
      raw_materials_used: [
        { raw_material_id: 'raw-1', name: 'সালফার গ্র্যানিউলস ৯৯.৫%', quantity: 450 }
      ],
      created_at: '2026-02-05T00:00:00Z'
    }
  ],
  sales: [
    {
      id: 'sale-101',
      dealer_id: 'dlr-1',
      sale_date: '2026-07-10',
      total_amount: 136000,
      discount: 6000,
      paid_amount: 50000,
      due_amount: 80000,
      items: [
        { product_id: 'prod-1', name: 'ভিশন থিওভিট ৮০ ডব্লিউডিজি', unit: 'কেজি', quantity: 200, unit_price: 680, total: 136000 }
      ],
      invoice_no: 'INV-2026-1001',
      created_by: 'usr-officer-1',
      created_at: '2026-07-10T10:30:00Z'
    },
    {
      id: 'sale-102',
      dealer_id: 'dlr-2',
      sale_date: '2026-07-18',
      total_amount: 62500,
      discount: 2500,
      paid_amount: 20000,
      due_amount: 40000,
      items: [
        { product_id: 'prod-2', name: 'অ্যাগ্রো সুপার সলোমন ২০ ইসি', unit: 'লিটার', quantity: 50, unit_price: 1250, total: 62500 }
      ],
      invoice_no: 'INV-2026-1002',
      created_by: 'usr-officer-1',
      created_at: '2026-07-18T14:15:00Z'
    }
  ],
  payments: [
    {
      id: 'pay-1',
      dealer_id: 'dlr-1',
      amount: 50000,
      payment_date: '2026-07-10',
      payment_method: 'ব্যাংক চেক',
      description: 'ইলাই ডাচ-বাংলা ব্যাংক চেক #48920',
      created_by: 'usr-officer-1',
      created_at: '2026-07-10T10:35:00Z'
    },
    {
      id: 'pay-2',
      dealer_id: 'dlr-2',
      amount: 20000,
      payment_date: '2026-07-18',
      payment_method: 'নগদ ক্যাশ',
      description: 'অফিসার সংগ্রহ চালান জমা',
      created_by: 'usr-officer-1',
      created_at: '2026-07-18T14:20:00Z'
    }
  ],
  expenses: [
    {
      id: 'exp-1',
      category: 'পরিবহন ও যাতায়াত খরচ',
      amount: 4500,
      description: 'গাজীপুর গোডাউন থেকে শেরপুর ট্রাক ভাড়া',
      expense_date: '2026-07-12',
      created_by: 'usr-admin-1',
      created_at: '2026-07-12T00:00:00Z'
    },
    {
      id: 'exp-2',
      category: 'অফিস প্রসাধন ও বিদ্যুৎ',
      amount: 8200,
      description: 'জুলাই মাসের হেড অফিস বিদ্যুৎ বিল',
      expense_date: '2026-07-20',
      created_by: 'usr-admin-1',
      created_at: '2026-07-20T00:00:00Z'
    }
  ],
  stock_movements: [
    {
      id: 'mov-1',
      product_id: 'prod-1',
      godown_id: 'god-1',
      type: 'in',
      quantity: 500,
      reference_id: 'prod-run-1',
      created_at: '2026-02-05T00:00:00Z'
    },
    {
      id: 'mov-2',
      product_id: 'prod-1',
      godown_id: 'god-1',
      type: 'out',
      quantity: 200,
      reference_id: 'sale-101',
      created_at: '2026-07-10T00:00:00Z'
    }
  ],
  employees: [
    { id: 'emp-1', name: 'মোঃ রফিকুল ইসলাম', designation: 'এরিয়া সেলস ম্যানেজার', mobile: '01711223344', joining_date: '2024-03-01', salary: 45000, status: 'active', created_at: '2026-01-01T00:00:00Z' },
    { id: 'emp-2', name: 'সাবিনা ইয়াসমিন', designation: 'অ্যাকাউন্টস এক্সিকিউটিভ', mobile: '01811334455', joining_date: '2025-01-15', salary: 32000, status: 'active', created_at: '2026-01-01T00:00:00Z' }
  ]
};

export function getLocalDB() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
}

export function saveLocalDB(data: any) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // Dispatch custom event to sync components across the app
  window.dispatchEvent(new Event('ph_vision_db_updated'));
}

export function resetLocalDB() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
  window.dispatchEvent(new Event('ph_vision_db_updated'));
}
