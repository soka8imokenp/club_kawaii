import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CREATORS, creatorById } from "@/lib/club";
import { StreamView } from "@/components/club/stream/StreamView";

export function generateStaticParams() {
    return CREATORS.filter((c) => c.live).map((c) => ({ creator: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ creator: string }> }): Promise<Metadata> {
    const c = creatorById((await params).creator);
    return c?.live ? { title: `${c.live.title} • ${c.name}`, description: c.tagline } : {};
}

export default async function StreamPage({ params }: { params: Promise<{ creator: string }> }) {
    const c = creatorById((await params).creator);
    if (!c?.live) notFound();
    return <StreamView id={c.id} />;
}
