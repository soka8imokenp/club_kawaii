import SpotlightGrid from "@/components/SpotlightGrid";
import TopBar from "@/components/top-bar/top-bar";
import FooterBar from "@/components/footer-bar/footer-bar";
import BottomNav from "@/components/bottom-nav/bottom-nav";
import { SitesPanel } from "@/components/sites/SitesPanel";
import { JoinSheet } from "@/components/club/JoinSheet";
import { DonateSheet } from "@/components/club/DonateSheet";
import { NotificationsSheet } from "@/components/club/NotificationsSheet";
import { LoginSheet, PaySheet } from "@/components/club/sheets";
import { Lightbox } from "@/components/club/media";

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

      {/* Asosiy kontent. Tashqi qatlam ekran kengligidagi bloklarni (bosh sahifa qahramoni) gorizontal kesadi —
          html/body'da emas, aks holda sahifa aylantirilmay qoladi */}
      <div className="flex-1 flex flex-col w-full overflow-x-clip">
        <main className="flex-1 flex flex-col w-full max-w-[1240px] mx-auto py-4 sm:py-6 px-3 sm:px-6 relative z-10">
          {children}
        </main>
      </div>

      {/* Futer */}
      <div className="site-footer w-full hidden md:block">
        <FooterBar />
      </div>

      {/* Mobil pastki navigatsiya (o'z bo'sh joyi bilan) */}
      <BottomNav />

      {/* Klubga a'zo bo'lish oynasi — istalgan sahifadan openJoin() bilan */}
      <JoinSheet />
      <PaySheet />
      <DonateSheet />
      <LoginSheet />
      <NotificationsSheet />
      <Lightbox />

      {/* Kawaii saytlari — logotipni bosib turganda yuqoridan tushadi */}
      <SitesPanel />
    </>
  );
}
