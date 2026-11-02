"use client";

import { useEffect, useRef, type RefObject } from "react";

const START_PX = 6;
const DISMISS_PX = 110;
const DISMISS_VELOCITY = 0.6; // px/ms
// Sichqoncha bilan bu elementlardan sudrash boshlanmaydi (bosish ishlashi kerak)
const MOUSE_SKIP = "input, textarea, select, button, a, [role=switch], [role=option], [contenteditable]";

interface SwipeOptions {
    /** y — pastga tortib yopish, x — o'ngga tortib yopish */
    axis: "x" | "y";
    /** Teskari yo'nalish: y — yuqoriga, x — chapga */
    reverse?: boolean;
    enabled: boolean;
    /** Tortish paytida siljish (px, >= 0) */
    onMove: (offset: number) => void;
    /** Qo'yib yuborilganda: yopish kerakmi */
    onRelease: (dismiss: boolean) => void;
}

/** Nishondan panelgacha bo'lgan biror element o'z ichida skroll qila oladimi (shunda svayp emas, skroll) */
function insideScroller(target: Node, root: HTMLElement, axis: "x" | "y") {
    for (let n: Node | null = target; n && n !== root; n = n.parentNode) {
        if (!(n instanceof HTMLElement)) continue;
        if (axis === "y" && n.scrollTop > 0) return true;
        if (axis === "x" && n.scrollWidth > n.clientWidth + 1) {
            const ox = getComputedStyle(n).overflowX;
            if (ox === "auto" || ox === "scroll") return true;
        }
    }
    return false;
}

/**
 * Panelni svayp bilan yopish. Sensorli ekranda pointer hodisalari brauzer skrolliga
 * "o'g'irlanadi" (pointercancel), shuning uchun touch* hodisalari passive: false bilan tinglanadi.
 */
export function useSwipeDismiss(ref: RefObject<HTMLElement | null>, options: SwipeOptions) {
    const opts = useRef(options);
    useEffect(() => {
        opts.current = options;
    });
    const { axis, enabled, reverse = false } = options;

    useEffect(() => {
        const el = ref.current;
        if (!el || !enabled) return;
        let s: { x: number; y: number; last: number; t: number; v: number; active: boolean } | null = null;
        const sign = reverse ? -1 : 1;
        const along = (x: number, y: number) => (axis === "y" ? y : x) * sign;

        const start = (x: number, y: number, target: EventTarget | null) => {
            if (!(target instanceof Node) || insideScroller(target, el, axis)) return;
            s = { x, y, last: along(x, y), t: performance.now(), v: 0, active: false };
        };
        const move = (x: number, y: number, e: Event) => {
            if (!s) return;
            const dx = x - s.x;
            const dy = y - s.y;
            const d = (axis === "y" ? dy : dx) * sign;
            const cross = axis === "y" ? dx : dy;
            if (!s.active) {
                // Pastga tortilsa — brauzer "overscroll"ni boshlamasin
                if (axis === "y" && dy * sign > 0 && e.cancelable) e.preventDefault();
                if (Math.abs(d) < START_PX && Math.abs(cross) < START_PX) return;
                if (d <= 0 || Math.abs(cross) > Math.abs(d)) {
                    s = null; // teskari yo'nalish yoki ko'ndalang — oddiy skroll
                    return;
                }
                s.active = true;
            }
            if (e.cancelable) e.preventDefault();
            const now = performance.now();
            const p = along(x, y);
            s.v = (p - s.last) / Math.max(1, now - s.t);
            s.last = p;
            s.t = now;
            opts.current.onMove(Math.max(0, d));
        };
        const end = (x: number, y: number) => {
            const st = s;
            s = null;
            if (!st?.active) return;
            const d = (axis === "y" ? y - st.y : x - st.x) * sign;
            opts.current.onRelease(d > DISMISS_PX || st.v > DISMISS_VELOCITY);
        };

        const onTouchStart = (e: TouchEvent) => e.touches.length === 1 && start(e.touches[0].clientX, e.touches[0].clientY, e.target);
        const onTouchMove = (e: TouchEvent) => move(e.touches[0].clientX, e.touches[0].clientY, e);
        const onTouchEnd = (e: TouchEvent) => end(e.changedTouches[0].clientX, e.changedTouches[0].clientY);

        // Kompyuterda sichqoncha bilan ham tortish mumkin
        const onMouseMove = (e: PointerEvent) => move(e.clientX, e.clientY, e);
        const onMouseUp = (e: PointerEvent) => {
            window.removeEventListener("pointermove", onMouseMove);
            window.removeEventListener("pointerup", onMouseUp);
            end(e.clientX, e.clientY);
        };
        const onPointerDown = (e: PointerEvent) => {
            if (e.pointerType !== "mouse" || e.button !== 0) return;
            if ((e.target as Element).closest?.(MOUSE_SKIP)) return;
            start(e.clientX, e.clientY, e.target);
            window.addEventListener("pointermove", onMouseMove);
            window.addEventListener("pointerup", onMouseUp);
        };

        el.addEventListener("touchstart", onTouchStart, { passive: true });
        el.addEventListener("touchmove", onTouchMove, { passive: false });
        el.addEventListener("touchend", onTouchEnd);
        el.addEventListener("touchcancel", onTouchEnd);
        el.addEventListener("pointerdown", onPointerDown);
        return () => {
            el.removeEventListener("touchstart", onTouchStart);
            el.removeEventListener("touchmove", onTouchMove);
            el.removeEventListener("touchend", onTouchEnd);
            el.removeEventListener("touchcancel", onTouchEnd);
            el.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointermove", onMouseMove);
            window.removeEventListener("pointerup", onMouseUp);
        };
    }, [ref, axis, enabled, reverse]);
}
