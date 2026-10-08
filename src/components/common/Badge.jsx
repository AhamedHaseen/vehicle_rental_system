export const Badge = ({ children, status, variant, className = '' }) => {
  // Normalize string
  const normalized = (status || variant || '').toLowerCase();

  let colorClasses;

  switch (normalized) {
    case 'available':
    case 'confirmed':
    case 'completed':
    case 'active':
    case 'paid':
      colorClasses = "bg-emerald-600 text-white border-emerald-400/40 font-bold shadow-xs";
      break;
    case 'rented':
    case 'in_progress':
      colorClasses = "bg-sky-600 text-white border-sky-400/40 font-bold shadow-xs";
      break;
    case 'reserved':
    case 'pending':
    case 'partially_paid':
      colorClasses = "bg-amber-600 text-white border-amber-400/40 font-bold shadow-xs";
      break;
    case 'maintenance':
    case 'suspended':
      colorClasses = "bg-rose-600 text-white border-rose-400/40 font-bold shadow-xs";
      break;
    case 'cancelled':
    case 'rejected':
    case 'failed':
    case 'deactivated':
      colorClasses = "bg-rose-700 text-white border-rose-400/40 font-bold shadow-xs";
      break;
    case 'luxury':
    case 'vip':
      colorClasses = "bg-purple-600 text-white border-purple-400/40 font-bold shadow-xs";
      break;
    default:
      colorClasses = "bg-slate-700 text-white border-slate-500/40 font-bold shadow-xs";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse" />
      {children || status}
    </span>
  );
};
