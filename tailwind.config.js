module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        light: "#f7f7f8",
        lightBlack: "#1f1f23",
        twitchPurple: "#772ce8",
        twitchPurpleLight: "#9147ff",
      },
      screens: {
        betterhover: { raw: "(hover: hover)" },
        "2xl": "1440px",
      },
    },
  },
  plugins: [],
};
