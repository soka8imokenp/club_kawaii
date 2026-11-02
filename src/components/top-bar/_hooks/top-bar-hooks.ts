"use client";

import { useSyncExternalStore } from "react";
import { applyTheme } from "@/lib/theme";

type Theme = "light" | "dark";

// Mavzu <head>dagi skript bilan birinchi chizishdan oldin qo'llanadi — bu yerda faqat
// `.dark` klassini kuzatamiz (bir nechta komponent bir vaqtda sinxron qoladi)
function subscribe(cb: () => void) {
    const observer = new MutationObserver(cb);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
}

export const useThemeHook = () => {
    const dark = useSyncExternalStore(subscribe, () => document.documentElement.classList.contains("dark"), () => null);
    const theme: Theme | null = dark === null ? null : dark ? "dark" : "light";

    const toggleTheme = () => {
        if (dark === null) return;
        applyTheme(!dark);
        try {
            localStorage.setItem("theme", dark ? "light" : "dark");
        } catch {}
    };

    return { theme, toggleTheme };
};
