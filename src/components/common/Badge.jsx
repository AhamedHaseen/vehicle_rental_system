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
      colorClasses = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25";
      break;
    case 'rented':
    case 'in_progress':
      colorClasses = "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25";
      break;
    case 'pending':
    case 'partially_paid':
      colorClasses = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25";
      break;
    case 'maintenance':
    case 'suspended':
      colorClasses = "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/25";
      break;
    case 'cancelled':
    case 'rejected':
    case 'failed':
    case 'deactivated':
      colorClasses = "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25";
      break;
    case 'luxury':
    case 'vip':
      colorClasses = "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25";
      break;
    default:
      colorClasses = "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60";
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
