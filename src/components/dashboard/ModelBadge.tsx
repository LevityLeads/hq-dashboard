import { getModelType } from '@/lib/roleParser';

interface ModelBadgeProps {
  model: string;
  small?: boolean;
}

const MODEL_STYLES = {
  opus: { bg: 'rgba(124,58,237,0.15)', border: '#7c3aed', text: '#a78bfa' },
  sonnet: { bg: 'rgba(37,99,235,0.15)', border: '#2563eb', text: '#60a5fa' },
  haiku: { bg: 'rgba(107,114,128,0.15)', border: '#6b7280', text: '#9ca3af' },
  unknown: { bg: 'rgba(107,114,128,0.1)', border: '#444444', text: '#777777' },
};

export function ModelBadge({ model, small = false }: ModelBadgeProps) {
  const type = getModelType(model);
  const style = MODEL_STYLES[type];

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: style.bg,
      border: `1px solid ${style.border}`,
      borderRadius: 4,
      padding: small ? '1px 6px' : '2px 8px',
      fontFamily: 'Inter, sans-serif',
      fontSize: small ? 10 : 11,
      fontWeight: 500,
      color: style.text,
      whiteSpace: 'nowrap',
    }}>
      {model}
    </span>
  );
}
