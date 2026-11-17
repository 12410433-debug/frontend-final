export default function Badge({
  children,
  variant = 'blue',
  size = 'md',
  dot = false,
  icon: Icon = null,
  className = '',
}) {
  const variantStyles = {
    blue: 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]',
    darkBlue: 'bg-[#1E3A8A] text-white border-[#1E3A8A]',
    green: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold',
    yellow: 'bg-amber-50 text-amber-950 border-amber-300 font-semibold',
    red: 'bg-rose-50 text-rose-950 border-rose-300 font-semibold',
    purple: 'bg-purple-50 text-purple-950 border-purple-300 font-semibold',
    gray: 'bg-slate-100 text-[#172554] border-[#BFDBFE] font-semibold',
  };

  const dotStyles = {
    blue: 'bg-[#2563EB]',
    darkBlue: 'bg-white',
    green: 'bg-emerald-600',
    yellow: 'bg-amber-600',
    red: 'bg-rose-600',
    purple: 'bg-purple-600',
    gray: 'bg-[#1E3A8A]',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${
        variantStyles[variant] || variantStyles.blue
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            dotStyles[variant] || 'bg-[#2563EB]'
          }`}
        />
      )}
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
