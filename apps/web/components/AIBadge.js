export default function AIBadge({ size = 'small', className = '' }) {
  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xlarge: 'text-lg'
  };
  
  return (
    <span 
      className={`inline-flex items-center font-mono font-bold text-blue-600 ${sizeClasses[size]} ${className}`}
    >
      [<span className="text-[0.6em] opacity-60">•</span>AI<span className="text-[0.6em] opacity-60">•</span>]
    </span>
  );
}