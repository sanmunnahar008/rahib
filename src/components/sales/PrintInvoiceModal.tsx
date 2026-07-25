import React from 'react';
import { Sale, Dealer } from '../../types/database';
import { formatBnCurrency, formatBnDate, formatBnNumber } from '../../lib/format';
import { Printer, X } from 'lucide-react';
import companyLogoImg from '../../assets/images/company_logo_1784943601071.jpg';

interface PrintInvoiceModalProps {
  sale: Sale;
  dealer?: Dealer;
  onClose: () => void;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({ sale, dealer, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden my-8 border border-slate-200">
        {/* Modal Controls (No Print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-100 border-b border-slate-200">
          <h3 className="font-bold text-slate-800 text-lg">মেমো / ইনভয়েস প্রিন্ট প্রিভিউ</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm"
            >
              <Printer className="w-4 h-4" />
              প্রিন্ট করুন (A4)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
              aria-label="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable A4 Content */}
        <div className="p-8 sm:p-10 bg-white font-sans text-slate-800 print:p-6" id="printable-invoice">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-emerald-600 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <img
                src={companyLogoImg}
                alt="PH Vision Logo"
                className="w-16 h-16 object-cover rounded-lg border border-emerald-200"
              />
              <div>
                <h1 className="text-2xl font-black text-emerald-800 tracking-tight">PH VISION LTD</h1>
                <p className="text-xs font-semibold text-slate-600">পিএইচ ভিশন লিমিটেড — অ্যাগ্রো কেমিক্যালস বিডি</p>
                <p className="text-xs text-slate-500 mt-0.5">হেড অফিস: জয়দেবপুর রোড, গাজীপুর সদর, ঢাকা</p>
                <p className="text-xs text-slate-500">হটলাইন: +৮৮০ ৯৬১১-৮৮৯৯০০ | ইমেইল: info@phvision.com</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-sm rounded-md mb-2">
                বিক্রয় চালান / ক্যাশ মেমো
              </span>
              <p className="text-xs font-bold text-slate-700">চালান নং: <span className="font-mono text-sm text-emerald-700">{sale.invoice_no}</span></p>
              <p className="text-xs text-slate-600 mt-1">তারিখ: {formatBnDate(sale.sale_date)}</p>
            </div>
          </div>

          {/* Dealer & Memo Info Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
            <div>
              <h4 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 text-sm">ডিলারের বিবরণ:</h4>
              <p className="font-bold text-slate-800 text-sm">{dealer?.name || sale.dealer_name || 'সাধারণ ডিলার'}</p>
              <p className="text-slate-600 mt-0.5"><span className="font-semibold">ডিলার কোড:</span> {dealer?.dealer_code || 'N/A'}</p>
              <p className="text-slate-600"><span className="font-semibold">মোবাইল:</span> {dealer?.mobile || 'N/A'}</p>
              <p className="text-slate-600"><span className="font-semibold">ঠিকানা:</span> {dealer?.address || 'N/A'}</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 text-sm">চালানের বিস্তারিত:</h4>
              <p className="text-slate-600"><span className="font-semibold">ইস্যুকারী কর্মকর্তা:</span> {sale.created_by_name || 'সেলস অফিসার'}</p>
              <p className="text-slate-600"><span className="font-semibold">টেরিটরি:</span> {dealer?.territory_name || 'N/A'}</p>
              <p className="text-slate-600"><span className="font-semibold">পেমেন্ট স্ট্যাটাস:</span> {sale.due_amount <= 0 ? 'পরিশোধিত' : 'আংশিক বকেয়া'}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-xs text-left border-collapse mb-6">
            <thead>
              <tr className="bg-emerald-800 text-white font-bold text-center">
                <th className="p-2 border border-emerald-800 w-12">ক্র.নং</th>
                <th className="p-2 border border-emerald-800 text-left">পণ্যের বিবরণ</th>
                <th className="p-2 border border-emerald-800 w-16">একক</th>
                <th className="p-2 border border-emerald-800 w-20">পরিমাণ</th>
                <th className="p-2 border border-emerald-800 w-24 text-right">একক মূল্য</th>
                <th className="p-2 border border-emerald-800 w-28 text-right">মোট (টাকা)</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, index) => (
                <tr key={index} className="border-b border-slate-200 hover:bg-slate-50 text-center">
                  <td className="p-2 border border-slate-200">{index + 1}</td>
                  <td className="p-2 border border-slate-200 text-left font-semibold text-slate-800">{item.name}</td>
                  <td className="p-2 border border-slate-200">{item.unit}</td>
                  <td className="p-2 border border-slate-200 font-bold">{formatBnNumber(item.quantity)}</td>
                  <td className="p-2 border border-slate-200 text-right">{formatBnCurrency(item.unit_price)}</td>
                  <td className="p-2 border border-slate-200 text-right font-bold text-slate-900">{formatBnCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total & Due Calculation Block */}
          <div className="flex justify-between items-start mb-12">
            <div className="w-1/2 pr-4 text-xs text-slate-600">
              <p className="font-bold text-slate-800 mb-1">শর্তাবলী ও নির্দেশিকা:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>পণ্য গ্রহণের পূর্বে বোতলের সীল ও গুণমান যাচাই করুন।</li>
                <li>বিক্রিত পণ্য ফেরত নেওয়া হয় না।</li>
                <li>যেকোনো অভিযোগের জন্য চালান প্রাপ্তির ৭ দিনের মধ্যে যোগাযোগ করুন।</li>
              </ul>
            </div>
            <div className="w-5/12 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>সর্বমোট পণ্যের মূল্য:</span>
                <span className="font-semibold">{formatBnCurrency(sale.total_amount + (sale.discount || 0))}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>বিশেষ ছাড়/ডিসকাউন্ট:</span>
                  <span className="font-semibold">- {formatBnCurrency(sale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1 text-sm">
                <span>নিট বিক্রয় মূল্য:</span>
                <span>{formatBnCurrency(sale.total_amount)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>জমা/নগদ প্রদান:</span>
                <span>{formatBnCurrency(sale.paid_amount)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-rose-700 border-t border-slate-300 pt-1 text-sm">
                <span>অবশিষ্ট বকেয়া (Due):</span>
                <span>{formatBnCurrency(sale.due_amount)}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-8 pt-12 text-center text-xs text-slate-600">
            <div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">গ্রহীতা / ডিলারের স্বাক্ষর</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">যাচাইকারী কর্মকর্তার স্বাক্ষর</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-extrabold text-emerald-800">পিএইচ ভিশন অনুমোদিত স্বাক্ষর</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
