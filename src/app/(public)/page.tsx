import AboutSection from "@/components/home/about-section";
import DownloadSection from "@/components/home/download-section";
import HeroSection from "@/components/home/hero-section";
import NoticeSection from "@/components/home/notice-section";
import SearchSection from "@/components/home/search-section";
import ServiceSection from "@/components/home/service-section";
import { StatsBar } from "@/components/home/stats-bar";

export default function Home() {
  return (
    <>
      <HeroSection />
      <section id="main-content" className="container mx-auto px-4 py-8 grow">
        <AboutSection />
        <StatsBar />
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mb-12">
          {/* Left: Search */}
          <div className="h-full">
            <SearchSection />
          </div>

          {/* Right: Notice + Download stacked */}
          <div className="flex flex-col gap-8 h-full">
            <div className="flex-1">
              <NoticeSection />
            </div>

            {/* <div className="flex-1">
              <DownloadSection />
            </div> */}
          </div>
        </div>
        <ServiceSection />
      </section>
    </>
  );
}
