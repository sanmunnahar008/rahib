import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Map,
  UserCheck,
  Users,
  Store,
  Package,
  FolderTree,
  Boxes,
  Truck,
  ShoppingCart,
  Factory,
  Warehouse,
  BarChart3,
  Receipt,
  Wallet,
  DollarSign,
  PieChart,
  BadgeAlert,
  UserCog,
  Building2,
  FileText
} from 'lucide-react';

import companyLogoImg from '../../assets/images/company_logo_1784943601071.jpg';
import iconDashboardImg from '../../assets/images/icon_dashboard_1784943613028.jpg';
import iconDealersImg from '../../assets/images/icon_dealers_1784943632953.jpg';
import iconProductsImg from '../../assets/images/icon_products_1784943644909.jpg';

interface GlossyIconProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const GlossyIcon: React.FC<GlossyIconProps> = ({ name, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const imgSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  // Dedicated generated PNG assets
  if (name === 'logo' && companyLogoImg) {
    return (
      <img
        src={companyLogoImg}
        alt="PH Vision Logo"
        referrerPolicy="no-referrer"
        className={`${imgSizeClasses[size]} rounded-lg object-cover shadow-md ring-2 ring-emerald-500/30 ${className}`}
      />
    );
  }

  if (name === 'dashboard' && iconDashboardImg) {
    return (
      <img
        src={iconDashboardImg}
        alt="Dashboard"
        referrerPolicy="no-referrer"
        className={`${imgSizeClasses[size]} rounded-lg object-cover shadow-sm ${className}`}
      />
    );
  }

  if (name === 'dealers' && iconDealersImg) {
    return (
      <img
        src={iconDealersImg}
        alt="Dealers"
        referrerPolicy="no-referrer"
        className={`${imgSizeClasses[size]} rounded-lg object-cover shadow-sm ${className}`}
      />
    );
  }

  if (name === 'products' && iconProductsImg) {
    return (
      <img
        src={iconProductsImg}
        alt="Products"
        referrerPolicy="no-referrer"
        className={`${imgSizeClasses[size]} rounded-lg object-cover shadow-sm ${className}`}
      />
    );
  }

  // Glossy 3D styled icons with unique gradient themes, light reflections & shadow contours for all other items
  const iconConfigs: Record<string, { icon: any; bg: string; text: string; shadow: string }> = {
    areas: { icon: MapPin, bg: 'from-emerald-400 via-emerald-500 to-teal-700', text: 'text-white', shadow: 'shadow-emerald-500/30' },
    territories: { icon: Map, bg: 'from-teal-400 via-cyan-500 to-blue-700', text: 'text-white', shadow: 'shadow-teal-500/30' },
    officers: { icon: UserCheck, bg: 'from-blue-400 via-indigo-500 to-indigo-800', text: 'text-white', shadow: 'shadow-indigo-500/30' },
    employees: { icon: Users, bg: 'from-violet-400 via-purple-500 to-purple-800', text: 'text-white', shadow: 'shadow-purple-500/30' },
    categories: { icon: FolderTree, bg: 'from-amber-400 via-orange-500 to-red-600', text: 'text-white', shadow: 'shadow-amber-500/30' },
    rawMaterials: { icon: Boxes, bg: 'from-lime-400 via-green-500 to-emerald-800', text: 'text-white', shadow: 'shadow-green-500/30' },
    suppliers: { icon: Truck, bg: 'from-sky-400 via-blue-500 to-slate-700', text: 'text-white', shadow: 'shadow-sky-500/30' },
    purchases: { icon: ShoppingCart, bg: 'from-rose-400 via-pink-500 to-rose-700', text: 'text-white', shadow: 'shadow-rose-500/30' },
    production: { icon: Factory, bg: 'from-amber-500 via-yellow-600 to-orange-800', text: 'text-white', shadow: 'shadow-amber-600/30' },
    godowns: { icon: Warehouse, bg: 'from-cyan-400 via-blue-600 to-slate-800', text: 'text-white', shadow: 'shadow-cyan-500/30' },
    stock: { icon: BarChart3, bg: 'from-emerald-500 via-green-600 to-teal-900', text: 'text-white', shadow: 'shadow-emerald-600/30' },
    sales: { icon: Receipt, bg: 'from-indigo-400 via-blue-600 to-indigo-900', text: 'text-white', shadow: 'shadow-indigo-600/30' },
    accounts: { icon: Wallet, bg: 'from-green-400 via-emerald-600 to-emerald-900', text: 'text-white', shadow: 'shadow-emerald-600/30' },
    expenses: { icon: DollarSign, bg: 'from-red-400 via-rose-600 to-red-900', text: 'text-white', shadow: 'shadow-rose-600/30' },
    areaReports: { icon: PieChart, bg: 'from-fuchsia-400 via-purple-600 to-indigo-900', text: 'text-white', shadow: 'shadow-purple-600/30' },
    reports: { icon: FileText, bg: 'from-blue-400 via-indigo-600 to-slate-900', text: 'text-white', shadow: 'shadow-blue-600/30' },
    users: { icon: UserCog, bg: 'from-slate-500 via-gray-700 to-slate-900', text: 'text-white', shadow: 'shadow-slate-600/30' },
    alerts: { icon: BadgeAlert, bg: 'from-red-500 via-amber-500 to-orange-600', text: 'text-white', shadow: 'shadow-red-500/30' }
  };

  const config = iconConfigs[name] || {
    icon: Building2,
    bg: 'from-emerald-400 to-teal-600',
    text: 'text-white',
    shadow: 'shadow-emerald-500/30'
  };

  const IconComp = config.icon;

  return (
    <div
      className={`relative flex items-center justify-center rounded-lg bg-gradient-to-br ${config.bg} ${config.text} ${sizeClasses[size]} ${config.shadow} shadow-md overflow-hidden ring-1 ring-white/30 transform transition-transform duration-200 hover:scale-105 ${className}`}
    >
      {/* 3D Glossy specular light effect overlay */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2/3 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      <IconComp className="relative z-10 w-4 h-4 drop-shadow-sm" />
    </div>
  );
};
