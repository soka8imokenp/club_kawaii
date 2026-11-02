"use client";

import { useState } from "react";
import { Crown, Heart, Lock, Send } from "lucide-react";
import { agoLabel, seedComments, type Comment, type Post } from "@/lib/club";
import { timeAgo, track, useAccount } from "@/lib/account";
import { useMembership } from "@/lib/membership";
import { useCanSee, useCreator, useMyClub } from "@/lib/studio";
import { createStore, uid } from "@/lib/store";
import { openLogin } from "./sheets";

/** Foydalanuvchi yozgan izohlar (post id → izohlar) */
const commentsStore = createStore<Record<string, Comment[]>>("club.comments", {});

/** Post izohlari: javoblar bir daraja, ijodkor javoblari ajralib turadi */
export function Comments({ post }: { post: Post }) {
    const account = useAccount();
    const creator = useCreator(post.creatorId);
    const myClub = useMyClub();
    const member = useMembership(post.creatorId);
    const canSee = useCanSee();
    const mine = commentsStore.use()[post.id] ?? [];
    const [liked, setLiked] = useState<Set<string>>(new Set());
    const [replyTo, setReplyTo] = useState<Comment | null>(null);

    if (!creator) return null;
    const isAuthor = myClub?.id === post.creatorId;
    const all = [...(post.at ? [] : seedComments(post)), ...mine];
    const roots = all.filter((c) => !c.parentId);
    const replies = (id: string) => all.filter((c) => c.parentId === id);
    const allowed = canSee(post);
    const myTier = member && creator.tiers.find((t) => t.id === member.tierId)?.name;

    const add = (text: string, parentId?: string) => {
        if (!account) return;
        const c: Comment = {
            id: uid(),
            postId: post.id,
            name: isAuthor ? creator.name : account.name,
            avatar: isAuthor ? creator.avatar : account.avatar,
            text,
            agoMin: 0,
            at: Date.now(),
            likes: 0,
            parentId,
            tier: isAuthor ? undefined : myTier,
            creator: isAuthor,
            me: true,
        };
        commentsStore.set((s) => ({ ...s, [post.id]: [...(s[post.id] ?? []), c] }));
        track((a) => ({ ...a, comments: a.comments + 1 }));
        setReplyTo(null);
    };

    const toggleLike = (id: string) =>
        setLiked((s) => {
            const n = new Set(s);
            if (n.has(id)) n.delete(id);
            else n.add(id);
            return n;
        });

    const item = (c: Comment, reply = false) => (
        <div key={c.id} className={`flex gap-3 ${reply ? "mt-3" : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.avatar} alt="" className={`${reply ? "w-8 h-8" : "w-10 h-10"} rounded-xl object-cover shrink-0 bg-foreground/5`} />
            <div className="flex-1 min-w-0">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                    <b className={c.creator ? "text-primary" : "text-text-main"}>{c.name}</b>
                    {c.creator && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-px rounded bg-primary/12 text-primary text-[10px] font-mono font-bold uppercase">
                            <Crown className="w-3 h-3" /> Muallif
                        </span>
                    )}
                    {c.tier && <span className="px-1.5 py-px rounded bg-foreground/[0.06] text-text-muted text-[10px] font-mono font-bold uppercase">{c.tier}</span>}
                    <span className="text-xs font-mono text-text-muted">{c.at ? timeAgo(c.at) : agoLabel(c.agoMin)}</span>
                </p>
                <p className="mt-0.5 text-sm text-text-main leading-relaxed break-words">{c.text}</p>
                <div className="mt-1 flex items-center gap-3 text-xs font-bold">
                    <button type="button" onClick={() => toggleLike(c.id)} className={`inline-flex items-center gap-1 cursor-pointer transition-colors ${liked.has(c.id) ? "text-rose-500" : "text-text-muted hover:text-text-main"}`}>
                        <Heart className={`w-3.5 h-3.5 ${liked.has(c.id) ? "fill-current" : ""}`} />
                        {c.likes + (liked.has(c.id) ? 1 : 0)}
                    </button>
                    {!reply && allowed && (
                        <button type="button" onClick={() => (account ? setReplyTo(c) : openLogin())} className="text-text-muted hover:text-text-main cursor-pointer">
                            Javob berish
                        </button>
                    )}
                </div>
                {!reply && replies(c.id).map((r) => item(r, true))}
                {!reply && replyTo?.id === c.id && <CommentInput autoFocus placeholder={`${c.name}ga javob…`} onSend={(t) => add(t, c.id)} onCancel={() => setReplyTo(null)} />}
            </div>
        </div>
    );

    return (
        <section id="izohlar" className="bg-card-bg dark:bg-[#0a0a0a] rounded-2xl border border-border-sep dark:border-white/[0.06] card-shadow p-4 sm:p-5 scroll-mt-24">
            <h2 className="font-black text-text-main">
                Izohlar <span className="text-text-muted font-mono text-sm">{post.comments + mine.length}</span>
            </h2>

            <div className="mt-4">
                {!account ? (
                    <button type="button" onClick={openLogin} className="w-full py-3 rounded-xl bg-foreground/[0.05] text-sm font-bold text-text-muted hover:text-text-main cursor-pointer transition-colors">
                        Izoh yozish uchun kiring
                    </button>
                ) : allowed ? (
                    <CommentInput placeholder="Izoh yozing…" onSend={(t) => add(t)} />
                ) : (
                    <p className="flex items-center justify-center gap-2 py-3 rounded-xl bg-foreground/[0.04] text-sm text-text-muted">
                        <Lock className="w-4 h-4" /> Izohlar post ochilgandan keyin
                    </p>
                )}
            </div>

            <div className="mt-5 space-y-5">
                {roots.map((c) => item(c))}
                {roots.length === 0 && <p className="text-center text-sm text-text-muted py-4">Hali izoh yo&apos;q — birinchi bo&apos;ling</p>}
            </div>
        </section>
    );
}

function CommentInput({ placeholder, onSend, onCancel, autoFocus }: { placeholder: string; onSend: (t: string) => void; onCancel?: () => void; autoFocus?: boolean }) {
    const [text, setText] = useState("");
    return (
        <form
            className="mt-2 flex items-center gap-2"
            onSubmit={(e) => {
                e.preventDefault();
                const t = text.trim();
                if (!t) return;
                onSend(t);
                setText("");
            }}
        >
            <input
                autoFocus={autoFocus}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && onCancel?.()}
                placeholder={placeholder}
                maxLength={1000}
                aria-label={placeholder}
                className="flex-1 min-w-0 h-11 px-3.5 rounded-xl bg-foreground/[0.05] text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:bg-foreground/[0.08] transition-colors"
            />
            <button type="submit" disabled={!text.trim()} aria-label="Yuborish" className="shrink-0 w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center cursor-pointer disabled:bg-foreground/[0.06] disabled:text-text-muted">
                <Send className="w-4 h-4" />
            </button>
        </form>
    );
}
