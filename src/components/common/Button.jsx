import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-150 btn-tactile select-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none rounded-xl";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
    xl: "px-6 py-3.5 text-lg gap-3 font-semibold",
  };

  const variantClasses = {
    primary: "bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-lg shadow-amber-500/20 focus:ring-amber-500 border border-amber-400/30",
    secondary: "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700/80 focus:ring-slate-400 dark:focus:ring-slate-600 shadow-sm",
    dark: "bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 focus:ring-slate-700",
    outline: "border border-amber-500/60 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 focus:ring-amber-500 font-semibold",
    danger: "bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-600/20 focus:ring-rose-500 border border-rose-500/30",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:ring-slate-400 dark:focus:ring-slate-700 font-medium",
    emerald: "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/20 focus:ring-emerald-500 border border-emerald-500/30"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};
