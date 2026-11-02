"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useSwipeDismiss } from "./useSwipeDismiss";
import { usePresence } from "./usePresence";

const noop = () => () => {};
// sm+ — markazdagi oddiy oyna (dastak va svayp yo'q, yopish tugmasi bor)
const smQuery = "(min-width: 640px)";
function subscribeSm(cb: () => void) {
    const mq = window.matchMedia(smQuery);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
}
const CLOSE_MS = 260;

interface BottomSheetProps {
    open: boolean;
    onClose: () => void;
    label: string;
    /** Dastak ostidagi sarlavha — u ham tortish zonasi */
    title?: React.ReactNode;
    /** Katta ekranda (sm+) markazda ko'rsatish */
    centerOnDesktop?: boolean;
    /** Katta ekranda keng oyna (masalan, ikki ustunli tanlov) */
    wide?: boolean;
    /** Katta ekrandagi kenglik (masalan, "sm:max-w-3xl") — `wide`dan ustun */
    widthClass?: string;
    /** Tashqi qatlamga qo'shimcha klasslar (masalan, "lg:hidden") */
    wrapperClassName?: string;
    className?: string;
    children: React.ReactNode;
}

/**
 * Pastdan chiqadigan panel: yumshoq ochiladi/yopiladi, pastga tortib (svayp) yopiladi,
 * fonga bosish va Esc ham yopadi. Yopish tugmasi yo'q — mobil ilovalardagidek.
 */
export function BottomSheet({ open, onClose, label, title, centerOnDesktop = true, wide = false, widthClass, wrapperClassName = "", className = "", children }: BottomSheetProps) {
    const mounted = useSyncExternalStore(noop, () => true, () => false);
    const { shown, closing } = usePresence(open, CLOSE_MS);
    const [dragY, setDragY] = useState(0);
    const [dragging, setDragging] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const isSm = useSyncExternalStore(subscribeSm, () => window.matchMedia(smQuery).matches, () => false);
    // Katta ekranda markazlashgan oyna — telefon uslubidagi panel emas
    const modal = centerOnDesktop && isSm;

    // Yopish — ota-komponent `open`ni o'chiradi, animatsiyani usePresence o'ynaydi
    const close = () => onClose();
    // Esc va svayp tinglovchilari uchun eng so'nggi close
    const closeRef = useRef(close);
    useEffect(() => {
        closeRef.current = close;
    });

    useSwipeDismiss(panelRef, {
        axis: "y",
        enabled: open && mounted && !modal,
        onMove: (y) => {
            setDragging(true);
            setDragY(y);
        },
        onRelease: (dismiss) => {
            setDragging(false);
            if (dismiss) closeRef.current();
            else setDragY(0);
        },
    });

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    // Yopilgandan keyin keyingi ochilish uchun siljishni tiklash
    if (!shown && dragY !== 0) setDragY(0);
    if (!shown || !mounted) return null;

    const transform = modal ? (closing ? "scale(0.96)" : "none") : `translateY(${closing ? "100%" : `${dragY}px`})`;

    return createPortal(
        <div
            className={`fixed inset-0 z-[1000] flex items-end font-sans ${centerOnDesktop ? "sm:items-center" : ""} justify-center ${wrapperClassName}`}
            role="dialog"
            aria-modal="true"
            aria-label={label}
        >
            <button
                type="button"
                aria-label="Yopish"
                onClick={() => close()}
                className="sheet-fade absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default transition-opacity duration-300"
                style={{ opacity: closing ? 0 : Math.max(0.2, 1 - dragY / 500) }}
            />
            {/* Kirish animatsiyasi tashqi qatlamda — ichki transform (tortish) bilan to'qnashmasin */}
            <div className={`${modal ? "sheet-pop" : "sheet-up"} relative w-full flex justify-center ${centerOnDesktop ? (widthClass ?? (wide ? "sm:max-w-4xl lg:max-w-6xl" : "sm:max-w-md")) : "max-w-lg"}`}>
                <div
                    ref={panelRef}
                    className={`relative flex flex-col w-full max-h-[90svh] rounded-t-3xl bg-card-bg dark:bg-[#0c0c12] border border-b-0 border-border-sep dark:border-primary/20 overflow-hidden theme-transition ${
                        centerOnDesktop ? "sm:rounded-3xl sm:border-b" : ""
                    } ${className}`}
                    style={{
                        transform,
                        opacity: modal && closing ? 0 : 1,
                        transition: dragging ? "none" : `transform ${CLOSE_MS}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${CLOSE_MS}ms ease`,
                        paddingBottom: "env(safe-area-inset-bottom)",
                    }}
                >
                    {modal ? (
                        <button
                            type="button"
                            onClick={() => close()}
                            aria-label="Yopish"
                            className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-foreground/[0.06] text-text-muted hover:text-text-main hover:bg-foreground/10 flex items-center justify-center cursor-pointer transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    ) : (
                        /* Tortish dastagi */
                        <div className="shrink-0 pt-2.5 pb-1 cursor-grab active:cursor-grabbing" aria-hidden>
                            <span className="block mx-auto h-1 w-10 rounded-full bg-foreground/20" />
                        </div>
                    )}
                    {title && <div className={`shrink-0 px-5 pb-2 ${modal ? "pt-5 pr-16" : "pt-2"}`}>{title}</div>}
                    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar overscroll-contain">{children}</div>
                </div>
            </div>
        </div>,
        document.body,
    );
}
