"use client";

import { useSyncExternalStore } from "react";
import { CREATORS, creatorById, type Creator, type Post } from "./club";

/** Foydalanuvchining klub a'zoliklari (hozircha brauzerda; keyin — akkaunt va to'lov serveri). */
export interface Membership {
    creatorId: string;
    tierId: string;
    /** A'zo raqami — kartada "№ 0042" */
    number: number;
    /** A'zo bo'lgan sana (ms) */
    since: number;
    /** To'langan muddat (oy) */
    months: number;
}

const KEY = "club.memberships";
const DAY = 86_400_000;
// Yangi foydalanuvchida a'zolik yo'q — lenta barcha ijodkorlarning postlarini ko'rsatadi
const SEED: Membership[] = [];

let cache: Membership[] | null = null;
const listeners = new Set<() => void>();

function read(): Membership[] {
    if (cache) return cache;
    try {
        const raw = localStorage.getItem(KEY);
        cache = raw ? (JSON.parse(raw) as Membership[]) : SEED;
    } catch {
        cache = SEED;
    }
    return cache;
}

function write(next: Membership[]) {
    cache = next;
    try {
        localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
        // xotira yopiq — faqat shu sessiyada
    }
    listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
}

export function useMemberships() {
    return useSyncExternalStore(subscribe, read, () => SEED);
}

export function useMembership(creatorId: string) {
    return useMemberships().find((m) => m.creatorId === creatorId);
}

export function join(creatorId: string, tierId: string, months: number): Membership {
    const list = read();
    const prev = list.find((m) => m.creatorId === creatorId);
    const c = creatorById(creatorId)!;
    const tier = c.tiers.find((t) => t.id === tierId)!;
    const m: Membership = prev
        ? { ...prev, tierId, months }
        : { creatorId, tierId, months, since: Date.now(), number: c.tiers.reduce((s, t) => s + t.members, 0) + 1 + (tier.members % 7) };
    write([...list.filter((x) => x.creatorId !== creatorId), m]);
    // Birinchi a'zolikdan keyin lenta "Obunalarim"dan ochiladi
    if (list.length === 0) setFeedTab("mine");
    return m;
}

export function leave(creatorId: string) {
    write(read().filter((m) => m.creatorId !== creatorId));
}

const rank = (c: Creator, tierId: string) => c.tiers.findIndex((t) => t.id === tierId);

/** Post ochiqmi: ochiq post yoki a'zolik tarifi kerakli tarifdan past emas */
export function canSee(post: Post, list: Membership[]) {
    if (!post.tier) return true;
    const m = list.find((x) => x.creatorId === post.creatorId);
    if (!m) return false;
    const c = creatorById(post.creatorId)!;
    return rank(c, m.tierId) >= rank(c, post.tier);
}

/** Efir/yopiq kontent uchun: a'zolik shu tarifga yetadimi */
export function hasTier(c: Creator, tierId: string | null, m?: Membership) {
    if (!tierId) return true;
    return !!m && rank(c, m.tierId) >= rank(c, tierId);
}

export const nextCharge = (m: Membership) => {
    // Har oy "since" kunida yechiladi
    const now = Date.now();
    let t = m.since;
    while (t < now) t += 30 * DAY;
    return new Date(t);
};

export const formatDate = (d: Date | number) => {
    const date = new Date(d);
    const months = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
    return `${date.getDate()}-${months[date.getMonth()]}, ${date.getFullYear()}`;
};

export const memberNo = (n: number) => `# ${String(n).padStart(4, "0")}`;

export const myCreators = (list: Membership[]) => list.map((m) => CREATORS.find((c) => c.id === m.creatorId)!).filter(Boolean);

/* ---- Lentadagi tanlangan bo'lim (eslab qolinadi) ---- */
export type FeedTab = "all" | "mine";
const TAB_KEY = "club.feedTab";
let tabCache: FeedTab | null | undefined;
const tabListeners = new Set<() => void>();

function readTab(): FeedTab | null {
    if (tabCache !== undefined) return tabCache;
    try {
        const v = localStorage.getItem(TAB_KEY);
        tabCache = v === "all" || v === "mine" ? v : null;
    } catch {
        tabCache = null;
    }
    return tabCache;
}

export function setFeedTab(tab: FeedTab) {
    tabCache = tab;
    try {
        localStorage.setItem(TAB_KEY, tab);
    } catch {
        // xotira yopiq
    }
    tabListeners.forEach((l) => l());
}

/** Tanlangan bo'lim; hali tanlanmagan bo'lsa — obunalar bor bo'lsa "mine", yo'q bo'lsa "all" */
export function useFeedTab(): [FeedTab, (t: FeedTab) => void] {
    const list = useMemberships();
    const stored = useSyncExternalStore(
        (cb) => (tabListeners.add(cb), () => tabListeners.delete(cb)),
        readTab,
        () => null,
    );
    return [stored ?? (list.length > 0 ? "mine" : "all"), setFeedTab];
}
