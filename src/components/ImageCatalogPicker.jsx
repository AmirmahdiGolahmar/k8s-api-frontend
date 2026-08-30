import { Tooltip, theme } from 'antd';
import { APP_CATALOG } from '../data/appCatalog';

function BrandIcon({ icon, size = 28, mutedColor }) {
  if (!icon) {
    // Pyroscope has no simple-icons entry -- generic placeholder.
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 6,
          background: mutedColor,
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
  const { token } = theme.useToken();

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
              borderRadius: token.borderRadius,
              background: token.colorBgContainer,
              border: selected ? `2px solid ${token.colorPrimary}` : `1px solid ${token.colorBorder}`,
              cursor: entry.enabled ? 'pointer' : 'not-allowed',
              opacity: entry.enabled ? 1 : 0.4,
              userSelect: 'none',
              transition: 'border-color 0.15s ease',
            }}
          >
            <BrandIcon icon={entry.icon} mutedColor={token.colorBorder} />
            <span style={{ fontSize: 12, textAlign: 'center', color: token.colorText }}>{entry.title}</span>
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
