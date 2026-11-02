"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash2 } from "lucide-react";
import { CATEGORIES, type Creator, type Product } from "@/lib/club";
import { myClubStore, myLiveStore, myPostsStore, updateClub, useMyClub } from "@/lib/studio";
import { uid } from "@/lib/store";
import { Field, ImagePicker, Section, Segmented, Toggle, inputCls, primaryBtn } from "./ui";

const HUES = [295, 345, 20, 75, 160, 220, 250];

/** Klub profili, maqsad va do'kon */
export function ClubSettings() {
    const club = useMyClub()!;
    const router = useRouter();
    const [c, setC] = useState<Creator>(club);
    const [saved, setSaved] = useState(false);
    const set = (p: Partial<Creator>) => {
        setSaved(false);
        setC((x) => ({ ...x, ...p }));
    };
    const products = c.products ?? [];
    const setProduct = (i: number, p: Partial<Product>) => set({ products: products.map((x, j) => (j === i ? { ...x, ...p } : x)) });

    return (
        <div className="space-y-4 max-w-3xl">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-black text-text-main">Sozlamalar</h1>
                <button
                    type="button"
                    onClick={() => {
                        updateClub({ ...c, products: products.filter((p) => p.title.trim()) });
                        setSaved(true);
                    }}
                    className={primaryBtn}
                >
                    {saved && <Check className="w-4 h-4" />} {saved ? "Saqlandi" : "Saqlash"}
                </button>
            </div>

            <Section title="Profil">
                <Field label="Nomi">
                    <input value={c.name} onChange={(e) => set({ name: e.target.value })} maxLength={32} className={inputCls} />
                </Field>
                <Field label="Qisqa tavsif">
                    <input value={c.tagline} onChange={(e) => set({ tagline: e.target.value })} maxLength={90} className={inputCls} />
                </Field>
                <Field label="Klub haqida">
                    <textarea value={c.about} onChange={(e) => set({ about: e.target.value })} rows={5} maxLength={2000} className={`${inputCls} h-auto py-3 resize-y`} />
                </Field>
                <Field label="Kategoriya">
                    <Segmented value={c.category} onChange={(v) => set({ category: v })} options={CATEGORIES.map((x) => ({ value: x.id, label: x.label }))} />
                </Field>
                <div>
                    <span className="block mb-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Avatar</span>
                    <ImagePicker value={[c.avatar]} onChange={(v) => v[0] && set({ avatar: v[0] })} square />
                </div>
                <div>
                    <span className="block mb-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Banner</span>
                    <ImagePicker value={[c.banner]} onChange={(v) => v[0] && set({ banner: v[0] })} />
                </div>
                <div>
                    <span className="block mb-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Karta rangi</span>
                    <div className="flex gap-2">
                        {HUES.map((h) => (
                            <button
                                key={h}
                                type="button"
                                onClick={() => set({ hue: h })}
                                aria-label={`Rang ${h}`}
                                className={`w-9 h-9 rounded-full cursor-pointer ring-2 ring-offset-2 ring-offset-page-bg ${c.hue === h ? "ring-primary" : "ring-transparent"}`}
                                style={{ background: `oklch(0.55 0.16 ${h})` }}
                            />
                        ))}
                    </div>
                </div>
            </Section>

            <Section title="Maqsad" desc="A'zolar va mehmonlar maqsadga donat qilishi mumkin">
                <Toggle checked={!!c.goal} onChange={(v) => set({ goal: v ? { title: "Yangi mikrofon", current: 0, target: 3_000_000 } : undefined })} label="Maqsadni ko'rsatish" />
                {c.goal && (
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Nima uchun">
                            <input value={c.goal.title} onChange={(e) => set({ goal: { ...c.goal!, title: e.target.value } })} className={inputCls} />
                        </Field>
                        <Field label="Kerakli summa, so'm">
                            <input type="number" min={10000} step={10000} value={c.goal.target} onChange={(e) => set({ goal: { ...c.goal!, target: Number(e.target.value) || 0 } })} className={inputCls} />
                        </Field>
                    </div>
                )}
            </Section>

            <Section title="Do'kon" desc="Raqamli fayllar yoki yetkazib beriladigan mahsulotlar">
                {products.map((p, i) => (
                    <div key={p.id} className="p-3 rounded-xl border border-border-sep space-y-3">
                        <div className="grid sm:grid-cols-[1fr_140px] gap-3">
                            <input value={p.title} onChange={(e) => setProduct(i, { title: e.target.value })} placeholder="Mahsulot nomi" className={inputCls} />
                            <input type="number" min={1000} step={1000} value={p.price} onChange={(e) => setProduct(i, { price: Number(e.target.value) || 0 })} className={inputCls} />
                        </div>
                        <input value={p.desc} onChange={(e) => setProduct(i, { desc: e.target.value })} placeholder="Qisqa tavsif" className={inputCls} />
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <Segmented
                                    value={p.kind}
                                    onChange={(v) => setProduct(i, { kind: v })}
                                    options={[
                                        { value: "digital", label: "Raqamli" },
                                        { value: "physical", label: "Yetkazib berish" },
                                    ]}
                                />
                            </div>
                            <button type="button" aria-label="O'chirish" onClick={() => set({ products: products.filter((_, j) => j !== i) })} className="p-2.5 rounded-lg text-text-muted hover:text-rose-500 cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <ImagePicker value={[p.image]} onChange={(v) => v[0] && setProduct(i, { image: v[0] })} />
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => set({ products: [...products, { id: `p-${uid()}`, title: "", kind: "digital", price: 20000, image: c.banner, desc: "" }] })}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-primary cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> Mahsulot qo&apos;shish
                </button>
            </Section>

            <Section title="Xavfli zona">
                <button
                    type="button"
                    onClick={() => {
                        if (!confirm("Klubni yopasizmi? Postlar va sozlamalar o'chadi.")) return;
                        myLiveStore.set(null);
                        myPostsStore.set([]);
                        myClubStore.set(null);
                        router.push("/");
                    }}
                    className="px-4 py-2.5 rounded-xl border border-rose-500/40 text-rose-500 text-sm font-bold hover:bg-rose-500/10 cursor-pointer"
                >
                    Klubni yopish
                </button>
            </Section>
        </div>
    );
}
