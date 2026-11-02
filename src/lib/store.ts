"use client";

import { useSyncExternalStore } from "react";

/**
 * Brauzer xotirasidagi kichik global holat (localStorage + useSyncExternalStore).
 * Server ulanmaguncha akkaunt, xaridlar, studiya va h.k. shu yerda saqlanadi.
 */
export function createStore<T>(key: string, initial: T) {
    let cache: T | undefined;
    const listeners = new Set<() => void>();

    const get = (): T => {
        if (cache !== undefined) return cache;
        try {
            const raw = localStorage.getItem(key);
            cache = raw ? (JSON.parse(raw) as T) : initial;
        } catch {
            cache = initial;
        }
        return cache;
    };

    const set = (next: T | ((prev: T) => T)) => {
        cache = typeof next === "function" ? (next as (p: T) => T)(get()) : next;
        try {
            localStorage.setItem(key, JSON.stringify(cache));
        } catch {
            // xotira yopiq — faqat shu sessiyada
        }
        listeners.forEach((l) => l());
    };

    const subscribe = (cb: () => void) => {
        listeners.add(cb);
        return () => listeners.delete(cb);
    };

    const use = () => useSyncExternalStore(subscribe, get, () => initial);

    return { get, set, use, subscribe };
}

/** Global "ochish" holati — istalgan joydan oyna chaqirish uchun (openJoin, openPay...) */
export function createOpener<P>() {
    let state: { props: P; nonce: number } | null = null;
    const listeners = new Set<() => void>();
    const emit = () => listeners.forEach((l) => l());
    return {
        open(props: P) {
            state = { props, nonce: Date.now() + Math.random() };
            emit();
        },
        close() {
            if (state) state = { ...state, nonce: -Math.abs(state.nonce) };
            emit();
        },
        use() {
            const s = useSyncExternalStore(
                (cb) => (listeners.add(cb), () => listeners.delete(cb)),
                () => state,
                () => null,
            );
            return { open: !!s && s.nonce > 0, props: s?.props, key: s ? Math.abs(s.nonce) : 0 };
        },
    };
}

export const uid = () => Math.random().toString(36).slice(2, 10);

/* ---- Hozirgi vaqt (30 soniyada yangilanadi) — render paytida Date.now() o'rniga ---- */
let nowCache = 0;
const nowListeners = new Set<() => void>();
let nowTimer = 0;
function subscribeNow(cb: () => void) {
    nowListeners.add(cb);
    if (!nowTimer) {
        nowTimer = window.setInterval(() => {
            nowCache = Date.now();
            nowListeners.forEach((l) => l());
        }, 30_000);
    }
    return () => {
        nowListeners.delete(cb);
        if (nowListeners.size === 0) {
            window.clearInterval(nowTimer);
            nowTimer = 0;
        }
    };
}
const getNow = () => (nowCache ||= Date.now());

/** Hozirgi vaqt (ms). Serverda va gidratsiyada 0 — vaqtga bog'liq yozuvlar keyin to'ldiriladi */
export const useNow = () => useSyncExternalStore(subscribeNow, getNow, () => 0);
