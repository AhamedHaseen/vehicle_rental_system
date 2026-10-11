import { useState, useEffect } from 'react';
import { 
  getCategories, saveCategory, deleteCategory, getVehicles 
} from '../../services/dataService';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { CategoryFormModal } from '../../components/admin/CategoryFormModal';
import { useToast } from '../../context/ToastContext';
import { 
  FolderKanban, Plus, Edit3, Trash2, Car, 
  Shield, Sparkles, Clock, Gauge, MapPin, 
  Search, RefreshCw, CheckCircle2 
} from 'lucide-react';

const ICON_OPTIONS = [
  { id: 'Car', label: 'Car / Bus / Coach', icon: Car },
  { id: 'Shield', label: 'Shield / Heavy 4x4', icon: Shield },
  { id: 'Sparkles', label: 'Sparkles / Luxury VIP', icon: Sparkles },
  { id: 'Clock', label: 'Clock / Van Touring', icon: Clock },
  { id: 'Gauge', label: 'Speedometer / Motorbike', icon: Gauge },
  { id: 'MapPin', label: 'Location / Island Tuk', icon: MapPin }
];

export const AdminCategories = () => {
  const { success, error } = useToast();
  const [categories, setCategories] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catSeats, setCatSeats] = useState(5);
  const [catIcon, setCatIcon] = useState('Car');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cList, vList] = await Promise.all([
        getCategories(),
        getVehicles()
      ]);
      setCategories(cList || []);
      setVehicles(vList || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDesc('');
    setCatSeats(5);
    setCatIcon('Car');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setCatName(cat.name || '');
    setCatDesc(cat.description || '');
    setCatSeats(cat.seats_default || 5);
    setCatIcon(cat.icon || 'Car');
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      error('Name required', 'Please specify category name (e.g., Bus, Car, SUV)');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveCategory({
        ...(editingCategory ? { id: editingCategory.id } : {}),
        name: catName.trim(),
        description: catDesc.trim(),
        seats_default: Number(catSeats) || 5,
        icon: catIcon
      });

      success(editingCategory ? 'Category Updated' : 'Category Added', `Category "${catName}" is now active in fleet selector.`);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      error('Save failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id);
      success('Category Deleted', `Category "${deleteTarget.name}" removed.`);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      error('Delete failed', err.message);
    }
  };

  const filteredCategories = categories.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <FolderKanban className="w-7 h-7 text-[#0373b9] dark:text-[#38bdf8]" />
            <span>Vehicle Categories Management</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Configure available vehicle classifications (Car, Bus, Van, SUV, etc.) and fleet capacity tags.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={loadData}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={openAddModal}
          >
            Add New Category
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories (e.g. Bus, Car, Van)..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
          />
        </div>

        <span className="text-xs font-bold text-slate-500">
          Total Categories: <strong className="text-[#0373b9] dark:text-[#38bdf8]">{categories.length}</strong>
        </span>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.map((cat) => {
          const fleetCount = vehicles.filter(v => v.category === cat.name).length;

          return (
            <div
              key={cat.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm hover:shadow-md hover:border-[#0373b9]/50 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-[#0373b9]/10 text-[#0373b9] dark:text-[#38bdf8] flex items-center justify-center font-bold">
                    <Car className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {fleetCount} {fleetCount === 1 ? 'Vehicle' : 'Vehicles'}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed min-h-[2.5rem]">
                  {cat.description || 'Standard vehicle category assigned in fleet directory.'}
                </p>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span>Default Passenger Seats</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {cat.seats_default || 5} Seats
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Edit3}
                  onClick={() => openEditModal(cat)}
                >
                  Edit
                </Button>
                <button
                  onClick={() => setDeleteTarget(cat)}
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <CategoryFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCategory(null);
          }}
          category={editingCategory}
          onSaveSuccess={loadData}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title={`Delete Category: ${deleteTarget.name}?`}
          subtitle="Are you sure you want to remove this category? Existing fleet vehicles will remain in database."
          maxWidth="max-w-sm"
        >
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" onClick={handleDeleteCategory}>
              Yes, Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
