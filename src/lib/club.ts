// club.kawaii uchun vaqtinchalik ma'lumotlar: ijodkorlar, klub tariflari, postlar, efirlar.
// Keyinchalik API bilan almashtiriladi.

export const img = (name: string) => `/images/${encodeURIComponent(name)}.webp`;
const face = (id: string) => `https://images.unsplash.com/${id}?q=80&w=240&h=240&auto=format&fit=crop`;

export const CATEGORIES = [
    { id: "dublyaj", label: "Dublyaj" },
    { id: "fanart", label: "Fanart" },
    { id: "musiqa", label: "Musiqa" },
    { id: "cosplay", label: "Cosplay" },
    { id: "manga", label: "Manga" },
    { id: "podcast", label: "Podkast" },
] as const;
export type CategoryId = (typeof CATEGORIES)[number]["id"];
export const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!.label;

export interface Tier {
    id: string;
    name: string;
    /** Oylik narx (so'm) */
    price: number;
    perks: string[];
    members: number;
    /** O'rinlar soni cheklangan bo'lsa */
    limit?: number;
}

export interface LiveStream {
    title: string;
    viewers: number;
    /** Necha daqiqa oldin boshlangan */
    startedMin: number;
    /** Faqat shu tarif (va undan yuqori) a'zolari uchun; null — hamma uchun */
    tier: string | null;
    cover: string;
}

export interface Creator {
    id: string;
    name: string;
    category: CategoryId;
    tagline: string;
    about: string;
    avatar: string;
    banner: string;
    /** Klub kartasi rangi (oklch hue) */
    hue: number;
    verified?: boolean;
    members: number;
    posts: number;
    tiers: Tier[];
    live?: LiveStream;
    goal?: { title: string; current: number; target: number };
}

export type PostKind = "image" | "video" | "audio" | "text" | "poll" | "event";

export interface Post {
    id: string;
    creatorId: string;
    kind: PostKind;
    title: string;
    text: string;
    media?: string;
    /** Video/audio davomiyligi */
    duration?: string;
    /** Ochish uchun kerakli tarif; null — ochiq post */
    tier: string | null;
    /** Necha daqiqa oldin */
    agoMin: number;
    likes: number;
    comments: number;
    tags?: string[];
    poll?: { options: { label: string; votes: number }[] };
    event?: { when: string; title: string };
}

const TIERS = (names: [string, string, string], prices: [number, number, number], perks: [string[], string[], string[]], members: [number, number, number], limit?: number): Tier[] =>
    names.map((name, i) => ({
        id: ["kouhai", "sempai", "sensei"][i],
        name,
        price: prices[i],
        perks: perks[i],
        members: members[i],
        limit: i === 2 ? limit : undefined,
    }));

