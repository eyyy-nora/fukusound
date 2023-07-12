/** @type {import('tailwindcss').Config} */

function cssVarColor(name) {
  return ({ opacityVariable, opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${name}), ${opacityValue})`;
    }
    if (opacityVariable !== undefined) {
      return `rgba(var(${name}), var(${opacityVariable}, 1))`;
    }
    return `rgb(var(${name}))`;
  };
}

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        discord: cssVarColor("--color-discord"),
      },
      animation: {
        spinnie: "spin 250ms linear infinite",
      },
    },
  },
  plugins: [],
};
