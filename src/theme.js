// Deliberate dark palette, not antd's stock dark theme: deep ink-blue
// surfaces (not neutral grey) with a violet accent.
export const darkTheme = {
  token: {
    colorPrimary: '#9d7cf5',
    colorInfo: '#9d7cf5',
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
      darkItemSelectedBg: 'rgba(157, 124, 245, 0.16)',
      darkItemSelectedColor: '#9d7cf5',
      darkItemHoverColor: '#c0aef8',
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
