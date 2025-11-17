// Central design tokens (JS/TS export + CSS variable mapping elsewhere)
// Palette chosen: Indigo primary, Slate neutrals, Emerald success, Amber warning, Rose danger, Sky info.

export const colors = {
  primary: {
    50: "#eef2ff",
    100: "#e0e7ff",
    200: "#c7d2fe",
    300: "#a5b4fc",
    400: "#818cf8",
    500: "#6366f1",
    600: "#4f46e5",
    700: "#4338ca",
    800: "#3730a3",
    900: "#312e81",
  },
  neutral: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
  success: {
    50: "#ecfdf5",
    500: "#10b981",
    600: "#059669",
  },
  warning: {
    50: "#fffbeb",
    500: "#f59e0b",
    600: "#d97706",
  },
  danger: {
    50: "#fff1f2",
    500: "#e11d48",
    600: "#be123c",
  },
  info: {
    50: "#f0f9ff",
    500: "#0ea5e9",
    600: "#0284c7",
  },
};

export const typography = {
  fontFamilySans:
    'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Arial, sans-serif',
  sizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    md: "1.125rem",
    lg: "1.25rem",
    xl: "1.5rem",
    "2xl": "2rem",
    "3xl": "2.5rem",
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.65,
  },
};

export const spacing = {
  0: "0",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  3.5: "0.875rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
};

export const radii = {
  xs: "3px",
  sm: "4px",
  md: "6px",
  lg: "10px",
  xl: "16px",
  pill: "999px",
};

export const shadows = {
  xs: "0 1px 2px 0 rgba(0,0,0,0.05)",
  sm: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)",
  md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
  lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
  xl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
};

export const transitions = {
  fast: "120ms ease",
  base: "200ms ease",
  slow: "320ms ease",
};

export const zIndex = {
  dropdown: 20,
  sticky: 30,
  modal: 40,
  popover: 50,
  toast: 60,
};

// Helper to produce CSS vars mapping if needed programmatically
export function generateCssVariables() {
  const vars = [];
  Object.entries(colors).forEach(([group, value]) => {
    Object.entries(value).forEach(([step, hex]) => {
      vars.push(`--color-${group}-${step}: ${hex};`);
    });
  });
  Object.entries(typography.sizes).forEach(([k, v]) =>
    vars.push(`--font-size-${k}: ${v};`)
  );
  Object.entries(spacing).forEach(([k, v]) => vars.push(`--space-${k}: ${v};`));
  Object.entries(radii).forEach(([k, v]) => vars.push(`--radius-${k}: ${v};`));
  Object.entries(shadows).forEach(([k, v]) =>
    vars.push(`--shadow-${k}: ${v};`)
  );
  return vars.join("\n");
}
