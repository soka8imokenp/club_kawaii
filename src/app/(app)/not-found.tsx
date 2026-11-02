import Link from "next/link";

export default function NotFound() {
    return (
        <div className="py-24 text-center">
            <p className="text-7xl font-black text-primary/30 font-mono">404</p>
            <h1 className="mt-3 text-xl font-black text-text-main">Bu sahifa klubda yo&apos;q</h1>
            <p className="mt-1 text-sm text-text-muted">Havola eskirgan yoki sahifa ko&apos;chirilgan</p>
            <div className="mt-6 flex justify-center gap-2">
                <Link href="/" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold">
                    Bosh sahifa
                </Link>
                <Link href="/creators" className="px-5 py-2.5 rounded-xl border border-border-sep text-sm font-bold text-text-main">
                    Ijodkorlar
                </Link>
            </div>
        </div>
    );
}
