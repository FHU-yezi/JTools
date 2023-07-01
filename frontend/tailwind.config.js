import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/components/*.tsx",
    "./src/pages/*.tsx",
    "./src/*.tsx",
  ],
  theme: {
    colors: {
      white: colors.white,
      black: colors.black,
      gray: colors.zinc,
      red: colors.red,
      green: colors.green,
      blue: colors.blue,
      orange: colors.orange,
    },
  },
  plugins: [],
};
