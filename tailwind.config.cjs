module.exports = {
  content: ["./app/**/*.{ts,tsx,js,jsx}", "./components/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        surface: "var(--surface)",
        text: "var(--text)",
        muted: "var(--muted)",
        primary: "var(--primary)",
      },
      borderRadius: {
        base: "var(--radius)",
      },
      boxShadow: {
        card: "var(--shadow)",
      },
      maxWidth: {
        card: "var(--card-max-w)",
      },
    },
  },
  plugins: [],
};
