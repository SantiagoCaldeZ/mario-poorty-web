export const CHARACTER_OPTIONS = [
  { name: "Huesitos", image: "/characters/imagenHuesitos.png" },
  { name: "Bowser", image: "/characters/imagenBowser.png" },
  { name: "Chop Chop", image: "/characters/imagenChopChop.png" },
  { name: "Don Pisotón", image: "/characters/imagenDonPisoton.png" },
  { name: "Donkey Kong", image: "/characters/imagenDonkeyKong.png" },
  { name: "Wario", image: "/characters/imagenWario.png" },
  { name: "King Boo", image: "/characters/imagenKingBoo.png" },
  { name: "Luigi", image: "/characters/imagenLuigi.png" },
  { name: "Princesa Daisy", image: "/characters/imagenPrincesaDaisy.png" },
  { name: "Princesa Peach", image: "/characters/imagenPrincesaPeach.png" },
  { name: "Shy Guy", image: "/characters/imagenShyGuy.png" },
  { name: "Toad", image: "/characters/imagenToad.png" },
  { name: "Waluigi", image: "/characters/imagenWaluigi.png" },
  { name: "Yoshi", image: "/characters/imagenYoshi.png" },
  { name: "Koopa Troopa", image: "/characters/imagenKoopaTroopa.png" },
];

export function getCharacterImage(characterName: string | null) {
  if (!characterName) return null;

  const found = CHARACTER_OPTIONS.find(
    (character) => character.name.toLowerCase() === characterName.toLowerCase()
  );

  return found?.image ?? null;
}