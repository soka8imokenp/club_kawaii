/** Sahifa yuklanayotganda — kontent shaklidagi skeleton */
export default function Loading() {
    const block = "rounded-2xl bg-foreground/[0.05] animate-pulse";
    return (
        <div className="space-y-4 pb-10" aria-busy="true" aria-label="Yuklanmoqda">
            <div className={`${block} h-48 sm:h-64`} />
            <div className="flex gap-4 items-center">
                <div className={`${block} w-20 h-20`} />
                <div className="flex-1 space-y-2">
                    <div className={`${block} h-6 w-1/3`} />
                    <div className={`${block} h-4 w-1/2`} />
                </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className={`${block} h-56`} />
                ))}
            </div>
        </div>
    );
}
