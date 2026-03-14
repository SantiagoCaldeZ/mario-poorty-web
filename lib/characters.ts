export const CHARACTER_OPTIONS = [
  { name: "Blitz El Inventor", image: "/characters/BlitzElInventor.png" },
  { name: "Eco El Pequeño", image: "/characters/EcoElPequeño.png" },
  { name: "Fang El Sigiloso", image: "/characters/FangElSigiloso.png" },
  { name: "Grom El Guerrero", image: "/characters/GromElGuerrero.png" },
  { name: "Krag El Titán", image: "/characters/KragElTitan.png" },
  { name: "Lali La Traviesa", image: "/characters/LaliLaTraviesa.png" },
  { name: "Lira La Cantora", image: "/characters/LiraLaCantora.png" },
  { name: "Luna La Mística", image: "/characters/LunaLaMistica.png" },
  { name: "Nova La Bombardera", image: "/characters/NovaLaBombardera.png" },
  { name: "Rix El Loco", image: "/characters/RixElLoco.png" },
  { name: "Spike El Pincho", image: "/characters/SpikeElPincho.png" },
  { name: "Vexa La Hechicera", image: "/characters/VexaLaHechicera.png" },
  { name: "Zara La Veloz", image: "/characters/ZaraLaVeloz.png" },
  { name: "Zark El Tanque", image: "/characters/ZarkElTanque.png" },
];

export function getCharacterImage(characterName: string | null) {
  if (!characterName) return null;

  const found = CHARACTER_OPTIONS.find(
    (character) => character.name.toLowerCase() === characterName.toLowerCase()
  );

  return found?.image ?? null;
}