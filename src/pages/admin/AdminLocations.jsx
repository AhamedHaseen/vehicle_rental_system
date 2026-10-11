import { useState, useEffect, useMemo } from 'react';
import { 
  getLocations, deleteLocation 
} from '../../services/dataService';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LocationFormModal } from '../../components/admin/LocationFormModal';
import { useToast } from '../../context/ToastContext';
import { useCurrency } from '../../context/CurrencyContext';
import { 
  MapPin, Plus, Edit3, Trash2, Search, 
  RefreshCw, CheckCircle2, Clock, Phone, 
  Building2, Navigation, DollarSign, ShieldAlert,
  ArrowRightLeft, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'both', label: 'Pickup & Drop', icon: ArrowRightLeft, color: 'emerald' },
  { value: 'pickup', label: 'Pickup Only', icon: ArrowUpRight, color: 'sky' },
  { value: 'drop', label: 'Drop / Return Only', icon: ArrowDownLeft, color: 'amber' }
];

export const AdminLocations = () => {
  const { success, error } = useToast();
  const { formatPrice } = useCurrency();

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getLocations();
      setLocations(list || []);
    } catch (err) {
      error('Failed to load locations', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const openEditModal = (loc) => {
    setEditingLocation(loc);
    setIsModalOpen(true);
  };

  const handleDeleteLocation = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLocation(deleteTarget.id);
      success('Location Deleted', `Hub "${deleteTarget.name}" was removed.`);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      error('Delete failed', err.message);
    }
  };

  // Filtered list
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          loc.name?.toLowerCase().includes(q) ||
          loc.city?.toLowerCase().includes(q) ||
          loc.address?.toLowerCase().includes(q) ||
          loc.code?.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (typeFilter !== 'all' && loc.type !== typeFilter) {
        return false;
      }
      return true;
    });
  }, [locations, search, typeFilter]);

  // Counts
  const totalCount = locations.length;
  const bothCount = locations.filter(l => l.type === 'both').length;
  const pickupCount = locations.filter(l => l.type === 'pickup').length;
  const dropCount = locations.filter(l => l.type === 'drop').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#0373b9]/10 text-[#0373b9] dark:text-[#38bdf8] dark:bg-[#0373b9]/25 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Dispatch Terminals & Hubs
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Pickup & Drop Locations
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Include and manage islandwide vehicle handover hubs, airport terminals, and customer drop-off centers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={loadData}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={openAddModal}
            className="bg-[#0373b9] hover:bg-[#025a92] text-white"
          >
            Add New Hub
          </Button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Hubs</div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{totalCount}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Active transit points</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Pickup & Drop</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{bothCount}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Full dual-service</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          <div className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase">Pickup Only</div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">{pickupCount}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Origin centers</div>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">Drop Only</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{dropCount}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Return bays</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search hub by name, city, code, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-[#0373b9]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">Type:</span>
          {['all', 'both', 'pickup', 'drop'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 capitalize cursor-pointer shrink-0 ${
                typeFilter === t
                  ? 'bg-[#0373b9] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t === 'all' ? 'All Hubs' : t === 'both' ? 'Dual (Both)' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Locations Grid */}
      {filteredLocations.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
          <MapPin className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No Locations Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-5">
            {search ? 'No terminals match your search filter.' : 'No pickup and drop locations are configured yet.'}
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={openAddModal}
            className="bg-[#0373b9] hover:bg-[#025a92] text-white"
          >
            Add Your First Location
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLocations.map((loc) => {
            const isBoth = loc.type === 'both' || !loc.type;
            const isPickup = loc.type === 'pickup';
            const isDrop = loc.type === 'drop';

            return (
              <div
                key={loc.id}
                className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-[#0373b9] dark:hover:border-[#38bdf8] hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Code, Type Badge & Actions */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {loc.code || 'HUB'}
                      </span>
                      {isBoth && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <ArrowRightLeft className="w-3 h-3" /> Pickup & Drop
                        </span>
                      )}
                      {isPickup && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-400 flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3" /> Pickup Only
                        </span>
                      )}
                      {isDrop && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          <ArrowDownLeft className="w-3 h-3" /> Drop Only
                        </span>
                      )}
                      {loc.is_active === false && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(loc)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0373b9] dark:text-slate-400 dark:hover:text-[#38bdf8] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Location"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(loc)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete Location"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Hub Name & City */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 group-hover:text-[#0373b9] dark:group-hover:text-[#38bdf8] transition-colors">
                    <MapPin className="w-4 h-4 text-[#0373b9] dark:text-[#38bdf8] shrink-0" />
                    <span className="truncate">{loc.name}</span>
                  </h3>

                  {/* Address */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    {loc.address}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">City / District:</span>
                      <span className="text-slate-900 dark:text-slate-100 font-bold">{loc.city}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">Hours:</span>
                      <span>{loc.operating_hours || '24/7 Service'}</span>
                    </div>

                    {loc.contact_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">Tel:</span>
                        <span>{loc.contact_number}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Surcharge / Fee Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Transfer Surcharge:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {Number(loc.extra_fee) > 0 ? formatPrice(loc.extra_fee) : 'Free / Standard'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Location Modal */}
      {isModalOpen && (
        <LocationFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingLocation(null);
          }}
          location={editingLocation}
          onSaveSuccess={loadData}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Confirm Location Deletion"
          subtitle="This action will remove this pickup/drop hub from all booking forms."
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 dark:text-rose-200">
                Are you sure you want to delete <strong className="font-bold">{deleteTarget?.name}</strong>? 
                Customers will no longer be able to select this terminal for vehicle pickup or return.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteLocation}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete Location
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
