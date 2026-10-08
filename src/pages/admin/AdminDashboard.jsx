import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, Users, CalendarClock, DollarSign, Clock, ShieldCheck, 
  ArrowUpRight, AlertCircle, CheckCircle2, ChevronRight, Plus, RefreshCw, Eye
} from 'lucide-react';
import { 
  getVehicles, getBookings, getCustomers, updateBookingStatus 
} from '../../services/dataService';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PickupModal } from '../../components/admin/PickupModal';
import { ReturnModal } from '../../components/admin/ReturnModal';
import { VehicleFormModal } from '../../components/admin/VehicleFormModal';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';

export const AdminDashboard = () => {
  const { formatPrice } = useCurrency();
  const { success, error } = useToast();

  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [pickupBooking, setPickupBooking] = useState(null);
  const [returnBooking, setReturnBooking] = useState(null);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [vList, bList, cList] = await Promise.all([
      getVehicles(),
      getBookings(),
      getCustomers()
    ]);
    setVehicles(vList);
    setBookings(bList);
    setCustomers(cList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // KPI Calculations
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  const rentedVehicles = vehicles.filter(v => v.status === 'rented').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;

  const pendingBookings = bookings.filter(b => b.booking_status === 'pending');
  const activeRentals = bookings.filter(b => b.booking_status === 'active');
  const completedRentals = bookings.filter(b => b.booking_status === 'completed');
  const totalRevenue = bookings.reduce((sum, b) => b.payment_status === 'paid' ? sum + Number(b.total_amount || 0) : sum, 0);

  // Quick Action for pending booking approval
  const handleApproveBooking = async (bookingId) => {
    try {
      await updateBookingStatus(bookingId, 'confirmed');
      success('Booking Approved', 'Reservation status updated to Confirmed.');
      loadData();
    } catch (err) {
      error('Approval failed', err.message);
    }
  };

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Fleet Operations Executive Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, fleet utilization, and booking pipeline monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={loadData}
          >
            Refresh Data
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddVehicleOpen(true)}
          >
            Add New Vehicle
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-100">{formatPrice(totalRevenue)}</h3>
            <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Settled across {bookings.length} reservations
            </p>
          </div>
        </div>

        {/* Fleet Inventory */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fleet Inventory</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-100">{totalVehicles} Vehicles</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              <strong className="text-emerald-400">{availableVehicles} available</strong> • {rentedVehicles} on road
            </p>
          </div>
        </div>

        {/* Active Rentals */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Rentals</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-100">{activeRentals.length} Currently Active</h3>
            <p className="text-[11px] text-sky-400 mt-1">
              {completedRentals.length} completed rentals total
            </p>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-amber-400">{pendingBookings.length} Awaiting Action</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Requires admin approval or vehicle assignment
            </p>
          </div>
        </div>
      </div>

      {/* Fleet Utilization Progress & Quick Distribution */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Live Fleet Availability Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Physical status across all 4 islandwide stations.</p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">
            {Math.round((rentedVehicles / (totalVehicles || 1)) * 100)}% Fleet In-Service
          </span>
        </div>

        {/* Multi-segmented distribution bar */}
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${(availableVehicles / (totalVehicles || 1)) * 100}%` }}
            className="bg-emerald-500 transition-all"
            title={`Available: ${availableVehicles}`}
          />
          <div
            style={{ width: `${(rentedVehicles / (totalVehicles || 1)) * 100}%` }}
            className="bg-sky-500 transition-all"
            title={`Rented: ${rentedVehicles}`}
          />
          <div
            style={{ width: `${(maintenanceVehicles / (totalVehicles || 1)) * 100}%` }}
            className="bg-orange-500 transition-all"
            title={`Maintenance: ${maintenanceVehicles}`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Available ({availableVehicles})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>On Road / Rented ({rentedVehicles})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>Maintenance / Inspection ({maintenanceVehicles})</span>
          </div>
        </div>
      </div>

      {/* Recent Bookings Pipeline Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100">Recent Booking Pipeline</h3>
            <p className="text-xs text-slate-400 mt-0.5">Quick status management and handover operations.</p>
          </div>
          <Link to="/admin/bookings" className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
            View All Bookings ({bookings.length}) <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Booking Code</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Pickup Hub</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                    {b.booking_code}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-200 block">{b.customer_name}</span>
                    <span className="text-[11px] text-slate-500">{b.customer_phone}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-medium">
                    {b.vehicle_name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {b.pickup_location}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                    {formatPrice(b.total_amount)}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge status={b.booking_status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {b.booking_status === 'pending' && (
                        <Button
                          variant="emerald"
                          size="sm"
                          onClick={() => handleApproveBooking(b.id)}
                        >
                          Approve
                        </Button>
                      )}

                      {b.booking_status === 'confirmed' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setPickupBooking(b)}
                        >
                          Pickup Handover
                        </Button>
                      )}

                      {b.booking_status === 'active' && (
                        <Button
                          variant="emerald"
                          size="sm"
                          onClick={() => setReturnBooking(b)}
                        >
                          Process Return
                        </Button>
                      )}

                      <Link to="/admin/bookings">
                        <Button variant="ghost" size="sm" icon={Eye}>
                          Inspect
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {pickupBooking && (
        <PickupModal
          isOpen={Boolean(pickupBooking)}
          onClose={() => setPickupBooking(null)}
          booking={pickupBooking}
          onSuccess={loadData}
        />
      )}

      {returnBooking && (
        <ReturnModal
          isOpen={Boolean(returnBooking)}
          onClose={() => setReturnBooking(null)}
          booking={returnBooking}
          onSuccess={loadData}
        />
      )}

      {isAddVehicleOpen && (
        <VehicleFormModal
          isOpen={isAddVehicleOpen}
          onClose={() => setIsAddVehicleOpen(false)}
          onSaveSuccess={loadData}
        />
      )}
    </div>
  );
};
