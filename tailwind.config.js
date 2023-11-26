/** @type {import('tailwindcss').Config} */
export const mode = "jit";
export const darkMode = ["class"];
export const content = [
  "./pages/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
  "./app/**/*.{ts,tsx}",
  "./src/**/*.{ts,tsx}",
];
export const theme = {
  extend: {
    colors: {
      primary: "#F59E0B",
      secondary: "#fb923c",
    },
  },
};
export const plugins = [];
