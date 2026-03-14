"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LandingPage() {
  const [introStarted, setIntroStarted] = useState(false);
  const [animateLogo, setAnimateLogo] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginReady, setLoginReady] = useState(false);

  const introAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleStartIntro = async () => {
    if (introStarted) return;

    setIntroStarted(true);

    if (!introAudioRef.current) {
      introAudioRef.current = new Audio("/sounds/logo-intro.mp3");
      introAudioRef.current.volume = 0.38;
    }

    try {
      introAudioRef.current.currentTime = 0;
      await introAudioRef.current.play();
    } catch (error) {
      console.error("No se pudo reproducir el audio:", error);
    }

    window.setTimeout(() => {
      setAnimateLogo(true);
    }, 80);

    window.setTimeout(() => {
      setShowLogin(true);
    }, 1200);

    window.setTimeout(() => {
      setLoginReady(true);
    }, 2850);
  };

  useEffect(() => {
    return () => {
      if (introAudioRef.current) {
        introAudioRef.current.pause();
        introAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#203528_0%,#0D1712_38%,#08110D_72%,#050908_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(190,255,120,0.04),transparent_16%,transparent_84%,rgba(255,190,90,0.05))]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(184,255,98,0.16),transparent_24%),radial-gradient(circle_at_20%_22%,rgba(92,211,162,0.12),transparent_18%),radial-gradient(circle_at_82%_18%,rgba(217,180,91,0.12),transparent_18%),radial-gradient(circle_at_14%_82%,rgba(84,214,255,0.08),transparent_16%),radial-gradient(circle_at_86%_84%,rgba(138,99,246,0.10),transparent_18%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.08),rgba(0,0,0,0.38))]" />

      <div className="pointer-events-none absolute left-[7%] top-[12%] h-28 w-28 rounded-full bg-[#B8FF62]/12 blur-3xl" />
      <div className="pointer-events-none absolute left-[16%] top-[38%] h-24 w-24 rounded-full bg-[#57D38B]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-[14%] h-32 w-32 rounded-full bg-[#D9B45B]/12 blur-3xl" />
      <div className="pointer-events-none absolute right-[12%] top-[42%] h-24 w-24 rounded-full bg-[#8A63F6]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[16%] left-[10%] h-24 w-24 rounded-full bg-[#54D6FF]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[12%] right-[14%] h-28 w-28 rounded-full bg-[#C97933]/12 blur-3xl" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-[radial-gradient(ellipse_at_bottom,rgba(73,114,68,0.22),transparent_65%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(0,0,0,0.34)_100%)]" />

      <div className="relative flex min-h-screen flex-col items-center px-4">
        <div
          className={`z-10 flex flex-col items-center rounded-[32px] border border-[#F4EAD0]/10 bg-[linear-gradient(180deg,rgba(24,37,29,0.72),rgba(11,18,14,0.46))] px-6 py-7 shadow-[0_20px_80px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md transition-all duration-[1200ms] ease-in-out sm:px-10 sm:py-9 ${
            introStarted
              ? animateLogo
                ? "-mt-12 scale-[0.72] sm:-mt-16 sm:scale-[0.66]"
                : "mt-[6vh] scale-100"
              : "mt-[10vh] scale-100"
          }`}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D9B45B]/25 bg-[#0B120E]/55 px-4 py-2 shadow-[0_0_30px_rgba(217,180,91,0.08)]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#B8FF62] shadow-[0_0_12px_rgba(184,255,98,0.95)]" />
            <p className="text-center text-[11px] font-extrabold uppercase tracking-[0.38em] text-[#D9B45B] sm:text-xs">
              Bienvenido a
            </p>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-0 scale-110 rounded-full bg-[radial-gradient(circle,rgba(184,255,98,0.16),transparent_55%)] blur-2xl" />
            <div className="pointer-events-none absolute inset-x-6 -bottom-4 h-10 rounded-full bg-[#D9B45B]/10 blur-2xl" />

            <Image
              src="/logo/logopgw.png"
              alt="Poorty Goblin Web"
              width={500}
              height={900}
              priority
              className="relative h-auto w-[240px] drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)] sm:w-[280px] md:w-[320px]"
            />
          </div>

          {!introStarted && (
            <div className="mt-8 flex flex-col items-center">
              <p className="mb-5 max-w-md text-center text-sm font-medium leading-6 text-[#F3EEDA]/80 sm:text-base">
                Entra a la experiencia de Poorty Goblin Web y comienza la partida.
              </p>

              <button
                type="button"
                onClick={handleStartIntro}
                className="group relative overflow-hidden rounded-[22px] border border-[#E6D8AF]/20 bg-[linear-gradient(135deg,#B8FF62_0%,#78D957_32%,#D9B45B_72%,#C97933_100%)] px-10 py-4 text-lg font-extrabold uppercase tracking-[0.22em] text-[#102015] shadow-[0_18px_35px_rgba(0,0,0,0.35),0_0_35px_rgba(184,255,98,0.12)] transition duration-300 hover:scale-[1.03] hover:shadow-[0_22px_45px_rgba(0,0,0,0.42),0_0_40px_rgba(184,255,98,0.18)] active:scale-[0.99]"
              >
                <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.24)_35%,transparent_70%)] opacity-0 transition duration-500 group-hover:translate-x-8 group-hover:opacity-100" />
                <span className="relative">Comenzar</span>
              </button>

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#D9B45B]/75">
                Haz clic para iniciar
              </p>
            </div>
          )}
        </div>

        <div
          className={`w-full transition-all duration-[1300ms] ease-out ${
            showLogin
              ? "-mt-22 translate-y-0 opacity-100"
              : "pointer-events-none mt-2 translate-y-6 opacity-0"
          } ${loginReady ? "pointer-events-auto" : "pointer-events-none"}`}
        >
          <div className="mx-auto flex w-full max-w-6xl justify-center pb-4 drop-shadow-[0_20px_50px_rgba(0,0,0,0.40)]">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}