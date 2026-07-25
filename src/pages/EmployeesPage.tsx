import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { Employee } from '../types/database';
import { getLocalDB, saveLocalDB } from '../lib/supabase';
import { formatBnCurrency, formatBnDate } from '../lib/format';
import { toast } from 'sonner';
import { Users, Plus, Edit2, Trash2, Phone, X } from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  usePageMeta({
    title: 'স্টাফ ও পে-রোল',
    description: 'কারখানা শ্রমিক, অফিস স্টাফ ও কর্মকর্তা বেতন তালিকা'
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [mobile, setMobile] = useState('');
  const [salary, setSalary] = useState<number | ''>('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = () => {
    const db = getLocalDB();
    setEmployees(db.employees || []);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ph_vision_db_updated', loadData);
    return () => window.removeEventListener('ph_vision_db_updated', loadData);
  }, []);

  const openAddModal = () => {
    setEditingEmployee(null);
    setName('');
    setDesignation('কারখানা অপারেটর');
    setMobile('');
    setSalary(15000);
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setDesignation(emp.designation);
    setMobile(emp.mobile);
    setSalary(emp.salary);
    setJoiningDate(emp.joining_date);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('কর্মচারীর নাম দিন');
      return;
    }

    const db = getLocalDB();
    if (editingEmployee) {
      db.employees = db.employees.map((emp: Employee) =>
        emp.id === editingEmployee.id
          ? {
              ...emp,
              name,
              designation,
              mobile,
              salary: Number(salary || 0),
              joining_date: joiningDate
            }
          : emp
      );
      toast.success('কর্মচারী তথ্য আপডেট করা হয়েছে');
    } else {
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        name,
        designation,
        mobile,
        salary: Number(salary || 0),
        joining_date: joiningDate,
        created_at: new Date().toISOString()
      };
      db.employees.push(newEmp);
      toast.success('নতুন কর্মচারী নিবন্ধিত হয়েছে');
    }

    saveLocalDB(db);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, empName: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${empName}" কে মুছে ফেলতে চান?`)) {
      const db = getLocalDB();
      db.employees = db.employees.filter((emp: Employee) => emp.id !== id);
      saveLocalDB(db);
      toast.success('কর্মচারী তালিকা থেকে মুছে ফেলা হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="কর্মচারী ও বেতন রেজিস্টার"
        subtitle="PH VISION LTD কারখানার শ্রমিক, সুপারভাইজর ও প্রশাসনিক কর্মকর্তাদের তথ্য"
        action={
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন কর্মচারী যোগ
          </button>
        }
      />

      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
                <th className="py-3 px-4">কর্মচারীর নাম</th>
                <th className="py-3 px-4">পদবী</th>
                <th className="py-3 px-4">মোবাইল নম্বর</th>
                <th className="py-3 px-4">যোগদানের তারিখ</th>
                <th className="py-3 px-4 text-right">মাসিক বেতন (৳)</th>
                <th className="py-3 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-foreground">{emp.name}</td>
                  <td className="py-3 px-4 font-semibold text-primary">{emp.designation}</td>
                  <td className="py-3 px-4 text-muted-foreground">{emp.mobile || 'N/A'}</td>
                  <td className="py-3 px-4 text-muted-foreground">{formatBnDate(emp.joining_date)}</td>
                  <td className="py-3 px-4 text-right font-black text-foreground">{formatBnCurrency(emp.salary)}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openEditModal(emp)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        aria-label="সম্পাদনা করুন"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id, emp.name)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        aria-label="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-sm">
                {editingEmployee ? 'কর্মচারী তথ্য সম্পাদনা' : 'নতুন কর্মচারী যোগ'}
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
                <label className="block text-xs font-semibold text-foreground mb-1">কর্মচারীর নাম *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: শফিকুল ইসলাম"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">পদবী</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="কারখানা অপারেটর / কেমিস্ট"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="01800000000"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">মাসিক বেতন (৳)</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value ? Number(e.target.value) : '')}
                    placeholder="20000"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">যোগদানের তারিখ</label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
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
                  সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
