"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useSwipeDismiss } from "./useSwipeDismiss";
import { usePresence } from "./usePresence";

const noop = () => () => {};
const CLOSE_MS = 240;

interface SideDrawerProps {
    open: boolean;
    onClose: () => void;
    label: string;
    /** Sarlavha qatori; `close` — animatsiya bilan yopish */
    header?: (close: () => void) => React.ReactNode;
    footer?: React.ReactNode;
    wrapperClassName?: string;
    className?: string;
    children: React.ReactNode;
}

/** O'ngdan chiqadigan yon panel: o'ngga svayp, fonga bosish va Esc bilan yumshoq yopiladi. */
export function SideDrawer({ open, onClose, label, header, footer, wrapperClassName = "", className = "", children }: SideDrawerProps) {
    const mounted = useSyncExternalStore(noop, () => true, () => false);
    const { shown, closing } = usePresence(open, CLOSE_MS);
    const [dragX, setDragX] = useState(0);
    const [dragging, setDragging] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Yopish — ota-komponent `open`ni o'chiradi, animatsiyani usePresence o'ynaydi
    const close = () => onClose();
    const closeRef = useRef(close);
    useEffect(() => {
        closeRef.current = close;
    });

    useSwipeDismiss(panelRef, {
        axis: "x",
        enabled: open && mounted,
        onMove: (x) => {
            setDragging(true);
            setDragX(x);
        },
        onRelease: (dismiss) => {
            setDragging(false);
            if (dismiss) closeRef.current();
            else setDragX(0);
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
    if (!shown && dragX !== 0) setDragX(0);
    if (!shown || !mounted) return null;

    return createPortal(
        <div className={`fixed inset-0 z-[1000] flex justify-end font-sans ${wrapperClassName}`} role="dialog" aria-modal="true" aria-label={label}>
            <button
                type="button"
                aria-label="Yopish"
                onClick={() => close()}
                className="sheet-fade absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default transition-opacity duration-300"
                style={{ opacity: closing ? 0 : Math.max(0.2, 1 - dragX / 400) }}
            />
            <div className="sheet-left relative h-full w-[82vw] max-w-sm">
                <div
                    ref={panelRef}
                    className={`flex flex-col h-full bg-card-bg dark:bg-black border-l border-border-sep dark:border-transparent theme-transition touch-pan-y ${className}`}
                    style={{
                        transform: closing ? "translateX(100%)" : `translateX(${dragX}px)`,
                        transition: dragging ? "none" : `transform ${CLOSE_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
                        paddingBottom: "env(safe-area-inset-bottom)",
                    }}
                >
                    {header && <div className="shrink-0">{header(close)}</div>}
                    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar overscroll-contain">{children}</div>
                    {footer && <div className="shrink-0">{footer}</div>}
                </div>
            </div>
        </div>,
        document.body,
    );
}
