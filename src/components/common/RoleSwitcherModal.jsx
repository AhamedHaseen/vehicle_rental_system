import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { ShieldCheck, UserCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const RoleSwitcherModal = ({ isOpen, onClose }) => {
  const { user, role, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleSwitch = (newRole) => {
    loginAsDemo(newRole);
    onClose();
    if (newRole === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/catalog');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rapid Role Switcher"
      subtitle="Instantly preview the interface from either the Customer or Admin perspective."
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Customer Card */}
        <div
          onClick={() => handleSwitch('customer')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            role === 'customer'
              ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Customer Role
                  {role === 'customer' && (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Kamal Perera (kamal@example.com)</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 mt-1" />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
            Access fleet catalog, submit bookings, pay deposits, view rental history and write reviews.
          </p>
        </div>

        {/* Admin Card */}
        <div
          onClick={() => handleSwitch('admin')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            role === 'admin'
              ? 'bg-purple-500/10 border-purple-500/50 shadow-md shadow-purple-500/10'
              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Admin Command Center
                  {role === 'admin' && (
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Fleet Director Alex (admin@rentflow.com)</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 mt-1" />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
            Full executive access: Fleet inventory CRUD, booking approvals, vehicle handover/return inspections, revenue analytics, and reports.
          </p>
        </div>

        <div className="pt-2 text-center">
          <Button variant="ghost" size="sm" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
