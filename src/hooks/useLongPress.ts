"use client";

import { useEffect, useRef } from "react";

const MOVE_TOLERANCE = 10;

/**
 * Bosib turish (long press). Qaytaradigan hodisalarni elementga yoyish kifoya.
 * Bosib turish ishlagan bo'lsa, keyingi oddiy bosish (havola o'tishi) bekor qilinadi.
 */
export function useLongPress(onLongPress: () => void, ms = 450) {
    const cb = useRef(onLongPress);
    useEffect(() => {
        cb.current = onLongPress;
    });
    const timer = useRef(0);
    const fired = useRef(false);
    const origin = useRef({ x: 0, y: 0 });
    const clear = () => window.clearTimeout(timer.current);

    return {
        onPointerDown: (e: React.PointerEvent) => {
            if (e.button !== 0) return;
            fired.current = false;
            origin.current = { x: e.clientX, y: e.clientY };
            clear();
            timer.current = window.setTimeout(() => {
                fired.current = true;
                navigator.vibrate?.(12);
                cb.current();
            }, ms);
        },
        onPointerMove: (e: React.PointerEvent) => {
            if (Math.hypot(e.clientX - origin.current.x, e.clientY - origin.current.y) > MOVE_TOLERANCE) clear();
        },
        onPointerUp: clear,
        onPointerLeave: clear,
        onPointerCancel: clear,
        onClickCapture: (e: React.MouseEvent) => {
            if (!fired.current) return;
            e.preventDefault();
            e.stopPropagation();
            fired.current = false;
        },
        // Mobilda tizim menyusi (havolani nusxalash va h.k.) chiqmasin
        onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    };
}
