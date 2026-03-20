export const DS = {
  colors: {
    primary: '#1b3a7a',
    primarySoft: '#eef2fc',
    textStrong: '#1f2a44',
    textMuted: '#64708b',
    border: '#e0e4ed',
    surface: '#ffffff',
    background: '#f0f2f7',
    success: '#1f8f5f',
    successSoft: '#e9f8f0',
    warning: '#9a6a00',
    warningSoft: '#fff4db',
    danger: '#b9384d',
    dangerSoft: '#fdecef',
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
  },
} as const;

export const createStatusTone = (type: 'info' | 'success' | 'warning' | 'danger' | 'neutral') => {
  if (type === 'info') {
    return { bg: DS.colors.primarySoft, text: DS.colors.primary };
  }
  if (type === 'success') {
    return { bg: DS.colors.successSoft, text: DS.colors.success };
  }
  if (type === 'warning') {
    return { bg: DS.colors.warningSoft, text: DS.colors.warning };
  }
  if (type === 'danger') {
    return { bg: DS.colors.dangerSoft, text: DS.colors.danger };
  }
  return { bg: '#eef1f6', text: DS.colors.textMuted };
};
