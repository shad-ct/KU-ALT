/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // Default Tailwind palette completely disabled; extend only our tokens
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#FFFFFF",
      black: "#000000",

      // Calm surfaces
      bg: "var(--color-bg)",
      surface: {
        DEFAULT: "var(--color-surface)",
        sub: "var(--color-surface-sub)",
        card: "var(--color-surface)",
        subtle: "var(--color-surface-sub)",
        hover: "var(--color-surface-sub)",
      },

      // Borders
      border: {
        DEFAULT: "var(--color-border)",
        subtle: "var(--color-border)",
        strong: "var(--color-border-strong)",
        focus: "var(--color-accent-600)",
      },

      // Typography text colors
      text: {
        DEFAULT: "var(--color-text)",
        primary: "var(--color-text)",
        muted: "var(--color-text-muted)",
        secondary: "var(--color-text-muted)",
        subtle: "var(--color-text-subtle)",
        tertiary: "var(--color-text-subtle)",
      },

      // Single institutional accent
      accent: {
        50: "var(--color-accent-50)",
        100: "var(--color-accent-100)",
        600: "var(--color-accent-600)",
        700: "var(--color-accent-700)",
        DEFAULT: "var(--color-accent-600)",
        subtle: "var(--color-accent-50)",
        hover: "var(--color-accent-700)",
      },

      // Soft Status indicators
      success: {
        text: "var(--color-success-text)",
        bg: "var(--color-success-bg)",
        DEFAULT: "var(--color-success-text)",
      },
      warning: {
        text: "var(--color-warning-text)",
        bg: "var(--color-warning-bg)",
        DEFAULT: "var(--color-warning-text)",
      },
      danger: {
        text: "var(--color-danger-text)",
        bg: "var(--color-danger-bg)",
        DEFAULT: "var(--color-danger-text)",
      },
      info: {
        text: "var(--color-info-text)",
        bg: "var(--color-info-bg)",
        DEFAULT: "var(--color-info-text)",
      },
      neutral: {
        text: "var(--color-neutral-text)",
        bg: "var(--color-neutral-bg)",
        DEFAULT: "var(--color-neutral-text)",
      },
    },

    fontFamily: {
      sans: "var(--font-sans)",
      mono: "var(--font-mono)",
    },

    fontSize: {
      display: ["32px", { lineHeight: "40px", fontWeight: "600" }],
      h1: ["28px", { lineHeight: "36px", fontWeight: "600" }],
      h2: ["20px", { lineHeight: "28px", fontWeight: "600" }],
      h3: ["16px", { lineHeight: "24px", fontWeight: "600" }],
      body: ["15px", { lineHeight: "24px", fontWeight: "400" }],
      form: ["16px", { lineHeight: "24px", fontWeight: "400" }],
      label: ["14px", { lineHeight: "20px", fontWeight: "500" }],
      small: ["13px", { lineHeight: "20px", fontWeight: "400" }],

      // Standard scale aliases mapped to specification
      xs: ["13px", { lineHeight: "20px" }],
      sm: ["14px", { lineHeight: "20px" }],
      base: ["15px", { lineHeight: "24px" }],
      md: ["16px", { lineHeight: "24px" }],
      lg: ["20px", { lineHeight: "28px" }],
      xl: ["24px", { lineHeight: "32px" }],
      "2xl": ["28px", { lineHeight: "36px" }],
      "3xl": ["32px", { lineHeight: "40px" }],
    },

    fontWeight: {
      normal: "400",
      regular: "400",
      medium: "500",
      semibold: "600",
    },

    spacing: {
      0: "0px",
      1: "4px",
      2: "8px",
      3: "12px",
      4: "16px",
      5: "20px",
      6: "24px",
      7: "28px",
      8: "32px",
      9: "36px",
      10: "40px",
      11: "44px",
      12: "48px",
      14: "56px",
      16: "64px",
      20: "80px",
      24: "96px",
      px: "1px",
      sidebar: "var(--sidebar-width)",
      topbar: "var(--topbar-height)",
    },

    borderRadius: {
      none: "0px",
      sm: "var(--radius-sm)", // 6px
      DEFAULT: "var(--radius-md)", // 8px
      md: "var(--radius-md)", // 8px
      lg: "var(--radius-lg)", // 12px
      full: "var(--radius-full)", // 9999px
    },

    borderWidth: {
      DEFAULT: "1px",
      0: "0px",
      1: "1px",
      2: "2px",
    },

    boxShadow: {
      none: "none",
      menu: "var(--shadow-menu)",
      dialog: "var(--shadow-menu)",
    },

    maxWidth: {
      content: "var(--layout-max-width)",
      prose: "var(--prose-max-width)",
      form: "560px",
      login: "400px",
      dialog: "480px",
      full: "100%",
    },
  },
  plugins: [],
};
