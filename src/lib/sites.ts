/** Kawaii platformasidagi saytlar — logotipni bosib turganda chiqadigan panel va menyu uchun */
export interface KawaiiSite {
    id: "kawaii" | "anime" | "radio" | "tv" | "club";
    name: string;
    domain: string;
    url: string;
    tagline: string;
    /** Plitka urg'u rangi (oklch hue) */
    hue: number;
    /** Hozirgi sayt */
    current?: boolean;
}

export const SITES: KawaiiSite[] = [
    { id: "kawaii", name: "Kawaii", domain: "kawaii.uz", url: "https://kawaii.uz", tagline: "Platforma haqida", hue: 25 },
    { id: "anime", name: "Anime", domain: "bot.kawaii.uz", url: "https://bot.kawaii.uz", tagline: "Katalog va dublyaj", hue: 235 },
    { id: "radio", name: "Radio", domain: "radio.kawaii.uz", url: "https://radio.kawaii.uz", tagline: "J-pop va OST 24/7", hue: 340 },
    { id: "tv", name: "TV", domain: "tv.kawaii.uz", url: "https://tv.kawaii.uz", tagline: "Birga tomosha", hue: 295 },
    { id: "club", name: "Club", domain: "club.kawaii.uz", url: "/", tagline: "Ijodkorlar klublari", hue: 160, current: true },
];
