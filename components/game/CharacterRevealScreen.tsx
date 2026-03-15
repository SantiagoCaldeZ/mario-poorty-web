"use client";

import Image from "next/image";
import { useEffect } from "react";
import { CHARACTER_OPTIONS } from "@/lib/characters";

type CharacterRevealScreenProps = {
  characterName: string;
  onDone: () => void;
  durationMs?: number;
};

export default function CharacterRevealScreen({
  characterName,
  onDone,
  durationMs = 4000,
}: CharacterRevealScreenProps) {
  const selectedCharacter =
    CHARACTER_OPTIONS.find((character) => character.name === characterName) ?? null;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      onDone();
    }, durationMs);

    return () => window.clearTimeout(timeout);
  }, [durationMs, onDone]);

  if (!selectedCharacter) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#132417_0%,#0B140D_38%,#040706_100%)] text-[#F3F8EF]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(123,181,90,0.08),transparent_22%,transparent_78%,rgba(226,197,117,0.06))]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(235,245,220,0.85)_1px,transparent_1px),linear-gradient(to_bottom,rgba(235,245,220,0.85)_1px,transparent_1px)] [background-size:42px_42px]" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10">
          <section className="w-full max-w-[430px] overflow-hidden rounded-[34px] border border-[#E3EDD5]/10 bg-[linear-gradient(180deg,rgba(16,25,18,0.96),rgba(8,12,9,0.98))] p-8 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#CAE9B8]">
              Escogiste a:
            </p>

            <div className="mt-6 rounded-[28px] border border-[#E3EDD5]/10 bg-[linear-gradient(135deg,rgba(123,181,90,0.10),rgba(15,22,16,0.96))] px-6 py-10">
              <p className="text-3xl font-black text-[#FAFCEE]">{characterName}</p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#132417_0%,#0B140D_38%,#040706_100%)] text-[#F3F8EF]">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(123,181,90,0.08),transparent_22%,transparent_78%,rgba(226,197,117,0.06))]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(235,245,220,0.85)_1px,transparent_1px),linear-gradient(to_bottom,rgba(235,245,220,0.85)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(123,181,90,0.16),transparent_18%),radial-gradient(circle_at_86%_14%,rgba(226,197,117,0.14),transparent_18%),radial-gradient(circle_at_22%_84%,rgba(79,224,167,0.09),transparent_16%)]" />

      <div className="pointer-events-none absolute left-[8%] top-[14%] h-40 w-40 rounded-full bg-[#7BB55A]/12 blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] top-[14%] h-44 w-44 rounded-full bg-[#E2C575]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[10%] left-[18%] h-36 w-36 rounded-full bg-[#4FE0A7]/8 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10">
        <section className="w-full max-w-[430px] overflow-hidden rounded-[34px] border border-[#E3EDD5]/10 bg-[linear-gradient(180deg,rgba(16,25,18,0.96),rgba(8,12,9,0.98))] p-8 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#7BB55A]/16 bg-[#7BB55A]/10 px-4 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#9ECB63] shadow-[0_0_12px_rgba(158,203,99,0.8)]" />
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#CAE9B8]">
              Escogiste a:
            </p>
          </div>

          <div className="mt-7 rounded-[30px] border border-[#E3EDD5]/10 bg-[linear-gradient(135deg,rgba(123,181,90,0.10),rgba(15,22,16,0.96))] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.24)]">
            <div className="mx-auto flex h-[320px] w-full items-center justify-center rounded-[24px] border border-[#E3EDD5]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]">
              <Image
                src={selectedCharacter.image}
                alt={selectedCharacter.name}
                width={240}
                height={240}
                className="h-56 w-56 object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.28)]"
                priority
              />
            </div>

            <p className="mt-6 text-3xl font-black text-[#FAFCEE]">
              {selectedCharacter.name}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}