export const CHARACTER_OPTIONS = [
  {
    name: "Blitz El Inventor",
    image: "/characters/BlitzElInventor.png",
    tokenImage: "/fichas/BlitzElInventor.png",
  },
  {
    name: "Eco El Pequeño",
    image: "/characters/EcoElPequeño.png",
    tokenImage: "/fichas/EcoElPequeño.png",
  },
  {
    name: "Fang El Sigiloso",
    image: "/characters/FangElSigiloso.png",
    tokenImage: "/fichas/FangElSigiloso.png",
  },
  {
    name: "Grom El Guerrero",
    image: "/characters/GromElGuerrero.png",
    tokenImage: "/fichas/GromElGuerrero.png",
  },
  {
    name: "Krag El Titán",
    image: "/characters/KragElTitan.png",
    tokenImage: "/fichas/KragElTitan.png",
  },
  {
    name: "Lali La Traviesa",
    image: "/characters/LaliLaTraviesa.png",
    tokenImage: "/fichas/LaliLaTraviesa.png",
  },
  {
    name: "Lira La Cantora",
    image: "/characters/LiraLaCantora.png",
    tokenImage: "/fichas/LiraLaCantora.png",
  },
  {
    name: "Luna La Mística",
    image: "/characters/LunaLaMistica.png",
    tokenImage: "/fichas/LunaLaMistica.png",
  },
  {
    name: "Nova La Bombardera",
    image: "/characters/NovaLaBombardera.png",
    tokenImage: "/fichas/NovaLaBombardera.png",
  },
  {
    name: "Rix El Loco",
    image: "/characters/RixElLoco.png",
    tokenImage: "/fichas/RixElLoco.png",
  },
  {
    name: "Spike El Pincho",
    image: "/characters/SpikeElPincho.png",
    tokenImage: "/fichas/SpikeElPincho.png",
  },
  {
    name: "Vexa La Hechicera",
    image: "/characters/VexaLaHechicera.png",
    tokenImage: "/fichas/VexaLaHechicera.png",
  },
  {
    name: "Zara La Veloz",
    image: "/characters/ZaraLaVeloz.png",
    tokenImage: "/fichas/ZaraLaVeloz.png",
  },
  {
    name: "Zark El Tanque",
    image: "/characters/ZarkElTanque.png",
    tokenImage: "/fichas/ZarkElTanque.png",
  },
];

export function getCharacterImage(characterName: string | null) {
  if (!characterName) return null;

  const found = CHARACTER_OPTIONS.find(
    (character) => character.name.toLowerCase() === characterName.toLowerCase()
  );

  return found?.image ?? null;
}

export function getCharacterTokenImage(characterName: string | null) {
  if (!characterName) return null;

  const found = CHARACTER_OPTIONS.find(
    (character) => character.name.toLowerCase() === characterName.toLowerCase()
  );

  return found?.tokenImage ?? null;
}