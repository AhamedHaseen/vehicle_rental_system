import React, { useState, useEffect } from 'react';
import { getVehicles, getBookings } from '../../services/dataService';
import { Button } from '../../components/common/Button';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { 
  BarChart3, Download, TrendingUp, Car, Award, 
  Calendar, DollarSign, CheckCircle2 
} from 'lucide-react';

export const AdminReports = () => {
  const { formatPrice } = useCurrency();
  const { success } = useToast();

  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [vList, bList] = await Promise.all([getVehicles(), getBookings()]);
      setVehicles(vList);
      setBookings(bList);
      setLoading(false);
    };
    load();
  }, []);

  // Category breakdown calculation
  const categoryStats = ['Car', 'SUV', 'Luxury Vehicle', 'Van', 'Motorbike', 'Three-Wheeler'].map((cat) => {
    const catVehicles = vehicles.filter(v => v.category === cat);
    const catBookings = bookings.filter(b => {
      const v = vehicles.find(veh => veh.id === b.vehicle_id);
      return v?.category === cat || b.vehicle_name?.includes(cat);
    });
    const rev = catBookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
    return {
      category: cat,
      fleetCount: catVehicles.length,
      rentalsCount: catBookings.length,
      revenue: rev
    };
  });

  // Top Rented Vehicles ranking
  const vehicleRentalCounts = vehicles.map((v) => {
    const count = bookings.filter(b => b.vehicle_id === v.id).length;
    const rev = bookings.filter(b => b.vehicle_id === v.id).reduce((s, b) => s + Number(b.total_amount || 0), 0);
    return {
      ...v,
      rentalCount: count,
      totalGenerated: rev
    };
  }).sort((a, b) => b.rentalCount - a.rentalCount).slice(0, 5);

  // CSV Export Function
  const handleExportCSV = () => {
    const headers = ['BookingCode', 'CustomerName', 'CustomerEmail', 'VehicleName', 'StartDate', 'EndDate', 'TotalAmountLKR', 'BookingStatus', 'PaymentStatus'];
    const rows = bookings.map(b => [
      b.booking_code,
      `"${b.customer_name}"`,
      b.customer_email,
      `"${b.vehicle_name}"`,
      new Date(b.start_date).toISOString(),
      new Date(b.end_date).toISOString(),
      b.total_amount,
      b.booking_status,
      b.payment_status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rentflow_operations_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    success('Report Exported', 'CSV spreadsheet downloaded successfully.');
  };

  const totalRev = bookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Fleet Intelligence & Financial Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Category utilization metrics, vehicle yield, and executive reporting.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Download}
          onClick={handleExportCSV}
        >
          Export CSV Report
        </Button>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Gross Rental Volume</span>
          <h3 className="text-2xl font-black text-amber-400">{formatPrice(totalRev)}</h3>
          <p className="text-[11px] text-slate-400">Total pipeline booking value</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Completed Dispatches</span>
          <h3 className="text-2xl font-black text-emerald-400">
            {bookings.filter(b => b.booking_status === 'completed' || b.booking_status === 'active').length} Trips
          </h3>
          <p className="text-[11px] text-slate-400">Successfully dispatched vehicles</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Active Fleet Size</span>
          <h3 className="text-2xl font-black text-slate-100">{vehicles.length} Units</h3>
          <p className="text-[11px] text-slate-400">Managed across 4 regional depots</p>
        </div>
      </div>

      {/* Category Performance Breakdown */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100">Category Yield & Fleet Distribution</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Vehicle Category</th>
                <th className="py-3 px-4">Fleet Count</th>
                <th className="py-3 px-4">Total Reservations</th>
                <th className="py-3 px-4">Gross Revenue</th>
                <th className="py-3 px-4 text-right">Revenue Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {categoryStats.map((item) => {
                const sharePercent = totalRev > 0 ? Math.round((item.revenue / totalRev) * 100) : 0;
                return (
                  <tr key={item.category} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-200">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      {item.fleetCount} Vehicles
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      {item.rentalsCount} Bookings
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {formatPrice(item.revenue)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${sharePercent}%` }}
                            className="h-full bg-amber-500 rounded-full"
                          />
                        </div>
                        <span className="font-mono text-slate-300 w-8">{sharePercent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top 5 Most Rented Vehicles */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" /> Top Performing Fleet Vehicles
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {vehicleRentalCounts.map((v, i) => (
            <div key={v.id} className="p-4 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-2 relative">
              <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">
                #{i + 1}
              </span>
              <img
                src={v.image_url}
                alt={v.model}
                className="w-full h-24 object-cover rounded-xl border border-slate-700/60"
              />
              <div>
                <span className="text-[10px] text-amber-400 uppercase font-bold">{v.category}</span>
                <h4 className="font-bold text-slate-100 text-xs truncate">{v.brand} {v.model}</h4>
                <p className="text-[11px] text-slate-400 font-mono">{v.registration_no}</p>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Bookings:</span>
                <span className="font-bold text-slate-100">{v.rentalCount} Trips</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
