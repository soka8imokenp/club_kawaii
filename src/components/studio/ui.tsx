"use client";

import { useRef } from "react";
import { Check, ImagePlus } from "lucide-react";
import { img } from "@/lib/club";

export const SAMPLE_IMAGES = [
    "mascot",
    "ado-elf",
    "Hatsune Miku - Magical cure",
    "Sakanaction - Kaiju",
    "Sekai no owari - Stella",
    "Hatsune Mike feat. Kasane Teto - numb numb",
    "Hatsuna Miku - Rolling Girl",
    "Ado - Kaze no Yukue",
    "Mafumafu - Hated by Life Itself",
    "Zutomayo - Byoushin wo Kamu",
    "pathway",
].map(img);

export const inputCls =
    "w-full h-11 px-3.5 rounded-xl bg-foreground/[0.04] border border-border-sep text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="block mb-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">{label}</span>
            {children}
            {hint && <span className="block mt-1 text-[11px] text-text-muted">{hint}</span>}
        </label>
    );
}

export function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
    return (
        <section className="bg-card-bg dark:bg-[#0a0a0a] rounded-2xl border border-border-sep dark:border-white/[0.06] card-shadow p-4 sm:p-5 space-y-4">
            <div>
                <h2 className="font-black text-text-main">{title}</h2>
                {desc && <p className="text-xs text-text-muted mt-0.5">{desc}</p>}
            </div>
            {children}
        </section>
    );
}

export function Segmented<T extends string | number>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; hint?: string }[] }) {
    return (
        <div className="grid gap-1 p-1 rounded-xl bg-foreground/[0.05]" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
            {options.map((o) => (
                <button
                    key={String(o.value)}
                    type="button"
                    onClick={() => onChange(o.value)}
                    className={`py-2 px-1 rounded-lg text-xs sm:text-sm font-bold cursor-pointer transition-all leading-tight ${value === o.value ? "bg-card-bg text-text-main shadow-sm" : "text-text-muted hover:text-text-main"}`}
                >
                    {o.label}
                    {o.hint && <span className="block text-[10px] font-mono font-normal text-text-muted">{o.hint}</span>}
                </button>
            ))}
        </div>
    );
}

export function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
    return (
        <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="w-full flex items-center gap-3 text-left cursor-pointer">
            <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-text-main">{label}</span>
                {desc && <span className="block text-xs text-text-muted">{desc}</span>}
            </span>
            <span className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-foreground/15"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
            </span>
        </button>
    );
}

/** Rasmni kichraytirib data URL qilish (brauzer xotirasiga sig'sin) */
export function fileToDataUrl(file: File, max = 1200): Promise<string> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const im = new Image();
        im.onload = () => {
            const scale = Math.min(1, max / Math.max(im.width, im.height));
            const cv = document.createElement("canvas");
            cv.width = Math.round(im.width * scale);
            cv.height = Math.round(im.height * scale);
            cv.getContext("2d")!.drawImage(im, 0, 0, cv.width, cv.height);
            URL.revokeObjectURL(url);
            resolve(cv.toDataURL("image/jpeg", 0.82));
        };
        im.onerror = reject;
        im.src = url;
    });
}

/** Rasm tanlash: namunalar yoki o'z faylingiz */
export function ImagePicker({ value, onChange, multiple = false, square = false }: { value: string[]; onChange: (v: string[]) => void; multiple?: boolean; square?: boolean }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const toggle = (src: string) => {
        if (!multiple) return onChange([src]);
        onChange(value.includes(src) ? value.filter((x) => x !== src) : [...value, src].slice(0, 8));
    };
    const uploads = value.filter((v) => !SAMPLE_IMAGES.includes(v));

    return (
        <div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className={`shrink-0 ${square ? "w-16 h-16" : "w-24 h-16"} rounded-xl border-2 border-dashed border-border-sep text-text-muted hover:text-primary hover:border-primary/50 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors`}
                >
                    <ImagePlus className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Yuklash</span>
                </button>
                {[...uploads, ...SAMPLE_IMAGES].map((src) => {
                    const on = value.includes(src);
                    return (
                        <button
                            key={src.slice(0, 80)}
                            type="button"
                            onClick={() => toggle(src)}
                            className={`relative shrink-0 ${square ? "w-16 h-16" : "w-24 h-16"} rounded-xl overflow-hidden cursor-pointer ring-2 transition-all ${on ? "ring-primary" : "ring-transparent opacity-80 hover:opacity-100"}`}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" className="w-full h-full object-cover" />
                            {on && (
                                <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                                    {multiple ? <span className="text-[10px] font-black">{value.indexOf(src) + 1}</span> : <Check className="w-3 h-3" />}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple={multiple}
                hidden
                onChange={async (e) => {
                    const files = Array.from(e.target.files ?? []);
                    const urls = await Promise.all(files.map((f) => fileToDataUrl(f, square ? 400 : 1200)));
                    onChange(multiple ? [...value, ...urls].slice(0, 8) : urls.slice(0, 1));
                    e.target.value = "";
                }}
            />
        </div>
    );
}

export const primaryBtn =
    "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold cursor-pointer active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none";
export const ghostBtn = "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border-sep text-sm font-bold text-text-main hover:border-primary/40 cursor-pointer transition-colors";
