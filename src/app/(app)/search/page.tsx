import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/components/club/SearchView";

export const metadata: Metadata = { title: "Qidiruv • Kawaii Club" };

export default function Page() {
    return (
        <Suspense>
            <SearchView />
        </Suspense>
    );
}
