import SpotlightGrid from "@/components/SpotlightGrid";
import TopBar from "@/components/top-bar/top-bar";
import FooterBar from "@/components/footer-bar/footer-bar";
import BottomNav from "@/components/bottom-nav/bottom-nav";
import { SitesPanel } from "@/components/sites/SitesPanel";
import { JoinSheet } from "@/components/club/JoinSheet";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Kursorni kuzatuvchi interaktiv orqa fon */}
      <SpotlightGrid />

      {/* Yuqori navigatsiya paneli */}
      {/* Mobilda yashirin — o'rnini pastki navigatsiya egallaydi */}
      <div className="w-full z-[999] hidden md:block">
        <TopBar />
      </div>

      {/* Asosiy kontent */}
      <main className="flex-1 flex flex-col w-full max-w-[1240px] mx-auto py-4 sm:py-6 px-3 sm:px-6 relative z-10">
        {children}
      </main>

      {/* Futer */}
      <div className="site-footer w-full hidden md:block">
        <FooterBar />
      </div>

      {/* Mobil pastki navigatsiya (o'z bo'sh joyi bilan) */}
      <BottomNav />

      {/* Klubga a'zo bo'lish oynasi — istalgan sahifadan openJoin() bilan */}
      <JoinSheet />

      {/* Kawaii saytlari — logotipni bosib turganda yuqoridan tushadi */}
      <SitesPanel />
    </>
  );
}
