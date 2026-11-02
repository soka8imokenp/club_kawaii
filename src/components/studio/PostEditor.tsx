"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import type { Post, PostKind } from "@/lib/club";
import { notify } from "@/lib/account";
import { savePost, useMyClub, useMyPosts } from "@/lib/studio";
import { PostCard } from "@/components/club/PostCard";
import { useNow } from "@/lib/store";
import { Field, ImagePicker, Section, Segmented, Toggle, ghostBtn, inputCls, primaryBtn } from "./ui";

const KINDS: { value: PostKind; label: string }[] = [
    { value: "text", label: "Matn" },
    { value: "image", label: "Rasm" },
    { value: "video", label: "Video" },
    { value: "audio", label: "Audio" },
    { value: "poll", label: "So'rov" },
];

const EARLY = [
    { value: 1440, label: "1 kun" },
    { value: 4320, label: "3 kun" },
    { value: 10080, label: "1 hafta" },
];

/** Post yaratish/tahrirlash: turi, matn, media, kirish (tarif, erta kirish, alohida sotish), rejalashtirish */
export function PostEditor({ id }: { id?: string }) {
    const club = useMyClub()!;
    const existing = useMyPosts().find((p) => p.id === id);
    const router = useRouter();
    const now = useNow();

    const [kind, setKind] = useState<PostKind>(existing?.kind ?? "image");
    const [title, setTitle] = useState(existing?.title ?? "");
    const [text, setText] = useState(existing?.text ?? "");
    const [images, setImages] = useState<string[]>(existing?.gallery ?? (existing?.media ? [existing.media] : []));
    const [duration, setDuration] = useState(existing?.duration ?? "");
    const [options, setOptions] = useState<string[]>(existing?.poll?.options.map((o) => o.label) ?? ["", ""]);
    const [tier, setTier] = useState<string | null>(existing ? existing.tier : club.tiers[0]?.id ?? null);
    const [early, setEarly] = useState<number | null>(existing?.publicAfterMin ?? null);
    const [price, setPrice] = useState<number | null>(existing?.price ?? null);
    const [schedule, setSchedule] = useState<string>(existing?.publishAt ? toLocal(existing.publishAt) : "");
    const [tags, setTags] = useState(existing?.tags?.join(" ") ?? "");

    const needsMedia = kind === "image" || kind === "video" || kind === "audio";
    const valid = title.trim().length >= 3 && (!needsMedia || images.length > 0) && (kind !== "poll" || options.filter((o) => o.trim()).length >= 2);

    const draft: Omit<Post, "id" | "creatorId" | "agoMin" | "likes" | "comments" | "at"> = {
        kind,
        title: title.trim() || "Sarlavha",
        text: text.trim(),
        media: needsMedia ? images[0] : undefined,
        gallery: kind === "image" && images.length > 1 ? images : undefined,
        duration: kind === "video" || kind === "audio" ? duration || "0:00" : undefined,
        poll: kind === "poll" ? { options: options.filter((o) => o.trim()).map((label) => ({ label: label.trim(), votes: 0 })) } : undefined,
        tier,
        publicAfterMin: tier && early ? early : undefined,
        price: tier && price ? price : undefined,
        publishAt: schedule ? new Date(schedule).getTime() : undefined,
        tags: tags
            .split(/[\s,#]+/)
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 6),
    };

    const preview: Post = { ...draft, id: existing?.id ?? "preview", creatorId: club.id, agoMin: 0, likes: existing?.likes ?? 0, comments: existing?.comments ?? 0, at: existing?.at ?? now, publishAt: undefined };

    const save = () => {
        const p = savePost({ ...draft, id: existing?.id });
        if (p && !existing) notify({ kind: "post", title: draft.publishAt ? "Post rejalashtirildi" : "Post chiqdi", text: p.title, href: `/p/${p.id}`, avatar: club.avatar });
        router.push("/studio/posts");
    };

    return (
        <div>
            <h1 className="text-2xl font-black text-text-main mb-5">{existing ? "Postni tahrirlash" : "Yangi post"}</h1>
            <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_420px] gap-6 items-start">
                <div className="space-y-4">
                    <Section title="Kontent">
                        <Segmented value={kind} onChange={setKind} options={KINDS} />
                        <Field label="Sarlavha">
                            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Nima haqida?" className={inputCls} />
                        </Field>
                        <Field label="Matn">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={5}
                                maxLength={4000}
                                placeholder="A'zolarga nima demoqchisiz…"
                                className={`${inputCls} h-auto py-3 resize-y`}
                            />
                        </Field>
                        {needsMedia && (
                            <div>
                                <span className="block mb-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
                                    {kind === "image" ? "Rasmlar (8 tagacha)" : "Muqova"}
                                </span>
                                <ImagePicker value={images} onChange={setImages} multiple={kind === "image"} />
                                {kind !== "image" && <p className="mt-1 text-[11px] text-text-muted">Video va audio fayllar server ulangach yuklanadi — hozircha namunaviy fayl ishlatiladi.</p>}
                            </div>
                        )}
                        {(kind === "video" || kind === "audio") && (
                            <Field label="Davomiyligi">
                                <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="12:34" className={inputCls} />
                            </Field>
                        )}
                        {kind === "poll" && (
                            <div className="space-y-2">
                                <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Variantlar</span>
                                {options.map((o, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            value={o}
                                            onChange={(e) => setOptions((list) => list.map((x, j) => (j === i ? e.target.value : x)))}
                                            placeholder={`${i + 1}-variant`}
                                            maxLength={60}
                                            className={inputCls}
                                        />
                                        {options.length > 2 && (
                                            <button type="button" aria-label="O'chirish" onClick={() => setOptions((l) => l.filter((_, j) => j !== i))} className="px-3 rounded-xl text-text-muted hover:text-rose-500 cursor-pointer">
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {options.length < 5 && (
                                    <button type="button" onClick={() => setOptions((l) => [...l, ""])} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary cursor-pointer">
                                        <Plus className="w-4 h-4" /> Variant qo&apos;shish
                                    </button>
                                )}
                            </div>
                        )}
                        <Field label="Teglar" hint="Bo'sh joy bilan: fanart wallpaper">
                            <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputCls} />
                        </Field>
                    </Section>

                    <Section title="Kim ko'radi">
                        <Segmented
                            value={tier ?? "public"}
                            onChange={(v) => setTier(v === "public" ? null : v)}
                            options={[{ value: "public", label: "Hamma" }, ...club.tiers.map((t) => ({ value: t.id, label: `${t.name}+` }))]}
                        />
                        {tier && (
                            <>
                                <Toggle checked={early !== null} onChange={(v) => setEarly(v ? 4320 : null)} label="Erta kirish" desc="A'zolar oldin ko'radi, keyin post hamma uchun ochiladi" />
                                {early !== null && <Segmented value={early} onChange={setEarly} options={EARLY} />}
                                <Toggle checked={price !== null} onChange={(v) => setPrice(v ? 15000 : null)} label="Alohida sotish" desc="Obunasiz foydalanuvchi faqat shu postni sotib olishi mumkin" />
                                {price !== null && (
                                    <Field label="Narx, so'm">
                                        <input type="number" min={1000} step={1000} value={price} onChange={(e) => setPrice(Math.max(1000, Number(e.target.value) || 0))} className={inputCls} />
                                    </Field>
                                )}
                            </>
                        )}
                    </Section>

                    <Section title="Chiqarish">
                        <Toggle checked={!!schedule} onChange={(v) => setSchedule(v ? toLocal(Date.now() + 86_400_000) : "")} label="Rejalashtirish" desc="Post belgilangan vaqtda o'zi chiqadi" />
                        {schedule && <input type="datetime-local" value={schedule} onChange={(e) => setSchedule(e.target.value)} className={inputCls} />}
                    </Section>

                    <div className="flex gap-2">
                        <button type="button" disabled={!valid} onClick={save} className={`${primaryBtn} flex-1 sm:flex-none`}>
                            {existing ? "Saqlash" : schedule ? "Rejalashtirish" : "Chiqarish"}
                        </button>
                        <button type="button" onClick={() => router.back()} className={ghostBtn}>
                            Bekor qilish
                        </button>
                    </div>
                </div>

                <aside className="mt-6 xl:mt-0 xl:sticky xl:top-[88px]">
                    <p className="mb-3 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Ko&apos;rinishi</p>
                    <PostCard post={preview} />
                </aside>
            </div>
        </div>
    );
}

function toLocal(ms: number) {
    const d = new Date(ms - new Date().getTimezoneOffset() * 60000);
    return d.toISOString().slice(0, 16);
}
