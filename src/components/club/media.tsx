"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import { createOpener } from "@/lib/store";

/* ================= Rasmni to'liq ekranda ko'rish ================= */
const lightbox = createOpener<{ images: string[]; index: number }>();
export const openLightbox = (images: string[], index = 0) => lightbox.open({ images, index });

const noop = () => () => {};

export function Lightbox() {
    const { open, props, key } = lightbox.use();
    const mounted = useSyncExternalStore(noop, () => true, () => false);
    if (!open || !props || !mounted) return null;
    return createPortal(<LightboxBody key={key} images={props.images} start={props.index} />, document.body);
}

function LightboxBody({ images, start }: { images: string[]; start: number }) {
    const [i, setI] = useState(start);
    const touch = useRef<number | null>(null);
    const n = images.length;
    const go = (d: number) => setI((x) => (x + d + n) % n);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") lightbox.close();
            if (e.key === "ArrowRight") setI((x) => (x + 1) % n);
            if (e.key === "ArrowLeft") setI((x) => (x - 1 + n) % n);
        };
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [n]);

    return (
        <div
            className="fixed inset-0 z-[1100] bg-black/95 flex items-center justify-center sheet-fade"
            role="dialog"
            aria-modal="true"
            aria-label="Rasm"
            onClick={() => lightbox.close()}
            onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
                if (touch.current === null) return;
                const dx = e.changedTouches[0].clientX - touch.current;
                if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
                touch.current = null;
            }}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={i} src={images[i]} alt="" className="max-w-[94vw] max-h-[86vh] object-contain rounded-lg rise" onClick={(e) => e.stopPropagation()} />
            <button type="button" aria-label="Yopish" className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center cursor-pointer hover:bg-white/20">
                <X className="w-5 h-5" />
            </button>
            {n > 1 && (
                <>
                    <button
                        type="button"
                        aria-label="Oldingi"
                        onClick={(e) => (e.stopPropagation(), go(-1))}
                        className="hidden sm:flex absolute left-4 w-11 h-11 rounded-full bg-white/10 text-white items-center justify-center cursor-pointer hover:bg-white/20"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        aria-label="Keyingi"
                        onClick={(e) => (e.stopPropagation(), go(1))}
                        className="hidden sm:flex absolute right-4 w-11 h-11 rounded-full bg-white/10 text-white items-center justify-center cursor-pointer hover:bg-white/20"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <span className="absolute bottom-5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-mono">
                        {i + 1} / {n}
                    </span>
                </>
            )}
        </div>
    );
}

/* ================= Video (post ichida) ================= */
/** Hozircha barcha videolar bitta namunaviy fayl; keyin — HLS */
export function VideoPlayer({ poster, duration }: { poster?: string; duration?: string }) {
    const [started, setStarted] = useState(false);
    if (!started) {
        return (
            <button type="button" onClick={() => setStarted(true)} className="group relative block w-full aspect-video bg-black cursor-pointer" aria-label="Videoni ijro etish">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {poster && <img src={poster} alt="" className="w-full h-full object-cover" />}
                <span className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/55 backdrop-blur flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 fill-current ml-1" />
                </span>
                {duration && <span className="absolute right-3 bottom-3 px-1.5 py-0.5 rounded bg-black/70 text-white text-[11px] font-mono">{duration}</span>}
            </button>
        );
    }
    return <video src="/media/stream.mp4" poster={poster} controls autoPlay playsInline className="w-full aspect-video bg-black" />;
}

/* ================= Audio ================= */
export function AudioPlayer({ cover, duration, seed }: { cover?: string; duration?: string; seed: number }) {
    const ref = useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const bars = 40;

    const toggle = () => {
        const a = ref.current;
        if (!a) return;
        if (a.paused) a.play().catch(() => {});
        else a.pause();
    };

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.04]">
            <audio
                ref={ref}
                src="/media/stream.mp4"
                preload="none"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
            />
            <button type="button" onClick={toggle} aria-label={playing ? "Pauza" : "Ijro etish"} className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {cover && <img src={cover} alt="" className="w-full h-full object-cover" />}
                <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white">
                    {playing ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                </span>
            </button>
            <div
                className="flex-1 flex items-center gap-[3px] h-9 cursor-pointer"
                onClick={(e) => {
                    const a = ref.current;
                    if (!a || !a.duration) return;
                    const r = e.currentTarget.getBoundingClientRect();
                    a.currentTime = ((e.clientX - r.left) / r.width) * a.duration;
                }}
            >
                {Array.from({ length: bars }, (_, i) => (
                    <span
                        key={i}
                        className={`flex-1 rounded-full transition-colors ${i / bars < progress ? "bg-primary" : "bg-primary/30"}`}
                        style={{ height: `${Math.round(25 + Math.abs(Math.sin(i * 1.7 + seed)) * 75)}%` }}
                    />
                ))}
            </div>
            <span className="text-xs font-mono text-text-muted">{duration}</span>
        </div>
    );
}
