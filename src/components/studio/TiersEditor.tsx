"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Check, Plus, Trash2, X } from "lucide-react";
import type { Tier } from "@/lib/club";
import { updateClub, useMyClub } from "@/lib/studio";
import { uid } from "@/lib/store";
import { ClubCard } from "@/components/club/ClubCard";
import { Field, Section, Toggle, inputCls, primaryBtn } from "./ui";

/** Tariflar = klub kartalari: nom, narx, imtiyozlar, o'rinlar; sinov muddati */
export function TiersEditor() {
    const club = useMyClub()!;
    const [tiers, setTiers] = useState<Tier[]>(club.tiers);
    const [trial, setTrial] = useState(club.trial ?? null);
    const [active, setActive] = useState(0);
    const [saved, setSaved] = useState(false);

    const t = tiers[Math.min(active, tiers.length - 1)];
    const patch = (p: Partial<Tier>) => {
        setSaved(false);
        setTiers((list) => list.map((x, i) => (i === active ? { ...x, ...p } : x)));
    };
    const move = (d: number) => {
        const j = active + d;
        if (j < 0 || j >= tiers.length) return;
        setTiers((list) => {
            const n = [...list];
            [n[active], n[j]] = [n[j], n[active]];
            return n;
        });
        setActive(j);
    };
    // Tariflar narx bo'yicha o'sib borishi kerak — kirish huquqi tartibga bog'liq
    const ordered = tiers.every((x, i) => i === 0 || x.price >= tiers[i - 1].price);
    const valid = tiers.length > 0 && tiers.every((x) => x.name.trim() && x.price >= 1000) && ordered;

    return (
        <div>
            <div className="flex items-center justify-between gap-3 mb-5">
                <h1 className="text-2xl font-black text-text-main">Tariflar va kartalar</h1>
                <button
                    type="button"
                    disabled={!valid}
                    onClick={() => {
                        updateClub({ tiers: tiers.map((x) => ({ ...x, perks: x.perks.filter((p) => p.trim()) })), trial: trial ?? undefined });
                        setSaved(true);
                    }}
                    className={primaryBtn}
                >
                    {saved ? <Check className="w-4 h-4" /> : null}
                    {saved ? "Saqlandi" : "Saqlash"}
                </button>
            </div>

            {/* Kartalar qatori */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
                {tiers.map((x, i) => (
                    <button key={x.id} type="button" onClick={() => setActive(i)} className={`shrink-0 w-56 rounded-2xl p-1.5 cursor-pointer transition-all ${i === active ? "bg-primary/15 ring-2 ring-primary" : "opacity-70 hover:opacity-100"}`}>
                        <ClubCard creator={{ ...club, tiers }} tier={x} tilt={false} />
                    </button>
                ))}
                {tiers.length < 5 && (
                    <button
                        type="button"
                        onClick={() => {
                            const last = tiers[tiers.length - 1];
                            setTiers((l) => [...l, { id: `t-${uid().slice(0, 5)}`, name: "Yangi tarif", price: (last?.price ?? 10000) + 20000, perks: ["Hammasi"], members: 0 }]);
                            setActive(tiers.length);
                        }}
                        className="shrink-0 w-56 aspect-[1.586] self-center rounded-2xl border-2 border-dashed border-border-sep text-text-muted hover:text-primary hover:border-primary/50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                        <Plus className="w-6 h-6" />
                        <span className="text-xs font-bold">Tarif qo&apos;shish</span>
                    </button>
                )}
            </div>
            {!ordered && <p className="mt-2 text-xs text-rose-500">Har bir keyingi tarif oldingisidan qimmatroq bo&apos;lsin — yuqori tarif pastdagilarning hammasini ochadi.</p>}

            {t && (
                <div className="mt-5 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
                    <div className="space-y-4">
                        <Section title={`${active + 1}-daraja`} desc="Yuqori daraja pastdagi barcha postlar va efirlarni ham ochadi">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Field label="Nomi">
                                    <input value={t.name} onChange={(e) => patch({ name: e.target.value })} maxLength={20} className={inputCls} />
                                </Field>
                                <Field label="Narx, so'm/oy">
                                    <input type="number" min={1000} step={1000} value={t.price} onChange={(e) => patch({ price: Number(e.target.value) || 0 })} className={inputCls} />
                                </Field>
                            </div>
                            <Toggle checked={!!t.limit} onChange={(v) => patch({ limit: v ? Math.max(t.members + 10, 50) : undefined })} label="O'rinlar cheklangan" desc="Kam joy — kartani qimmatliroq qiladi" />
                            {t.limit && (
                                <Field label="O'rinlar soni">
                                    <input type="number" min={1} value={t.limit} onChange={(e) => patch({ limit: Math.max(1, Number(e.target.value) || 1) })} className={inputCls} />
                                </Field>
                            )}
                            <div className="space-y-2">
                                <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Imtiyozlar</span>
                                {t.perks.map((p, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            value={p}
                                            onChange={(e) => patch({ perks: t.perks.map((x, j) => (j === i ? e.target.value : x)) })}
                                            maxLength={60}
                                            placeholder="Masalan: Qismlar 3 kun oldin"
                                            className={inputCls}
                                        />
                                        <button type="button" aria-label="O'chirish" onClick={() => patch({ perks: t.perks.filter((_, j) => j !== i) })} className="px-3 rounded-xl text-text-muted hover:text-rose-500 cursor-pointer">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {t.perks.length < 6 && (
                                    <button type="button" onClick={() => patch({ perks: [...t.perks, ""] })} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary cursor-pointer">
                                        <Plus className="w-4 h-4" /> Imtiyoz qo&apos;shish
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1">
                                <button type="button" onClick={() => move(-1)} disabled={active === 0} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border-sep text-xs font-bold text-text-main disabled:opacity-40 cursor-pointer">
                                    <ArrowUp className="w-3.5 h-3.5" /> Pastroq daraja
                                </button>
                                <button type="button" onClick={() => move(1)} disabled={active === tiers.length - 1} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border-sep text-xs font-bold text-text-main disabled:opacity-40 cursor-pointer">
                                    <ArrowDown className="w-3.5 h-3.5" /> Yuqoriroq daraja
                                </button>
                                <button
                                    type="button"
                                    disabled={tiers.length <= 1 || t.members > 0}
                                    onClick={() => {
                                        setTiers((l) => l.filter((_, i) => i !== active));
                                        setActive(0);
                                    }}
                                    title={t.members > 0 ? "A'zolari bor tarifni o'chirib bo'lmaydi" : undefined}
                                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border-sep text-xs font-bold text-rose-500 disabled:opacity-40 cursor-pointer ml-auto"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> O&apos;chirish
                                </button>
                            </div>
                        </Section>

                        <Section title="Sinov muddati" desc="Yangi a'zolar klubni arzon narxda sinab ko'radi, keyin oylik to'lov yechiladi">
                            <Toggle checked={!!trial} onChange={(v) => setTrial(v ? { days: 7, price: 1000 } : null)} label="Sinov muddatini yoqish" />
                            {trial && (
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Kun">
                                        <input type="number" min={1} max={30} value={trial.days} onChange={(e) => setTrial({ ...trial, days: Math.min(30, Math.max(1, Number(e.target.value) || 1)) })} className={inputCls} />
                                    </Field>
                                    <Field label="Narx, so'm">
                                        <input type="number" min={0} step={500} value={trial.price} onChange={(e) => setTrial({ ...trial, price: Math.max(0, Number(e.target.value) || 0) })} className={inputCls} />
                                    </Field>
                                </div>
                            )}
                        </Section>
                    </div>

                    <aside className="hidden lg:block sticky top-[88px]">
                        <p className="mb-3 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">Karta</p>
                        <ClubCard creator={{ ...club, tiers }} tier={t} />
                        <ul className="mt-4 space-y-1.5">
                            {t.perks.filter(Boolean).map((p) => (
                                <li key={p} className="flex items-start gap-2 text-sm text-text-main">
                                    <Check className="w-4 h-4 mt-0.5 text-primary shrink-0" /> {p}
                                </li>
                            ))}
                        </ul>
                    </aside>
                </div>
            )}
        </div>
    );
}
