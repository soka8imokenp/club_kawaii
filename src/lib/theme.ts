/** Tizim panellari (status bar, Android navigatsiya paneli) rangi — sahifa foniga teng */
export const THEME_COLOR = { light: "#e9ebf0", dark: "#000000" } as const;

/** Mavzuni qo'llash: `.dark` klassi, color-scheme va <meta name="theme-color"> */
export function applyTheme(dark: boolean) {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? THEME_COLOR.dark : THEME_COLOR.light);
}

/** Birinchi chizishdan oldin ishlaydigan skript — mavzu "miltillamasin", panellar darhol to'g'ri rangda */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?"${THEME_COLOR.dark}":"${THEME_COLOR.light}")}catch(e){}})()`;
