"use client";

import { useState } from "react";
import Link from "next/link";
import { Award, Check, Coins, Download, Gift, LayoutDashboard, LogOut, MessageCircle, Package, PenLine, Radio, Sparkles, Ticket, WalletCards } from "lucide-react";
import { CREATORS, money } from "@/lib/club";
import { logout, updateAccount, useAccount, useActivity, usePayments, usePurchases, type PaymentKind } from "@/lib/account";
import { useMemberships, tenureOf } from "@/lib/membership";
import { findCreator, useMyClub } from "@/lib/studio";
import { ClubCard } from "@/components/club/ClubCard";
import { LoginPrompt } from "@/components/club/sheets";
import { panel } from "@/components/club/Tiles";

const KIND_LABEL: Record<PaymentKind, string> = {
    subscription: "Obuna",
    trial: "Sinov",
    gift: "Sovg'a",
    post: "Post",
    ticket: "Chipta",
    product: "Do'kon",
    donation: "Donat",
};

/** Profil: kartalar kolleksiyasi, yutuqlar, xaridlar, to'lovlar tarixi */
export default function ProfilePage() {
    const account = useAccount();
    const memberships = useMemberships();
    const payments = usePayments();
    const purchases = usePurchases();
    const activity = useActivity();
    const myClub = useMyClub();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(account?.name ?? "");

    if (!account) {
        return (
            <div className="max-w-md mx-auto w-full mt-10 bg-card-bg dark:bg-[#0a0a0a] rounded-3xl border border-border-sep card-shadow">
                <LoginPrompt text="Profil, kartalar kolleksiyasi va xaridlaringiz shu yerda" />
            </div>
        );
    }

    const maxTenure = Math.max(0, ...memberships.map((m) => tenureOf(m).months));
    const badges = [
        { id: "first", label: "Birinchi karta", desc: "Klubga qo'shiling", done: memberships.length > 0, Icon: WalletCards },
        { id: "collector", label: "Kolleksioner", desc: "3 ta klub kartasi", done: memberships.length >= 3, Icon: Sparkles },
        { id: "loyal", label: "Sodiq a'zo", desc: "3 oy bir klubda", done: maxTenure >= 3, Icon: Award },
        { id: "talker", label: "Suhbatdosh", desc: "5 ta izoh", done: activity.comments >= 5, Icon: MessageCircle },
        { id: "patron", label: "Homiy", desc: "Birinchi donat", done: activity.donations > 0, Icon: Coins },
        { id: "viewer", label: "Efir muxlisi", desc: "3 ta efirda bo'lish", done: activity.streams.length >= 3, Icon: Radio },
        { id: "creator", label: "Ijodkor", desc: "O'z klubingizni oching", done: !!myClub, Icon: PenLine },
    ];
    const products = CREATORS.flatMap((c) => (c.products ?? []).map((p) => ({ c, p }))).filter(({ p }) => purchases.products.includes(p.id));

    return (
        <div className="pb-10 space-y-6">
            {/* Sarlavha */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={account.avatar} alt="" className="w-20 h-20 rounded-3xl object-contain bg-primary/15 p-3" />
                <div className="flex-1 min-w-0">
                    {editing ? (
                        <form
                            className="flex gap-2"
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (name.trim().length >= 2) updateAccount({ name: name.trim() });
                                setEditing(false);
                            }}
                        >
                            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={24} aria-label="Ism" className="h-11 px-3.5 rounded-xl bg-foreground/[0.05] border border-border-sep text-text-main font-bold focus:outline-none focus:border-primary" />
                            <button type="submit" aria-label="Saqlash" className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center cursor-pointer">
                                <Check className="w-4 h-4" />
                            </button>
                        </form>
                    ) : (
                        <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-black text-text-main">
                            {account.name}
                            <button type="button" onClick={() => setEditing(true)} aria-label="Ismni o'zgartirish" className="p-1.5 rounded-lg text-text-muted hover:text-text-main cursor-pointer">
                                <PenLine className="w-4 h-4" />
                            </button>
                        </h1>
                    )}
                    <p className="text-sm font-mono text-text-muted">
                        @{account.handle} · {memberships.length} karta · {badges.filter((b) => b.done).length} yutuq
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href={myClub ? "/studio" : "/studio"} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-bold">
                        <LayoutDashboard className="w-4 h-4" /> {myClub ? "Studiya" : "Ijodkor bo'lish"}
                    </Link>
                    <button type="button" onClick={logout} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-sep text-sm font-bold text-text-muted hover:text-text-main cursor-pointer">
                        <LogOut className="w-4 h-4" /> Chiqish
                    </button>
                </div>
            </div>

            {/* Kolleksiya */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-black text-text-main">Kartalar kolleksiyasi</h2>
                    <Link href="/wallet" className="text-xs font-mono font-bold uppercase text-text-muted hover:text-primary">
                        Hamyon →
                    </Link>
                </div>
                {memberships.length === 0 ? (
                    <p className={`${panel} py-10 text-center text-sm text-text-muted`}>Hali karta yo&apos;q — klubga qo&apos;shiling</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {memberships.map((m) => {
                            const c = findCreator(m.creatorId);
                            const t = c?.tiers.find((x) => x.id === m.tierId);
                            return c && t ? (
                                <Link key={m.creatorId} href={`/${c.id}`}>
                                    <ClubCard creator={c} tier={t} member={m} />
                                </Link>
                            ) : null;
                        })}
                    </div>
                )}
            </section>

            {/* Yutuqlar */}
            <section>
                <h2 className="text-lg font-black text-text-main mb-3">Yutuqlar</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    {badges.map(({ id, label, desc, done, Icon }) => (
                        <div key={id} className={`${panel} p-4 text-center ${done ? "" : "opacity-45"}`} title={desc}>
                            <span className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center ${done ? "bg-gradient-to-br from-primary to-[oklch(0.7_0.15_340)] text-white" : "bg-foreground/[0.06] text-text-muted"}`}>
                                <Icon className="w-6 h-6" />
                            </span>
                            <p className="mt-2 text-xs font-black text-text-main">{label}</p>
                            <p className="text-[10px] text-text-muted">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="grid lg:grid-cols-2 gap-5">
                {/* Xaridlar */}
                <section className={`${panel} p-5`}>
                    <h2 className="font-black text-text-main mb-3">Xaridlar</h2>
                    {products.length === 0 && purchases.posts.length === 0 && purchases.tickets.length === 0 && purchases.gifts.length === 0 ? (
                        <p className="py-6 text-center text-sm text-text-muted">Hali xarid yo&apos;q</p>
                    ) : (
                        <div className="space-y-2">
                            {products.map(({ c, p }) => (
                                <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl bg-foreground/[0.03]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={p.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                    <span className="flex-1 min-w-0">
                                        <span className="block text-sm font-bold text-text-main truncate">{p.title}</span>
                                        <span className="block text-[11px] font-mono text-text-muted">{c.name}</span>
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold">
                                        {p.kind === "digital" ? <Download className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                                        {p.kind === "digital" ? "Yuklab olish" : "Yo'lda"}
                                    </span>
                                </div>
                            ))}
                            {purchases.posts.map((id) => (
                                <Link key={id} href={`/p/${id}`} className="flex items-center gap-3 p-2 rounded-xl bg-foreground/[0.03] hover:bg-foreground/[0.06]">
                                    <span className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                        <PenLine className="w-5 h-5" />
                                    </span>
                                    <span className="text-sm font-bold text-text-main">Sotib olingan post</span>
                                </Link>
                            ))}
                            {purchases.tickets.map((id) => (
                                <Link key={id} href={`/${id}/live`} className="flex items-center gap-3 p-2 rounded-xl bg-foreground/[0.03] hover:bg-foreground/[0.06]">
                                    <span className="w-12 h-12 rounded-lg bg-amber-400/15 text-amber-500 flex items-center justify-center">
                                        <Ticket className="w-5 h-5" />
                                    </span>
                                    <span className="text-sm font-bold text-text-main">Efir chiptasi · {findCreator(id)?.name}</span>
                                </Link>
                            ))}
                            {purchases.gifts.map((g) => (
                                <div key={g.code} className="flex items-center gap-3 p-2 rounded-xl bg-foreground/[0.03]">
                                    <span className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                        <Gift className="w-5 h-5" />
                                    </span>
                                    <span className="flex-1 min-w-0">
                                        <span className="block text-sm font-bold text-text-main">Sovg&apos;a: {findCreator(g.creatorId)?.name}</span>
                                        <span className="block text-[11px] font-mono text-text-muted">{g.code}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* To'lovlar */}
                <section className={`${panel} p-5`}>
                    <h2 className="font-black text-text-main mb-3">To&apos;lovlar tarixi</h2>
                    {payments.length === 0 ? (
                        <p className="py-6 text-center text-sm text-text-muted">Hali to&apos;lov yo&apos;q</p>
                    ) : (
                        <div className="divide-y divide-border-sep">
                            {payments.map((p) => (
                                <div key={p.id} className="flex items-center gap-3 py-2.5">
                                    <span className="shrink-0 w-16 text-[10px] font-mono font-bold uppercase text-text-muted">{KIND_LABEL[p.kind]}</span>
                                    <span className="flex-1 min-w-0">
                                        <span className="block text-sm text-text-main truncate">{p.title}</span>
                                        <span className="block text-[11px] font-mono text-text-muted">
                                            {new Date(p.at).toLocaleDateString("ru-RU")} · {p.method}
                                        </span>
                                    </span>
                                    <span className="font-mono text-sm font-bold text-text-main">{money(p.amount)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
