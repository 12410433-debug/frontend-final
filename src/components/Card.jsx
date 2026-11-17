export default function Card({
  children,
  className = '',
  hoverEffect = false,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-[#BFDBFE] shadow-sm ${
        hoverEffect
          ? 'hover:shadow-md hover:border-[#2563EB] transition-all duration-200'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div
      className={`px-6 py-4 border-b border-[#BFDBFE] flex items-center justify-between ${className}`}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-6 text-[#172554] ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div
      className={`px-6 py-4 bg-[#EFF6FF]/70 border-t border-[#BFDBFE] rounded-b-2xl flex items-center justify-between ${className}`}
    >
      {children}
    </div>
  );
}
