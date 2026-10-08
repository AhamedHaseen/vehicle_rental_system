import React, { useState, useEffect, useMemo } from 'react';
import { 
  getVehicles, saveVehicle, deleteVehicle, updateVehicleStatus 
} from '../../services/dataService';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { VehicleFormModal } from '../../components/admin/VehicleFormModal';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { 
  Car, Plus, Search, Edit3, Trash2, Fuel, Gauge, 
  MapPin, CheckCircle2, AlertTriangle, RefreshCw 
} from 'lucide-react';

const CATEGORIES = ['All', 'Car', 'SUV', 'Luxury Vehicle', 'Van', 'Motorbike', 'Three-Wheeler'];
const STATUSES = ['All', 'available', 'rented', 'maintenance', 'deactivated'];

export const AdminFleet = () => {
  const { formatPrice } = useCurrency();
  const { success, error } = useToast();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteConfirmVehicle, setDeleteConfirmVehicle] = useState(null);

  const loadFleet = async () => {
    setLoading(true);
    const list = await getVehicles();
    setVehicles(list);
    setLoading(false);
  };

  useEffect(() => {
    loadFleet();
  }, []);

  const handleStatusChange = async (vehicleId, newStatus) => {
    try {
      updateVehicleStatus(vehicleId, newStatus);
      success('Status Updated', `Vehicle status changed to ${newStatus.toUpperCase()}`);
      loadFleet();
    } catch (err) {
      error('Failed to change status', err.message);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!deleteConfirmVehicle) return;
    try {
      await deleteVehicle(deleteConfirmVehicle.id);
      success('Vehicle Deleted', `${deleteConfirmVehicle.brand} ${deleteConfirmVehicle.model} removed from fleet.`);
      setDeleteConfirmVehicle(null);
      loadFleet();
    } catch (err) {
      error('Delete Failed', err.message);
    }
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const match = 
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.registration_no.toLowerCase().includes(q) ||
          v.vehicle_code?.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (categoryFilter !== 'All' && v.category !== categoryFilter) return false;
      if (statusFilter !== 'All' && v.status !== statusFilter) return false;
      return true;
    });
  }, [vehicles, search, categoryFilter, statusFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Fleet Vehicle Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Maintain vehicle specifications, daily rental pricing, live condition and station allocation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadFleet}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsAddOpen(true)}>
            Add New Vehicle
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Brand, Model, Reg No..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 shrink-0">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 capitalize"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Reg No & Category</th>
                <th className="py-3 px-4">Engine / Specs</th>
                <th className="py-3 px-4">Rental Rates</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredVehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-900/40 transition-colors">
                  {/* Vehicle Media & Title */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={v.image_url}
                        alt={v.model}
                        className="w-16 h-11 object-cover rounded-lg border border-slate-700/60 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm">
                          {v.brand} {v.model}
                        </h4>
                        <span className="text-slate-400 text-[11px] block">{v.year} Model</span>
                      </div>
                    </div>
                  </td>

                  {/* Reg No & Category */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-amber-500/20 block w-fit">
                      {v.registration_no}
                    </span>
                    <span className="text-slate-400 text-[11px] block mt-1 uppercase font-semibold">
                      {v.category}
                    </span>
                  </td>

                  {/* Specs */}
                  <td className="py-3.5 px-4 text-slate-300">
                    <div className="space-y-0.5 text-[11px]">
                      <span>{v.seats} Seats • {v.fuel_type}</span>
                      <span className="text-slate-400 block">{v.transmission}</span>
                    </div>
                  </td>

                  {/* Pricing */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-100 block">
                      {formatPrice(v.price_per_day)}/day
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Deposit: {formatPrice(v.security_deposit || 20000)}
                    </span>
                  </td>

                  {/* Status & Quick Toggle */}
                  <td className="py-3.5 px-4">
                    <select
                      value={v.status}
                      onChange={(e) => handleStatusChange(v.id, e.target.value)}
                      className={`text-xs font-semibold rounded-lg px-2 py-1 border focus:outline-none capitalize ${
                        v.status === 'available'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : v.status === 'rented'
                          ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                          : v.status === 'maintenance'
                          ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      <option value="available" className="bg-slate-900 text-slate-200">Available</option>
                      <option value="rented" className="bg-slate-900 text-slate-200">Rented Out</option>
                      <option value="maintenance" className="bg-slate-900 text-slate-200">Maintenance</option>
                      <option value="deactivated" className="bg-slate-900 text-slate-200">Deactivated</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit3}
                        onClick={() => setEditingVehicle(v)}
                      >
                        Edit
                      </Button>
                      <button
                        onClick={() => setDeleteConfirmVehicle(v)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete vehicle"
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

      {/* Add / Edit Vehicle Modal */}
      {(isAddOpen || editingVehicle) && (
        <VehicleFormModal
          isOpen={isAddOpen || Boolean(editingVehicle)}
          onClose={() => {
            setIsAddOpen(false);
            setEditingVehicle(null);
          }}
          vehicle={editingVehicle}
          onSaveSuccess={loadFleet}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmVehicle && (
        <Modal
          isOpen={Boolean(deleteConfirmVehicle)}
          onClose={() => setDeleteConfirmVehicle(null)}
          title="Delete Fleet Vehicle"
          subtitle={`Are you sure you want to remove ${deleteConfirmVehicle.brand} ${deleteConfirmVehicle.model}?`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs text-slate-300">
            <p className="leading-relaxed">
              This action will permanently delete vehicle <strong className="text-slate-100">{deleteConfirmVehicle.registration_no}</strong> from the database and active fleet inventory.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmVehicle(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteVehicle}>
                Yes, Delete Vehicle
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
