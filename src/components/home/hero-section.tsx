"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import heroPoster from "@/../public/images/hero-poster.png";
import medicine from "@/../public/images/medicine-image.webp";
import pharmacy from "@/../public/images/pharmacy-image.webp";

export default function HeroSection() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);

  const HERO_SIZES =
    "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px";

  return (
    <section className="relative overflow-hidden text-white">
      <div className="overflow-hidden h-[70vh]" ref={emblaRef}>
        <div className="flex h-full">
          {/* Slide 1 */}
          <div className="relative min-w-full h-[70vh]">
            <Image
              src={heroPoster}
              alt="Hero background"
              fill
              priority
              fetchPriority="high"
              loading="eager"
              quality={75}
              sizes={HERO_SIZES}
              className="object-cover"
            />
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/videos/bg-video.webm" type="video/webm" />
              <source src="/videos/bg-video.mp4" type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-linear-to-r from-black/20 to-black/80" />

            <div className="relative z-10 flex h-full items-center sm:pb-0 px-6 md:px-12">
              <div className="max-w-4xl">
                <h2 className="font-bold mb-4 text-[clamp(2rem,3vw,3.6rem)] leading-tight">
                  Welcome to Arunachal Pradesh Pharmacy Council
                </h2>

                <p className="text-[clamp(1rem,1.6vw,1.5rem)] font-extralight italic">
                  Regulating pharmaceutical education and practice for better
                  healthcare in Arunachal Pradesh
                </p>
              </div>
            </div>
          </div>

          {/* Slide 2 */}
          <div className="relative min-w-full h-[70vh]">
            <Image
              src={medicine}
              alt="Medicine"
              fill
              loading="lazy"
              fetchPriority="low"
              quality={75}
              sizes={HERO_SIZES}
              className="object-cover"
            />

            <div className="absolute inset-0 bg-linear-to-r from-black/20 to-black/80" />

            <div className="relative z-10 flex h-full items-center sm:pb-0 px-6 md:px-12">
              <div className="max-w-4xl">
                <h2 className="font-bold mb-4 text-[clamp(2rem,3vw,4rem)] leading-tight">
                  Committed to Excellence
                </h2>

                <p className="text-[clamp(1rem,1.6vw,1.5rem)] font-extralight italic">
                  Ensuring every pharmacist is skilled and qualified
                </p>
              </div>
            </div>
          </div>

          {/* Slide 3 */}
          <div className="relative min-w-full h-[70vh]">
            <Image
              src={pharmacy}
              alt="Pharmacy"
              fill
              loading="lazy"
              fetchPriority="low"
              quality={75}
              sizes={HERO_SIZES}
              className="object-cover"
            />

            <div className="absolute inset-0 bg-linear-to-r from-black/20 to-black/80" />

            <div className="relative z-10 flex h-full items-center sm:pb-0 px-6 md:px-12">
              <div className="max-w-4xl">
                <h2 className="font-bold mb-4 text-[clamp(2rem,3vw,4rem)] leading-tight">
                  Empowering Healthcare Through Education
                </h2>

                <p className="text-[clamp(1rem,1.6vw,1.5rem)] font-extralight italic">
                  Promoting high standards in pharmacy education
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
