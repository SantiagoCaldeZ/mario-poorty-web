export type ChaosCardSuit = "hearts" | "diamonds" | "clubs" | "spades";

export type ChaosCardRank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export type ChaosCardEffect =
  | {
      type: "move_by";
      steps: number;
      negative: boolean;
    }
  | {
      type: "grant_shield";
      shieldCharges: number;
      negative: boolean;
    }
  | {
      type: "grant_skip_turns";
      skipTurns: number;
      negative: boolean;
    }
  | {
      type: "grant_next_roll_bonus";
      nextRollBonus: number;
      negative: boolean;
    }
  | {
      type: "grant_next_roll_max";
      nextRollMax: number;
      negative: boolean;
    };

export type ChaosCard = {
  id: string;
  suit: ChaosCardSuit;
  rank: ChaosCardRank;
  title: string;
  description: string;
  effect: ChaosCardEffect;
};

export const CHAOS_DECK_V1: readonly ChaosCard[] = [
  {
    id: "chaos-loot-surge",
    suit: "hearts",
    rank: "8",
    title: "Impulso del Botín",
    description: "La codicia goblin te impulsa 2 casillas hacia adelante.",
    effect: {
      type: "move_by",
      steps: 2,
      negative: false,
    },
  },
  {
    id: "chaos-swamp-pull",
    suit: "spades",
    rank: "5",
    title: "Tirón del Pantano",
    description: "El pantano te arrastra 2 casillas hacia atrás.",
    effect: {
      type: "move_by",
      steps: -2,
      negative: true,
    },
  },
  {
    id: "chaos-rune-ward",
    suit: "diamonds",
    rank: "Q",
    title: "Amuleto Rúnico",
    description: "Obtienes un escudo contra la próxima trampa o efecto negativo.",
    effect: {
      type: "grant_shield",
      shieldCharges: 1,
      negative: false,
    },
  },
  {
    id: "chaos-cursed-fog",
    suit: "clubs",
    rank: "9",
    title: "Niebla Maldita",
    description: "Perderás tu próximo turno.",
    effect: {
      type: "grant_skip_turns",
      skipTurns: 1,
      negative: true,
    },
  },
  {
    id: "chaos-lucky-bones",
    suit: "hearts",
    rank: "A",
    title: "Huesos Afortunados",
    description: "En tu próximo turno, tu dado tendrá +1.",
    effect: {
      type: "grant_next_roll_bonus",
      nextRollBonus: 1,
      negative: false,
    },
  },
  {
    id: "chaos-heavy-bones",
    suit: "spades",
    rank: "J",
    title: "Huesos Pesados",
    description: "En tu próximo turno, tu dado tendrá un máximo de 3.",
    effect: {
      type: "grant_next_roll_max",
      nextRollMax: 3,
      negative: true,
    },
  },
];