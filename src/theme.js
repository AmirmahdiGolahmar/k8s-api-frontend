// Deliberate dark palette, not antd's stock dark theme: deep ink-blue
// surfaces (not neutral grey) with a copper/amber accent -- same accent
// family as the project's build report, carried over as this product's
// actual identity rather than antd's default blue.
export const darkTheme = {
  token: {
    colorPrimary: '#e0914f',
    colorInfo: '#e0914f',
    colorBgBase: '#10131a',
    colorBgContainer: '#1a1f29',
    colorBgElevated: '#222836',
    colorBgLayout: '#0d0f15',
    colorBorder: '#2c3341',
    colorBorderSecondary: '#232936',
    colorTextBase: '#e9ecf2',
    colorSuccess: '#4fb583',
    colorWarning: '#d1a13f',
    colorError: '#d9695f',
    borderRadius: 8,
    fontFamily: "-apple-system, 'Segoe UI', Roboto, sans-serif",
  },
  components: {
    Layout: {
      siderBg: '#0b0d12',
      headerBg: '#151920',
      bodyBg: '#0d0f15',
    },
    Menu: {
      darkItemBg: '#0b0d12',
      darkItemSelectedBg: 'rgba(224, 145, 79, 0.16)',
      darkItemSelectedColor: '#e0914f',
      darkItemHoverColor: '#f0b380',
    },
    Table: {
      headerBg: '#1a1f29',
      headerColor: '#9aa3b2',
    },
    Card: {
      colorBgContainer: '#1a1f29',
    },
  },
};
