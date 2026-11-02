import type { Metadata } from "next";
import { ClubChat } from "@/components/club/ClubChat";

export const metadata: Metadata = { title: "Klub chati • Kawaii Club" };

export default async function Page({ params }: { params: Promise<{ creator: string }> }) {
    return <ClubChat id={(await params).creator} />;
}
