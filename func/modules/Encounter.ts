import { PetPlayer, WildPlayer } from "@cass-plugins/pet-fight";

export interface Flavor {
  check?: string;
  encounter?: string[];
  neutral?: string[];
  lowHP?: string[];
  run?: string[];
  satisfied?: string[];
}

export interface PersistentStats {
  totalDamageDealt: number;
  totalDamageTaken: number;
  mercyContributed: number;
  defenseBoosts: number;
  attackBoosts: number;
  healsPerformed: number;
  lastMove: string | null;
}

export interface Dialogues {
  neutral?: string[];
  satisfied?: string[];
  lowHP?: string[];
}

export interface Act {
  flavor?: string;
  pet?: string;
  mercyPts?: number;
  petLine?: string[];
  response?: string[];
}

export interface Attacks {
  [key: string]: string;
}

export interface WildEntity {
  wildName: string;
  wildIcon: string;
  wildType: string;
  HP: number;
  ATK: number;
  DF: number;
  fakeHP?: number;
  fakeATK?: number;
  fakeDEF?: number;
  winDias?: number;
  level?: number;
  flavor: Flavor;
  dialogues: Dialogues;
  acts?: {
    [key: string]: Act;
  };
  attacks: Attacks;
  goldFled: number;
  goldSpared: number;
  expEarn?: number;
}

export interface WildEntities {
  greatSeptimus: WildEntity;
  meow: WildEntity;
  flier: WildEntity;
  stardust: WildEntity;
  titan: WildEntity;
  [key: string]: WildEntity;
}

export interface Encounter extends WildEntity {}

export interface PetSchema {
  fight: boolean;
  item: boolean;
  magic: boolean;
  mercy: boolean;
  defend: boolean;
  extra: Record<string, string>;
}

export interface GameState {
  pets: PetPlayer[];
  opponent: WildPlayer;
  index: number;
  turnCache: (string | null)[];
  prevTurns: string[];
  flavorCache: string;
  attack?: {
    text: string;
    answer?: string;
    attackName?: string;
    healing?: number;
    turnType: string;
  };
  isEnemyTurn: boolean;
  type: "start" | "turnPlayer" | "playerTurn";
  author: string;
  get oppIndex(): GameState["pets"]["length"];
}
