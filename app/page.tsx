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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-red-700 via-blue-700 to-green-600">
      <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_35%)]" />

      <div className="pointer-events-none absolute left-[8%] top-[14%] h-20 w-20 rounded-full bg-yellow-300/20 blur-xl" />
      <div className="pointer-events-none absolute right-[10%] top-[18%] h-24 w-24 rounded-full bg-red-300/20 blur-xl" />
      <div className="pointer-events-none absolute bottom-[18%] left-[12%] h-24 w-24 rounded-full bg-blue-200/20 blur-xl" />
      <div className="pointer-events-none absolute bottom-[14%] right-[12%] h-20 w-20 rounded-full bg-green-200/20 blur-xl" />

      <div className="relative flex min-h-screen flex-col items-center px-4">
        <div
          className={`z-10 flex flex-col items-center transition-all duration-[1200ms] ease-in-out ${
            introStarted
            ? animateLogo
                ? "-mt-12 scale-[0.72] sm:-mt-16 sm:scale-[0.66]"
                : "mt-[6vh] scale-100"
              : "mt-[10vh] scale-100"
          }`}
        >
          <p className="mb-4 text-center text-2xl font-extrabold uppercase tracking-[0.35em] text-yellow-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] sm:text-3xl">
            Bienvenido a
          </p>

          <Image
            src="/logo/logopgw.png"
            alt="Poorty Goblin Web"
            width={500}
            height={900}
            priority
            className="h-auto w-[240px] sm:w-[280px] md:w-[320px]"
          />

          {!introStarted && (
            <div className="mt-8 flex flex-col items-center">
              <p className="mb-4 max-w-md text-center text-sm font-medium text-white/90 sm:text-base">
                Entra a la experiencia de Poorty Goblin Web y comienza la partida.
              </p>

              <button
                type="button"
                onClick={handleStartIntro}
                className="rounded-2xl border border-white/30 bg-red-600 px-10 py-4 text-lg font-extrabold uppercase tracking-[0.18em] text-white shadow-2xl transition hover:scale-[1.03] hover:bg-red-700 active:scale-[0.99]"
              >
                Comenzar
              </button>

              <p className="mt-4 text-xs uppercase tracking-[0.28em] text-white/70">
                Haz clic para iniciar
              </p>
            </div>
          )}
        </div>

        <div
          className={`w-full transition-all duration-[1300ms] ease-out ${
            showLogin
              ? "-mt-14 translate-y-0 opacity-100"
              : "pointer-events-none mt-2 translate-y-6 opacity-0"
          } ${loginReady ? "pointer-events-auto" : "pointer-events-none"}`}
        >
          <div className="mx-auto flex w-full max-w-6xl justify-center pb-4">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}