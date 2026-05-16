"use client";

import { useEffect, useState } from "react";
import Header from "./header";
import { Navbar } from "./nav-bar";
import Footer from "./footer";
import ScrollToTopButton from "../ui/ScrollToTopButton";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [, setActiveModal] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(100);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  const changeFontSize = (step: number) => {
    if (step === 0) {
      setFontSize(100);
    } else {
      setFontSize((prev) => Math.min(Math.max(prev + step * 10, 80), 130));
    }
  };

  return (
    <>
      <Header openModal={setActiveModal} changeFontSize={changeFontSize} />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ScrollToTopButton />
    </>
  );
}
