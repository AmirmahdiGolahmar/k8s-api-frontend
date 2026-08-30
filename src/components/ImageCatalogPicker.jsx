import { Tooltip } from 'antd';
import { APP_CATALOG } from '../data/appCatalog';

function BrandIcon({ icon, size = 28 }) {
  if (!icon) {
    // Pyroscope has no simple-icons entry -- generic placeholder.
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 6,
          background: '#d9d9d9',
        }}
      />
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={`#${icon.hex}`}>
      <path d={icon.path} />
    </svg>
  );
}

// Plugs into antd's Form.Item like a normal control: Form.Item clones its
// child and injects `value`/`onChange`, same contract as <Input>.
export default function ImageCatalogPicker({ value, onChange }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
        gap: 12,
      }}
    >
      {APP_CATALOG.map((entry) => {
        const selected = entry.enabled && value === entry.image;
        const card = (
          <div
            key={entry.key}
            onClick={() => entry.enabled && onChange?.(entry.image)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              padding: '12px 8px',
              borderRadius: 8,
              border: selected ? '2px solid #1677ff' : '1px solid #e5e5e5',
              cursor: entry.enabled ? 'pointer' : 'not-allowed',
              opacity: entry.enabled ? 1 : 0.4,
              userSelect: 'none',
            }}
          >
            <BrandIcon icon={entry.icon} />
            <span style={{ fontSize: 12, textAlign: 'center' }}>{entry.title}</span>
          </div>
        );
        return entry.enabled ? (
          card
        ) : (
          <Tooltip key={entry.key} title="Not available yet">
            {card}
          </Tooltip>
        );
      })}
    </div>
  );
}
