import type { Config } from 'tailwindcss'

export default {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#C0101A",
          primary600: "#A40D16",
          primary700: "#8C0B13",
          ink: "#0B0B0C",
          ink2: "#1C1D1F",
          muted: "#F4F5F7",
          accent: "#F59E0B",
        },
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0,0,0,0.08), 0 6px 24px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        xl2: "1rem",
        xl3: "1.25rem",
      },
    },
  },
  plugins: [],
} satisfies Config
