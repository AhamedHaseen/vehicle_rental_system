import React, { useState, useEffect } from 'react';
import { getCustomers, updateCustomerStatus, getBookings } from '../../services/dataService';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { Users, Search, ShieldCheck, ShieldAlert, Phone, Mail, FileText, RefreshCw } from 'lucide-react';

export const AdminCustomers = () => {
  const { formatPrice } = useCurrency();
  const { success, error } = useToast();

  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const [cList, bList] = await Promise.all([getCustomers(), getBookings()]);
    setCustomers(cList);
    setBookings(bList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (customer) => {
    const newStatus = customer.status === 'active' ? 'suspended' : 'active';
    try {
      await updateCustomerStatus(customer.id, newStatus);
      success('Customer Status Updated', `Account marked as ${newStatus.toUpperCase()}`);
      loadData();
    } catch (err) {
      error('Failed to update status', err.message);
    }
  };

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Customer Directory & CRM
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Manage verified client accounts, KYC documents, rental records, and lifetime value.
          </p>
        </div>

        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadData}>
          Refresh Customers
        </Button>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 flex items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer by name, email, phone..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <span className="text-slate-600 dark:text-slate-400">Total Registered Customers: <strong className="text-slate-900 dark:text-slate-100">{customers.length}</strong></span>
      </div>

      {/* Customers Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">KYC / Identity</th>
                <th className="py-3 px-4">Rental History</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {filtered.map((c) => {
                const customerBookings = bookings.filter(b => b.customer_id === c.id || b.customer_email === c.email);
                const totalSpent = customerBookings.reduce((sum, b) => b.payment_status === 'paid' ? sum + Number(b.total_amount || 0) : sum, c.total_spent || 0);

                return (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${c.full_name}`}
                          alt={c.full_name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{c.full_name}</h4>
                          <span className="text-[11px] text-slate-500">Joined: {c.joined_date || '2024'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      <div className="space-y-0.5">
                        <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {c.email}</p>
                        <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {c.phone || '+94 77 123 4567'}</p>
                      </div>
                    </td>

                    {/* KYC */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      <div className="space-y-0.5 font-mono text-[11px]">
                        <span className="block text-slate-600 dark:text-slate-400">License: {c.driving_license_no || 'Verified'}</span>
                        <span className="block text-slate-500">NIC: {c.id_card_no || 'Verified'}</span>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-slate-200 block">{customerBookings.length || c.total_rentals || 1} Rentals</span>
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-bold text-[11px] block">{formatPrice(totalSpent)}</span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <Badge status={c.status || 'active'} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCustomer({ ...c, bookings: customerBookings, totalSpent })}
                        >
                          History
                        </Button>
                        <Button
                          variant={c.status === 'suspended' ? 'emerald' : 'danger'}
                          size="sm"
                          onClick={() => handleToggleStatus(c)}
                        >
                          {c.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer History Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={Boolean(selectedCustomer)}
          onClose={() => setSelectedCustomer(null)}
          title={`Customer Record: ${selectedCustomer.full_name}`}
          subtitle={`Verified customer profile and rental timeline.`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-5 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{selectedCustomer.full_name}</h4>
                <p className="text-slate-600 dark:text-slate-400">{selectedCustomer.email} • {selectedCustomer.phone}</p>
                <p className="text-slate-500 mt-1 font-mono">License No: {selectedCustomer.driving_license_no || 'Verified'}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block">Lifetime Value</span>
                <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-base">{formatPrice(selectedCustomer.totalSpent)}</span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">Reservation History</h5>
              {selectedCustomer.bookings?.length === 0 ? (
                <p className="text-slate-500 italic py-2">No completed reservations yet.</p>
              ) : (
                <div className="space-y-2">
                  {selectedCustomer.bookings.map((b) => (
                    <div key={b.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{b.booking_code}</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{b.vehicle_name}</p>
                        <span className="text-[10px] text-slate-500">{new Date(b.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right">
                        <Badge status={b.booking_status} />
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block mt-1">{formatPrice(b.total_amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button variant="primary" size="sm" onClick={() => setSelectedCustomer(null)} className="w-full">
              Close Profile
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
