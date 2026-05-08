import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                "baby-pink": "var(--baby-pink)",
                "hot-pink": "var(--hot-pink)",
                plum: "var(--plum)",
                gold: "var(--gold)",
                paper: "var(--paper)",
            },
            fontFamily: {
                vibes: ["var(--font-vibes)"],
                playfair: ["var(--font-playfair)"],
                cinzel: ["var(--font-cinzel)"],
                cormorant: ["var(--font-cormorant)"],
                bodoni: ["var(--font-bodoni)"],
            },
        },
    },
    plugins: [],
};
export default config;
