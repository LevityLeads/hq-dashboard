interface RoleBadgeProps {
  role: string;
  small?: boolean;
}

export function RoleBadge({ role, small = false }: RoleBadgeProps) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid #333',
      borderRadius: 4,
      padding: small ? '1px 6px' : '2px 8px',
      fontFamily: 'Inter, sans-serif',
      fontSize: small ? 10 : 11,
      fontWeight: 500,
      color: '#f5f5f5',
      whiteSpace: 'nowrap',
    }}>
      [{role}]
    </span>
  );
}
