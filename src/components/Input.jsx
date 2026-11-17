export default function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  startIcon: StartIcon = null,
  endIcon: EndIcon = null,
  onEndIconClick,
  className = '',
  ...props
}) {
  return (
    <div className="w-full text-left">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-bold text-[#172554] mb-1.5 tracking-wide"
        >
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-xs">
        {StartIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#1E3A8A]">
            <StartIcon className="w-4 h-4" />
          </div>
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`block w-full rounded-xl text-sm transition-colors border ${
            error
              ? 'border-rose-400 text-rose-950 focus:ring-rose-500 focus:border-rose-500'
              : 'border-[#BFDBFE] text-[#172554] placeholder-[#475569] focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]'
          } ${StartIcon ? 'pl-10' : 'pl-4'} ${
            EndIcon ? 'pr-11' : 'pr-4'
          } py-2.5 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed ${className}`}
          {...props}
        />

        {EndIcon && (
          <button
            type="button"
            tabIndex={-1}
            onClick={onEndIconClick}
            className={`absolute inset-y-0 right-0 pr-3.5 flex items-center ${
              onEndIconClick
                ? 'cursor-pointer text-[#1E3A8A] hover:text-[#172554]'
                : 'pointer-events-none text-[#1E3A8A]'
            }`}
          >
            <EndIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#1E40AF]">{helperText}</p>
      ) : null}
    </div>
  );
}