export const CREATORS: Creator[] = [
    {
        id: "soka",
        name: "Kawaii Dub",
        category: "dublyaj",
        tagline: "O'zbek tilida professional anime dublyaj. Har hafta yangi qism.",
        about: "2019 yildan beri anime dublyaj qilamiz. Jamoada 9 ovoz aktyori va 2 ovoz rejissyori bor. Klub a'zolari qismlarni hammadan oldin ko'radi, ovoz yozish jarayonini kuzatadi va keyingi loyihani tanlashda ovoz beradi.",
        avatar: "https://i.ibb.co/8LDfnGxj/ava.jpg",
        banner: img("mascot"),
        hue: 295,
        verified: true,
        members: 4850,
        posts: 128,
        tiers: TIERS(
            ["Kouhai", "Sempai", "Sensei"],
            [15000, 35000, 75000],
            [
                ["Yopiq postlar va yangiliklar", "Klub chatidagi rol"],
                ["Qismlar 3 kun oldin", "A'zolar efirlari", "Ovoz yozish sahnalari"],
                ["Hammasi + titrlarda ismingiz", "Oyda bir marta jamoa bilan efir", "Keyingi animeni tanlash"],
            ],
            [2100, 2240, 510],
            600,
        ),
        live: { title: "Gullar ichidagi qiz — 6-qism dublyaji, jonli", viewers: 142, startedMin: 38, tier: null, cover: img("mascot") },
        goal: { title: "Shure SM7B mikrofoni", current: 3_450_000, target: 5_000_000 },
    },
    {
        id: "madina",
        name: "Madina Fanart",
        category: "fanart",
        tagline: "Anime qahramonlari, 4K devor qog'ozlari va chizish darslari.",
        about: "Raqamli rassom. Har hafta yangi illyustratsiya, PSD fayllar va chizish jarayoni videolari. Sensei a'zolari uchun oyda bitta buyurtma chizaman.",
        avatar: face("photo-1494790108377-be9c29b29330"),
        banner: img("Hatsune Miku - Magical cure"),
        hue: 345,
        verified: true,
        members: 1920,
        posts: 214,
        tiers: TIERS(
            ["Eskiz", "Palitra", "Kanvas"],
            [10000, 25000, 90000],
            [
                ["Eskizlar va jarayon", "Devor qog'ozlari"],
                ["4K va PSD fayllar", "Chizish darslari", "Ovoz berish"],
                ["Hammasi + oyda 1 buyurtma rasm", "Shaxsiy maslahat"],
            ],
            [1100, 740, 80],
            100,
        ),
    },
    {
        id: "zenith",
        name: "Zenith OST Lab",
        category: "musiqa",
        tagline: "Anime OST cover'lari, piano aranjirovkalari va notalar.",
        about: "Sevimli openinglarni piano, skripka va orkestr uchun qayta ishlaymiz. A'zolar notalar, MIDI va FLAC fayllarni oladi.",
        avatar: face("photo-1535713875002-d1d0cf377fde"),
        banner: img("Sekai no owari - Stella"),
        hue: 220,
        members: 980,
        posts: 96,
        tiers: TIERS(
            ["Tinglovchi", "Musiqachi", "Dirijyor"],
            [12000, 30000, 60000],
            [
                ["FLAC yuklab olish", "Yopiq treklar"],
                ["Notalar va MIDI", "Yozish jarayoni"],
                ["Hammasi + trek tanlash", "Ismingiz albom kreditlarida"],
            ],
            [610, 300, 70],
        ),
        live: { title: "Piano efir: openinglar so'rov bo'yicha", viewers: 61, startedMin: 12, tier: "sempai", cover: img("Sekai no owari - Stella") },
    },
    {
        id: "yuki",
        name: "Yuki Cosplay",
        category: "cosplay",
        tagline: "Kostyumlar, fotosessiyalar va kostyum tikish bo'yicha qo'llanmalar.",
        about: "Toshkentdagi kosplayer. Har oy yangi obraz: kostyum tikishdan fotosessiyagacha. A'zolar kulisdagi kadrlarni va naqshlarni oladi.",
        avatar: face("photo-1529626455594-4ff0802cfb7e"),
        banner: img("ado-elf"),
        hue: 20,
        verified: true,
        members: 2630,
        posts: 158,
        tiers: TIERS(
            ["Muxlis", "Atelye", "Backstage"],
            [15000, 40000, 100000],
            [
                ["Fotosessiyalar", "Yopiq postlar"],
                ["Naqshlar va qo'llanmalar", "Kulisdagi videolar"],
                ["Hammasi + imzoli foto-karta", "Obraz tanlashda ovoz"],
            ],
            [1800, 690, 140],
            150,
        ),
        live: { title: "Frieren kostyumi: plashni tikamiz", viewers: 87, startedMin: 64, tier: null, cover: img("ado-elf") },
    },
    {
        id: "bekzod",
        name: "Bekzod Mangaka",
        category: "manga",
        tagline: "O'zbek mangasi «Shamol yo'li» — har hafta yangi bob.",
        about: "O'zimizning mangamizni chizyapman: Samarqanddagi shamol ruhlari haqida fentezi. A'zolar boblarni oldinroq o'qiydi va qoralamalarni ko'radi.",
        avatar: face("photo-1570295999919-56ceb5ecca61"),
        banner: img("Ado - Kaze no Yukue"),
        hue: 160,
        members: 1340,
        posts: 72,
        tiers: TIERS(
            ["O'quvchi", "Muharrir", "Hammuallif"],
            [10000, 25000, 70000],
            [
                ["Boblar 1 hafta oldin", "Muqovalar"],
                ["Qoralamalar va ssenariy", "Syujetga ovoz berish"],
                ["Hammasi + ikkinchi darajali qahramon sizdan", "Bosma nashr"],
            ],
            [900, 380, 60],
            60,
        ),
    },
    {
        id: "otakucast",
        name: "OtakuCast",
        category: "podcast",
        tagline: "Anime haqida podkast: mavsum sharhlari va mehmonlar.",
        about: "Har hafta mavsumning eng yaxshi animelarini muhokama qilamiz. A'zolar epizodlarni reklamasiz va bir kun oldin eshitadi, efirlarda savol beradi.",
        avatar: face("photo-1507003211169-0a1dd7228f2d"),
        banner: img("Sakanaction - Kaiju"),
        hue: 250,
        members: 760,
        posts: 64,
        tiers: TIERS(
            ["Tinglovchi", "Studiyada", "Ko'mak"],
            [8000, 20000, 50000],
            [
                ["Reklamasiz epizodlar", "1 kun oldin"],
                ["Yopiq efirlar", "Savollar navbatsiz"],
                ["Hammasi + epizodda tilga olinish"],
            ],
            [520, 200, 40],
        ),
        live: { title: "Kuz mavsumi: top-10 anime", viewers: 214, startedMin: 21, tier: null, cover: img("Sakanaction - Kaiju") },
    },
    {
        id: "nori",
        name: "Nori Lo-fi",
        category: "musiqa",
        tagline: "Anime lo-fi bitlar: o'qish va ishlash uchun.",
        about: "Anime sahnalaridan ilhomlangan lo-fi bitlar. A'zolar stemlar va reklamasiz miksni oladi, Sensei — o'z treki uchun bit.",
        avatar: face("photo-1544005313-94ddf0286df2"),
        banner: img("Zutomayo - Byoushin wo Kamu"),
        hue: 75,
        members: 540,
        posts: 88,
        tiers: TIERS(
            ["Tinglovchi", "Prodyuser", "Hamkor"],
            [9000, 22000, 80000],
            [
                ["Reklamasiz miks", "Yangi bitlar oldinroq"],
                ["Stemlar", "Bit yasash efirlari"],
                ["Hammasi + shaxsiy bit"],
            ],
            [380, 140, 20],
            25,
        ),
    },
    {
        id: "hikari",
        name: "Hikari AMV",
        category: "dublyaj",
        tagline: "AMV va anime montaji: darslar, loyiha fayllari.",
        about: "AMV montaj qilaman va o'rgataman. A'zolar loyiha fayllari, presetlar va haftalik montaj sharhini oladi.",
        avatar: face("photo-1517841905240-472988babdf9"),
        banner: img("Hatsune Mike feat. Kasane Teto - numb numb"),
        hue: 320,
        members: 1110,
        posts: 120,
        tiers: TIERS(
            ["Tomoshabin", "Montajchi", "Rejissyor"],
            [10000, 28000, 65000],
            [
                ["Yopiq AMV'lar", "4K yuklab olish"],
                ["Loyiha fayllari va presetlar", "Darslar"],
                ["Hammasi + montajingizga sharh"],
            ],
            [700, 330, 80],
        ),
    },
];

