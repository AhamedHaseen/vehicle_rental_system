import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { saveCategory } from '../../services/dataService';
import { useToast } from '../../context/ToastContext';
import { 
  Car, Shield, Sparkles, Clock, Gauge, MapPin 
} from 'lucide-react';

const ICON_OPTIONS = [
  { id: 'Car', label: 'Car / Bus / Coach', icon: Car },
  { id: 'Shield', label: 'Shield / 4x4 SUV', icon: Shield },
  { id: 'Sparkles', label: 'Sparkles / Luxury VIP', icon: Sparkles },
  { id: 'Clock', label: 'Clock / Van Touring', icon: Clock },
  { id: 'Gauge', label: 'Gauge / Motorbike', icon: Gauge },
  { id: 'MapPin', label: 'MapPin / Island Tuk', icon: MapPin }
];

export const CategoryFormModal = ({ isOpen, onClose, category, onSaveSuccess }) => {
  const { success, error } = useToast();
  const isEditing = Boolean(category);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [seatsDefault, setSeatsDefault] = useState(5);
  const [icon, setIcon] = useState('Car');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name || '');
        setDescription(category.description || '');
        setSeatsDefault(category.seats_default || 5);
        setIcon(category.icon || category.icon_name || 'Car');
      } else {
        setName('');
        setDescription('');
        setSeatsDefault(5);
        setIcon('Car');
      }
    }
  }, [isOpen, category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Name required', 'Please specify category name (e.g., Bus, Car, SUV)');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveCategory({
        ...(category ? { id: category.id } : {}),
        name: name.trim(),
        description: description.trim(),
        seats_default: Number(seatsDefault) || 5,
        icon
      });

      success(
        isEditing ? 'Category Updated' : 'Category Added',
        `Category "${name}" is now saved and active in the system.`
      );
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      error('Save failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Category: ${category.name}` : "Add New Vehicle Category"}
      subtitle="Configure classification name, passenger seat capacity, and representative icon."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
            Category Name * (e.g. Car, Bus, Van, SUV)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bus, Compact Lorry, Convertible"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-bold text-sm focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
            required
          />
        </div>

        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
            Typical Seat Capacity
          </label>
          <input
            type="number"
            min="1"
            max="80"
            value={seatsDefault}
            onChange={(e) => setSeatsDefault(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
          />
        </div>

        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
            Select Representative Icon
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ICON_OPTIONS.map((item) => {
              const IconComp = item.icon;
              const isSelected = icon === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setIcon(item.id)}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#0373b9] bg-[#0373b9]/10 text-[#0373b9] dark:text-[#38bdf8] ring-1 ring-[#0373b9]'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <IconComp className="w-5 h-5" />
                  <span className="text-[10px] font-semibold truncate w-full">{item.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
            Overview Description
          </label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Highway tourist coach buses with dual luggage compartments..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0373b9]"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" isLoading={isSubmitting} className="bg-[#0373b9] hover:bg-[#025a92] text-white">
            {isEditing ? 'Update Category' : 'Save Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
