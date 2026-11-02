"use client";

import { createStore, uid } from "./store";

/* ================= Akkaunt ================= */
export interface Account {
    name: string;
    handle: string;
    avatar: string;
    /** Telegram orqali kirgan (hozircha namunaviy) */
    via: "telegram";
    joinedAt: number;
}

export const accountStore = createStore<Account | null>("club.account", null);
export const useAccount = accountStore.use;

export function login() {
    const n = Math.floor(1000 + Math.random() * 9000);
    accountStore.set({ name: `Otaku ${n}`, handle: `otaku_${n}`, avatar: "/images/logo.svg", via: "telegram", joinedAt: Date.now() });
    notify({ kind: "system", title: "Xush kelibsiz!", text: "Akkauntingiz tayyor. Sevimli ijodkorlaringizni toping." });
}

export function logout() {
    accountStore.set(null);
}

export function updateAccount(patch: Partial<Account>) {
    accountStore.set((a) => (a ? { ...a, ...patch } : a));
}

/* ================= To'lovlar tarixi ================= */
export type PaymentKind = "subscription" | "trial" | "gift" | "post" | "ticket" | "product" | "donation";
export interface Payment {
    id: string;
    at: number;
    kind: PaymentKind;
    creatorId: string;
    title: string;
    amount: number;
    method: string;
}

export const paymentsStore = createStore<Payment[]>("club.payments", []);
export const usePayments = paymentsStore.use;

export function recordPayment(p: Omit<Payment, "id" | "at">) {
    paymentsStore.set((list) => [{ ...p, id: uid(), at: Date.now() }, ...list]);
}

/* ================= Xaridlar (post, chipta, mahsulot) ================= */
export interface Purchases {
    posts: string[];
    /** Chipta olingan efirlar — ijodkor id */
    tickets: string[];
    products: string[];
    /** Sovg'a qilingan kartalar kodlari */
    gifts: { code: string; creatorId: string; tierId: string; months: number }[];
}

export const purchasesStore = createStore<Purchases>("club.purchases", { posts: [], tickets: [], products: [], gifts: [] });
export const usePurchases = purchasesStore.use;

export function buy(kind: "posts" | "tickets" | "products", id: string) {
    purchasesStore.set((p) => ({ ...p, [kind]: p[kind].includes(id) ? p[kind] : [...p[kind], id] }));
}

export function addGift(creatorId: string, tierId: string, months: number) {
    const code = `KC-${uid().slice(0, 4).toUpperCase()}-${uid().slice(0, 4).toUpperCase()}`;
    purchasesStore.set((p) => ({ ...p, gifts: [{ code, creatorId, tierId, months }, ...p.gifts] }));
    return code;
}

/* ================= Faollik (yutuqlar uchun) ================= */
export interface Activity {
    comments: number;
    donations: number;
    donated: number;
    streams: string[];
}
export const activityStore = createStore<Activity>("club.activity", { comments: 0, donations: 0, donated: 0, streams: [] });
export const useActivity = activityStore.use;

export function track(patch: (a: Activity) => Activity) {
    activityStore.set(patch);
}

/* ================= Bildirishnomalar ================= */
export interface Notice {
    id: string;
    at: number;
    kind: "post" | "live" | "payment" | "comment" | "system";
    title: string;
    text: string;
    href?: string;
    avatar?: string;
    read?: boolean;
}

const HOUR = 3_600_000;
const SEED_NOTICES: Notice[] = [
    { id: "n1", at: Date.UTC(2026, 10, 2, 9), kind: "live", title: "OtakuCast efirda", text: "Kuz mavsumi: top-10 anime", href: "/otakucast/live", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&h=120&auto=format&fit=crop" },
    { id: "n2", at: Date.UTC(2026, 10, 2, 9) - 3 * HOUR, kind: "post", title: "Madina Fanart yangi post", text: "Gojo «Cheksiz bo'shliq» — 4K devor qog'ozi", href: "/p/p2", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&h=120&auto=format&fit=crop" },
];

export const noticesStore = createStore<Notice[]>("club.notices", SEED_NOTICES);
export const useNotices = noticesStore.use;

export function notify(n: Omit<Notice, "id" | "at">) {
    noticesStore.set((list) => [{ ...n, id: uid(), at: Date.now() }, ...list].slice(0, 50));
}

export function markAllRead() {
    noticesStore.set((list) => list.map((n) => ({ ...n, read: true })));
}

export function timeAgo(at: number) {
    const min = Math.max(0, Math.round((Date.now() - at) / 60000));
    if (min < 1) return "hozir";
    if (min < 60) return `${min} daq oldin`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h} soat oldin`;
    return `${Math.floor(h / 24)} kun oldin`;
}
