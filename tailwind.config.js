/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#121212",
        surface: "#1A1A1A",
        "surface-hover": "#252525",
        primary: "#F59E0B",
        "primary-hover": "#D97706",
        "accent-muted": "#fb923c",
        "chip-bg": "#2A2A2A",
        "border-subtle": "#2A2A2A",
        card: "#1E1E1E",
        "card-elevated": "#2A2A2A",
        "text-muted": "#9CA3AF",
        "text-dim": "#6B7280",
      },
      fontFamily: {
        sans: ["SpaceGrotesk_400Regular"],
        "sans-light": ["SpaceGrotesk_300Light"],
        "sans-medium": ["SpaceGrotesk_500Medium"],
        "sans-semibold": ["SpaceGrotesk_600SemiBold"],
        "sans-bold": ["SpaceGrotesk_700Bold"],
        display: ["SpaceGrotesk_700Bold", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px -5px rgba(245, 158, 11, 0.3)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
