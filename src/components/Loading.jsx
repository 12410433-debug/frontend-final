export default function Loading({
  message = 'Memuat data...',
  size = 'md',
  fullScreen = false,
}) {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3 text-center">
      <div
        className={`${
          sizeMap[size] || sizeMap.md
        } rounded-full border-blue-600 border-t-transparent animate-spin`}
      />
      {message && <p className="text-xs font-medium text-slate-500">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return <div className="py-12 flex items-center justify-center">{content}</div>;
}