export const creatorById = (id: string) => CREATORS.find((c) => c.id === id);
export const tierOf = (c: Creator, id: string | null) => (id ? c.tiers.find((t) => t.id === id) : undefined);

export const POSTS: Post[] = [
    {
        id: "p1", creatorId: "soka", kind: "video", tier: "sempai", agoMin: 95, likes: 412, comments: 58, duration: "23:41",
        title: "Gullar ichidagi qiz — 6-qism (a'zolar uchun oldindan)",
        text: "Yangi qism tayyor! Klub a'zolari 3 kun oldin ko'radi. Bu qismda Haruning ovozini yangi aktyorimiz Dilnoza yozdi.",
        media: img("mascot"), tags: ["dublyaj", "gullar"],
    },
    {
        id: "p2", creatorId: "madina", kind: "image", tier: null, agoMin: 180, likes: 1840, comments: 132,
        title: "Gojo «Cheksiz bo'shliq» — 4K devor qog'ozi",
        text: "Shibuya arki uchun chizgan illyustratsiyam. Telefon va kompyuter uchun 4K variantlari a'zolarga.",
        media: img("Hatsune Miku - Magical cure"), tags: ["fanart", "wallpaper"],
    },
    {
        id: "p3", creatorId: "zenith", kind: "audio", tier: "kouhai", agoMin: 260, likes: 233, comments: 19, duration: "4:12",
        title: "«Stella» — piano va torli kvartet",
        text: "Openingning yangi aranjirovkasi. FLAC va notalar biriktirilgan.",
        media: img("Sekai no owari - Stella"),
    },
    {
        id: "p4", creatorId: "soka", kind: "poll", tier: "kouhai", agoMin: 420, likes: 188, comments: 77,
        title: "Keyingi loyiha: qaysi animeni dublyaj qilamiz?",
        text: "Sizning ovozingiz hal qiladi. Ovoz berish juma kunigacha.",
        poll: { options: [{ label: "Tovus qanoti", votes: 412 }, { label: "Kaiju", votes: 356 }, { label: "Sehrli davo", votes: 201 }] },
    },
    {
        id: "p5", creatorId: "yuki", kind: "image", tier: "sempai", agoMin: 600, likes: 960, comments: 64,
        title: "Elf malikasi — to'liq fotosessiya (32 kadr)",
        text: "Kostyumga 3 hafta ketdi. Atelye a'zolari uchun naqsh va mato ro'yxati ham shu yerda.",
        media: img("ado-elf"), tags: ["cosplay"],
    },
    {
        id: "p6", creatorId: "otakucast", kind: "event", tier: null, agoMin: 720, likes: 140, comments: 22,
        title: "Shanba efiri: mehmonimiz — Kawaii Dub jamoasi",
        text: "Dublyaj qanday yoziladi, qanday aktyor tanlanadi — savollaringizni oldindan yozib qoldiring.",
        media: img("Sakanaction - Kaiju"), event: { when: "Shanba, 20:00", title: "OtakuCast × Kawaii Dub" },
    },
    {
        id: "p7", creatorId: "bekzod", kind: "image", tier: "kouhai", agoMin: 900, likes: 512, comments: 41,
        title: "«Shamol yo'li» — 14-bob",
        text: "Aziza nihoyat shamol ruhi bilan gaplashadi. 22 sahifa. Qoralamalar Muharrir a'zolariga.",
        media: img("Ado - Kaze no Yukue"), tags: ["manga"],
    },
    {
        id: "p8", creatorId: "madina", kind: "video", tier: "sempai", agoMin: 1300, likes: 610, comments: 37, duration: "41:08",
        title: "Chizish darsi: anime ko'zlari va yorug'lik",
        text: "Bosqichma-bosqich: eskizdan tayyor rangga. PSD fayl biriktirilgan.",
        media: img("Hatsuna Miku - Rolling Girl"),
    },
    {
        id: "p9", creatorId: "soka", kind: "text", tier: null, agoMin: 1500, likes: 302, comments: 45,
        title: "Studiyadan yangiliklar",
        text: "Yangi mikrofon uchun yig'imning 69% to'plandi — rahmat! Keyingi oydan qismlar har shanba chiqadi, Sensei a'zolarining ismlari esa 6-qism titrlarida bo'ladi.",
    },
    {
        id: "p10", creatorId: "nori", kind: "audio", tier: null, agoMin: 1700, likes: 420, comments: 12, duration: "28:30",
        title: "Yomg'irli Tokio — lo-fi miks",
        text: "O'qish uchun 30 daqiqalik miks. Stemlar Prodyuser a'zolariga.",
        media: img("Zutomayo - Byoushin wo Kamu"),
    },
    {
        id: "p11", creatorId: "hikari", kind: "video", tier: "kouhai", agoMin: 2000, likes: 780, comments: 51, duration: "2:47",
        title: "AMV: «numb numb» — to'liq versiya",
        text: "4K versiya va loyiha fayli a'zolarga.",
        media: img("Hatsune Mike feat. Kasane Teto - numb numb"),
    },
    {
        id: "p12", creatorId: "yuki", kind: "text", tier: "sensei", agoMin: 2600, likes: 88, comments: 30,
        title: "Backstage: keyingi obraz uchun ovoz berish",
        text: "Uchta variant tayyorladim — eskizlar ichkarida. Ovoz faqat Backstage a'zolari uchun.",
    },
    {
        id: "p13", creatorId: "soka", kind: "image", tier: "sensei", agoMin: 3100, likes: 140, comments: 26,
        title: "Ovoz yozish sahnasi: kulisdan 40 ta kadr",
        text: "Studiyadagi bir kun: kim qanday yozadi, qayerda kulamiz va qayerda qayta yozamiz.",
        media: img("pathway"),
    },
    {
        id: "p14", creatorId: "zenith", kind: "video", tier: null, agoMin: 3600, likes: 350, comments: 18, duration: "6:02",
        title: "«Hayotdan nafratlangan» — orkestr versiyasi",
        text: "Jonli yozuv. Ijro uchun rahmat, skripkachilarimiz!",
        media: img("Mafumafu - Hated by Life Itself"),
    },
];

export const postsOf = (creatorId: string) => POSTS.filter((p) => p.creatorId === creatorId);

/** "35 000" */
export const money = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
export const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1).replace(".0", "")}K` : String(n));

export function agoLabel(min: number) {
    if (min < 60) return `${min} daq oldin`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h} soat oldin`;
    const d = Math.floor(h / 24);
    return d === 1 ? "Kecha" : `${d} kun oldin`;
}
