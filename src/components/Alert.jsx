import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Alert({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
}) {
  const configs = {
    success: {
      bg: 'bg-emerald-50 border-emerald-300 text-emerald-950',
      icon: CheckCircle2,
      iconColor: 'text-emerald-700',
    },
    error: {
      bg: 'bg-rose-50 border-rose-300 text-rose-950',
      icon: XCircle,
      iconColor: 'text-rose-700',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-300 text-amber-950',
      icon: AlertTriangle,
      iconColor: 'text-amber-700',
    },
    info: {
      bg: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#172554]',
      icon: Info,
      iconColor: 'text-[#2563EB]',
    },
  };

  const current = configs[type] || configs.info;
  const IconComponent = current.icon;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border text-sm transition-all ${current.bg} ${className}`}
    >
      <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${current.iconColor}`} />
      <div className="flex-1">
        {title && <h4 className="font-bold mb-0.5">{title}</h4>}
        {message && <div className="text-xs sm:text-sm font-medium leading-relaxed">{message}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 -mr-1 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/5 transition-opacity cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
