export type CardSuit = "hearts" | "diamonds" | "clubs" | "spades";
export type CardRank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

const SUIT_TO_FILENAME: Record<CardSuit, string> = {
  hearts: "Corazón",
  diamonds: "Diamante",
  clubs: "Trébol",
  spades: "Pica",
};

const RANK_TO_FILENAME: Record<CardRank, string> = {
  A: "As",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  J: "J",
  Q: "Q",
  K: "K",
};

export const CARD_BACK_ASSET_PATH = "/cards/fondo.png";

export function getCardAssetPath(rank: CardRank, suit: CardSuit): string {
  return `/cards/${RANK_TO_FILENAME[rank]}${SUIT_TO_FILENAME[suit]}.png`;
}
