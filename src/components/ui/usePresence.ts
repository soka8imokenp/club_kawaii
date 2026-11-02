"use client";

import { useEffect, useState } from "react";

/**
 * Ochilish/yopilish holati: `open` false bo'lganda element darhol yo'qolmaydi —
 * `closing` davomida (ms) yopilish animatsiyasi o'ynaydi, keyin `shown` false bo'ladi.
 * `session` — har yangi ochilishda oshadi (ichki qoralama holatini qayta boshlash uchun key).
 */
export function usePresence(open: boolean, ms: number) {
    const [shown, setShown] = useState(open);
    const [closing, setClosing] = useState(false);
    const [session, setSession] = useState(0);

    // Render paytida prop o'zgarishiga moslashish (effektsiz)
    if (open && !shown) {
        setShown(true);
        setSession((s) => s + 1);
    }
    if (open && closing) setClosing(false);
    if (!open && shown && !closing) setClosing(true);

    useEffect(() => {
        if (!closing) return;
        const id = setTimeout(() => {
            setShown(false);
            setClosing(false);
        }, ms);
        return () => clearTimeout(id);
    }, [closing, ms]);

    return { shown, closing, session };
}
