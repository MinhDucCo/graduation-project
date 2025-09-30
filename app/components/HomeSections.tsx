// app/components/HomeSections.tsx
"use client";

import { usePathname } from "next/navigation";
import HeroSlider from "./HeroSlider";
import AboutCompany from "./AboutCompany";
import Strengths from "./Strengths";


export default function HomeSections() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <>
      <HeroSlider />
      <AboutCompany />
      <Strengths />
    </>
  );
}
