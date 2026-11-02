"use client";

import { useMemo } from "react";
import { CREATORS, POSTS, creatorById as staticCreator, earlyLeftMin, type Creator, type LiveStream, type Post, type Tier } from "./club";
import { createStore, uid, useNow } from "./store";
import { notify, usePurchases, type Purchases } from "./account";
import { useMemberships, type Membership } from "./membership";

/* ================= Mening klubim (studiya) ================= */
export const myClubStore = createStore<Creator | null>("club.myClub", null);
export const myPostsStore = createStore<Post[]>("club.myPosts", []);
/** Hozirgi efirim */
export const myLiveStore = createStore<LiveStream | null>("club.myLive", null);

export const useMyClub = myClubStore.use;
export const useMyPosts = myPostsStore.use;
export const useMyLive = myLiveStore.use;

export const DEFAULT_TIERS: Tier[] = [
    { id: "kouhai", name: "Kouhai", price: 10000, perks: ["Yopiq postlar"], members: 0 },
    { id: "sempai", name: "Sempai", price: 25000, perks: ["Yopiq postlar", "A'zolar efirlari"], members: 0 },
    { id: "sensei", name: "Sensei", price: 60000, perks: ["Hammasi", "Shaxsiy minnatdorchilik"], members: 0 },
];

export function createClub(c: Pick<Creator, "id" | "name" | "category" | "tagline" | "avatar" | "banner" | "hue">) {
    myClubStore.set({ ...c, about: c.tagline, verified: false, members: 0, posts: 0, tiers: DEFAULT_TIERS });
    notify({ kind: "system", title: "Klubingiz ochildi", text: "Tariflarni sozlang va birinchi postni chiqaring.", href: "/studio" });
}

export function updateClub(patch: Partial<Creator>) {
    myClubStore.set((c) => (c ? { ...c, ...patch } : c));
}

export function savePost(p: Omit<Post, "id" | "creatorId" | "agoMin" | "likes" | "comments" | "at"> & { id?: string }) {
    const club = myClubStore.get();
    if (!club) return;
    const existing = p.id ? myPostsStore.get().find((x) => x.id === p.id) : undefined;
    const post: Post = existing
        ? { ...existing, ...p, id: existing.id }
        : { ...p, id: `m-${uid()}`, creatorId: club.id, agoMin: 0, likes: 0, comments: 0, at: Date.now() };
    myPostsStore.set((list) => [post, ...list.filter((x) => x.id !== post.id)]);
    if (!existing) updateClub({ posts: club.posts + 1 });
    return post;
}

export function deletePost(id: string) {
    myPostsStore.set((list) => list.filter((p) => p.id !== id));
}

export function startLive(live: Omit<LiveStream, "viewers" | "startedMin" | "startedAt">) {
    myLiveStore.set({ ...live, viewers: 0, startedMin: 0, startedAt: Date.now() });
    notify({ kind: "live", title: "Efir boshlandi", text: live.title, href: `/${myClubStore.get()?.id}/live` });
}

/** Efirni tugatish: yozuv saqlansa — video post sifatida qo'shiladi */
export function endLive(stats: { durationMin: number; donated: number }) {
    const live = myLiveStore.get();
    const club = myClubStore.get();
    myLiveStore.set(null);
    if (!live || !club) return null;
    if (!live.record) return null;
    const h = Math.floor(stats.durationMin / 60);
    const m = stats.durationMin % 60;
    const tier = live.recordAccess === "public" || live.access === "free" ? null : live.tier ?? club.tiers[0].id;
    return savePost({
        kind: "video",
        vod: true,
        title: `Efir yozuvi: ${live.title}`,
        text: `Efirning to'liq yozuvi.${stats.donated ? ` Donatlar uchun rahmat — ${stats.donated.toLocaleString("ru-RU")} so'm!` : ""}`,
        media: live.cover,
        duration: `${h}:${String(m).padStart(2, "0")}:00`,
        tier,
        price: live.access === "ticket" && live.recordAccess !== "public" ? live.price : undefined,
    });
}

/* ================= Birlashtirilgan ma'lumotlar ================= */
/** Barcha ijodkorlar: namunaviylar + mening klubim (efiri bilan) */
export function useCreators(): Creator[] {
    const mine = useMyClub();
    const live = useMyLive();
    return useMemo(() => (mine ? [{ ...mine, live: live ?? undefined }, ...CREATORS.filter((c) => c.id !== mine.id)] : CREATORS), [mine, live]);
}

export function useCreator(id: string): Creator | undefined {
    const all = useCreators();
    return all.find((c) => c.id === id);
}

/** Lookup — komponent tashqarisida (studiya klubi ham) */
export function findCreator(id: string): Creator | undefined {
    const mine = myClubStore.get();
    if (mine && mine.id === id) return { ...mine, live: myLiveStore.get() ?? undefined };
    return staticCreator(id);
}

/** Barcha postlar: rejalashtirilganlar chiqish vaqtigacha faqat muallifga ko'rinadi */
export function usePosts(opts: { includeScheduled?: boolean } = {}): Post[] {
    const mine = useMyPosts();
    const now = useNow();
    return useMemo(() => {
        const visible = opts.includeScheduled ? mine : mine.filter((p) => !p.publishAt || p.publishAt <= now);
        return [...visible, ...POSTS];
    }, [mine, opts.includeScheduled, now]);
}

/* ================= Kirish huquqi ================= */
const rank = (c: Creator, tierId: string) => c.tiers.findIndex((t) => t.id === tierId);

export function canSeePost(post: Post, list: Membership[], purchases: Purchases, isAuthor = false) {
    if (isAuthor || !post.tier) return true;
    if (purchases.posts.includes(post.id)) return true;
    if (post.publicAfterMin && earlyLeftMin(post) === 0) return true;
    const m = list.find((x) => x.creatorId === post.creatorId);
    const c = findCreator(post.creatorId);
    if (!m || !c) return false;
    return rank(c, m.tierId) >= rank(c, post.tier);
}

/** Post ochiqmi — hook (a'zolik, xarid, erta kirish, muallif) */
export function useCanSee() {
    const list = useMemberships();
    const purchases = usePurchases();
    const mine = useMyClub();
    return (post: Post) => canSeePost(post, list, purchases, mine?.id === post.creatorId);
}

/** Efirga kirish huquqi */
export function streamAccess(c: Creator, live: LiveStream, m: Membership | undefined, purchases: Purchases, isHost: boolean): boolean {
    if (isHost || live.access === "free") return true;
    const tierOk = !!live.tier && !!m && rank(c, m.tierId) >= rank(c, live.tier);
    if (live.access === "members") return tierOk || (!live.tier && !!m);
    return tierOk || purchases.tickets.includes(c.id);
}
