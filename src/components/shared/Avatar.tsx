'use client';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const colorClasses = [
  'bg-accent-emerald/20 text-accent-emerald',
  'bg-accent-blue/20 text-accent-blue',
  'bg-accent-purple/20 text-accent-purple',
  'bg-accent-amber/20 text-accent-amber',
  'bg-accent-rose/20 text-accent-rose',
];

export default function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  const colorIndex = name ? name.charCodeAt(0) % colorClasses.length : 0;

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`
        rounded-full flex items-center justify-center font-medium
        ${sizeClasses[size]}
        ${colorClasses[colorIndex]}
        ${className}
      `}
    >
      {initial}
    </div>
  );
}

// Avatar group for stacked avatars
interface AvatarGroupProps {
  users: Array<{
    id?: string;
    name?: string | null;
    image?: string | null;
  }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarGroup({ users, max = 4, size = 'sm' }: AvatarGroupProps) {
  const visibleUsers = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex -space-x-2">
      {visibleUsers.map((user, index) => (
        <div
          key={user.id || index}
          className="ring-2 ring-primary rounded-full"
        >
          <Avatar src={user.image} name={user.name} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={`
            rounded-full flex items-center justify-center font-medium
            bg-primary-hover text-text-secondary ring-2 ring-primary
            ${sizeClasses[size]}
          `}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
