export enum CardColor {
  Red = "Red",
  Blue = "Blue",
  Green = "Green",
  Yellow = "Yellow",
  Wild = "Wild",
}

export enum CardType {
  Number = "Number",
  Skip = "Skip",
  Reverse = "Reverse",
  DrawTwo = "DrawTwo",
  Wild = "Wild",
  WildDrawFour = "WildDrawFour",
}

export enum TurnAction {
  PlayCard = "PlayCard",
  DrawCards = "DrawCards",
  SayUno = "SayUno",
  GameStart = "GameStart",
}

export interface UnoCard {
  color: CardColor;
  type: CardType;
  value?: number;
  id: string;
  getName(): string;
  getDescription(): string;
}

export class UnoEngineCard implements UnoCard {
  color: CardColor;
  type: CardType;
  value?: number;
  id: string;

  constructor(color: CardColor, type: CardType, value?: number) {
    this.color = color;
    this.type = type;
    this.value = value;
    this.id = `${color}_${type}_${value || ""}_${Math.random()
      .toString(36)
      .slice(2)}`;
  }

  getName(): string {
    if (this.type === CardType.Number) {
      return `${this.color} ${this.value}`;
    }
    return `${this.color} ${this.type}`;
  }

  getDescription(): string {
    switch (this.type) {
      case CardType.Number:
        return `A ${this.color} card with value ${this.value}.`;
      case CardType.Skip:
        return `A ${this.color} Skip card that skips the next player's turn.`;
      case CardType.Reverse:
        return `A ${this.color} Reverse card that reverses the turn order.`;
      case CardType.DrawTwo:
        return `A ${this.color} Draw Two card that forces the next player to draw two cards.`;
      case CardType.Wild:
        return `A Wild card that can be played on any card and allows the player to choose the next color.`;
      case CardType.WildDrawFour:
        return `A Wild Draw Four card that allows the player to choose the next color and forces the next player to draw four cards.`;
      default:
        return `A ${this.color} ${this.type} card.`;
    }
  }

  toString(): string {
    return this.getName();
  }
}

export class UnoEnginePlayer {
  userID: string;
  deck: UnoCard[];
  isActive: boolean;
  hasSaidUno: boolean;

  constructor(userID: string) {
    this.userID = userID;
    this.deck = [];
    this.isActive = true;
    this.hasSaidUno = false;
  }

  drawCard(card: UnoCard): void {
    this.deck.push(card);
    this.hasSaidUno = false;
  }

  playCard(cardId: string, wildColor?: CardColor): UnoCard | null {
    const cardIndex = this.deck.findIndex((card) => card.id === cardId);
    if (cardIndex === -1) return null;

    const card = this.deck[cardIndex];
    if (card.type === CardType.Wild || card.type === CardType.WildDrawFour) {
      if (!wildColor) return null;
      card.color = wildColor;
    }

    this.deck.splice(cardIndex, 1);
    if (this.deck.length === 1) {
      this.hasSaidUno = false;
    }
    return card;
  }

  sayUno(): boolean {
    if (this.deck.length === 1) {
      this.hasSaidUno = true;
      return true;
    }
    return false;
  }
}

export class UnoEngineTurn {
  turnId: string;
  action: TurnAction;
  player: UnoEnginePlayer;
  cardPlayed: UnoCard | null;
  cardsDrawn: UnoCard[];
  wildColorChosen: CardColor | null;
  isReverse: boolean;
  currentColor: CardColor;
  nextPlayer: UnoEnginePlayer;
  turnNumber: number;
  gameEnded: boolean;
  timestamp: Date;
  success: boolean;
  error: string | null;

  constructor(
    action: TurnAction,
    player: UnoEnginePlayer,
    nextPlayer: UnoEnginePlayer,
    currentColor: CardColor,
    isReverse: boolean,
    turnNumber: number,
    success: boolean,
    cardPlayed: UnoCard | null = null,
    cardsDrawn: UnoCard[] = [],
    wildColorChosen: CardColor | null = null,
    gameEnded: boolean = false,
    error: string | null = null
  ) {
    this.turnId = `${action}_${Math.random().toString(36).slice(2)}`;
    this.action = action;
    this.player = player;
    this.cardPlayed = cardPlayed;
    this.cardsDrawn = cardsDrawn;
    this.wildColorChosen = wildColorChosen;
    this.isReverse = isReverse;
    this.currentColor = currentColor;
    this.nextPlayer = nextPlayer;
    this.turnNumber = turnNumber;
    this.gameEnded = gameEnded;
    this.timestamp = new Date();
    this.success = success;
    this.error = error;
  }

  getName(): string {
    if (!this.success) {
      return `${this.player.userID} attempted ${this.action} (failed)`;
    }
    switch (this.action) {
      case TurnAction.PlayCard:
        return `${this.player.userID} played ${
          this.cardPlayed?.getName() || "a card"
        }`;
      case TurnAction.DrawCards:
        return `${this.player.userID} drew ${this.cardsDrawn.length} card${
          this.cardsDrawn.length > 1 ? "s" : ""
        }`;
      case TurnAction.SayUno:
        return `${this.player.userID} said UNO`;
      case TurnAction.GameStart:
        return `Game started with ${this.cardPlayed?.getName()} on top`;
      default:
        return `Turn ${this.turnNumber} by ${this.player.userID}`;
    }
  }

  getDescription(): string {
    let desc = `Turn ${this.turnNumber} at ${this.timestamp.toISOString()}: `;
    if (!this.success) {
      desc += `${this.player.userID} attempted ${this.action} but failed. ${
        this.error || "Invalid action."
      } `;
    } else {
      switch (this.action) {
        case TurnAction.PlayCard:
          desc += `${
            this.player.userID
          } played ${this.cardPlayed?.getName()}. `;
          if (this.wildColorChosen) {
            desc += `Chose ${this.wildColorChosen} as the new color. `;
          }
          if (this.cardPlayed?.type === CardType.Skip) {
            desc += `${this.nextPlayer.userID}'s turn was skipped. `;
          } else if (this.cardPlayed?.type === CardType.Reverse) {
            desc += `Turn order reversed. `;
          } else if (this.cardPlayed?.type === CardType.DrawTwo) {
            desc += `${this.nextPlayer.userID} must draw 2 cards. `;
          } else if (this.cardPlayed?.type === CardType.WildDrawFour) {
            desc += `${this.nextPlayer.userID} must draw 4 cards. `;
          }
          break;
        case TurnAction.DrawCards:
          desc += `${this.player.userID} drew ${this.cardsDrawn.length} card${
            this.cardsDrawn.length > 1 ? "s" : ""
          }. `;
          break;
        case TurnAction.SayUno:
          desc += `${this.player.userID} declared UNO with 1 card left. `;
          break;
        case TurnAction.GameStart:
          desc += `Game started with ${this.cardPlayed?.getName()} on the discard pile. `;
          break;
      }
    }
    desc += `Current color: ${this.currentColor}. Turn order: ${
      this.isReverse ? "counterclockwise" : "clockwise"
    }. `;
    desc += `Next player: ${this.nextPlayer.userID}. `;
    if (this.gameEnded) {
      desc += `${this.player.userID} won the game!`;
    }
    return desc;
  }
}

export class UnoEngine {
  players: UnoEnginePlayer[];
  deck: UnoCard[];
  discardPile: UnoCard[];
  currentPlayerIndex: number;
  isReverse: boolean;
  gameStarted: boolean;
  currentColor: CardColor;
  turnHistory: UnoEngineTurn[];
  turnNumber: number;

  constructor() {
    this.players = [];
    this.deck = [];
    this.discardPile = [];
    this.currentPlayerIndex = 0;
    this.isReverse = false;
    this.gameStarted = false;
    this.currentColor = CardColor.Red;
    this.turnHistory = [];
    this.turnNumber = 0;
  }

  private initializeDeck(): void {
    this.deck = [];
    const colors = [
      CardColor.Red,
      CardColor.Blue,
      CardColor.Green,
      CardColor.Yellow,
    ];

    colors.forEach((color) => {
      for (let value = 0; value <= 9; value++) {
        this.deck.push(new UnoEngineCard(color, CardType.Number, value));
        if (value !== 0) {
          this.deck.push(new UnoEngineCard(color, CardType.Number, value));
        }
      }

      [CardType.Skip, CardType.Reverse, CardType.DrawTwo].forEach((type) => {
        this.deck.push(new UnoEngineCard(color, type));
        this.deck.push(new UnoEngineCard(color, type));
      });
    });

    for (let i = 0; i < 4; i++) {
      this.deck.push(new UnoEngineCard(CardColor.Wild, CardType.Wild));
      this.deck.push(new UnoEngineCard(CardColor.Wild, CardType.WildDrawFour));
    }

    this.deck.sort(() => Math.random() - 0.5);
  }

  addPlayer(userID: string): UnoEnginePlayer {
    const player = new UnoEnginePlayer(userID);
    this.players.push(player);
    return player;
  }

  startGame(): UnoEngineTurn {
    this.turnNumber++;
    if (this.players.length < 2 || this.gameStarted) {
      return new UnoEngineTurn(
        TurnAction.GameStart,
        this.players[this.currentPlayerIndex] || new UnoEnginePlayer("unknown"),
        this.players[this.currentPlayerIndex] || new UnoEnginePlayer("unknown"),
        this.currentColor,
        this.isReverse,
        this.turnNumber,
        false,
        null,
        [],
        null,
        false,
        this.players.length < 2
          ? "At least 2 players required"
          : "Game already started"
      );
    }

    this.gameStarted = true;
    this.initializeDeck();

    this.players.forEach((player) => {
      for (let i = 0; i < 7; i++) {
        const card = this.deck.pop();
        if (card) player.drawCard(card);
      }
    });

    let firstCard = this.deck.pop();
    while (firstCard && firstCard.type === CardType.WildDrawFour) {
      this.deck.push(firstCard);
      this.deck.sort(() => Math.random() - 0.5);
      firstCard = this.deck.pop();
    }
    if (firstCard) {
      this.discardPile.push(firstCard);
      this.currentColor = firstCard.color;
      const turn = new UnoEngineTurn(
        TurnAction.GameStart,
        this.players[this.currentPlayerIndex],
        this.players[this.currentPlayerIndex],
        this.currentColor,
        this.isReverse,
        this.turnNumber,
        true,
        firstCard
      );
      this.turnHistory.push(turn);
      return turn;
    }

    return new UnoEngineTurn(
      TurnAction.GameStart,
      this.players[this.currentPlayerIndex],
      this.players[this.currentPlayerIndex],
      this.currentColor,
      this.isReverse,
      this.turnNumber,
      false,
      null,
      [],
      null,
      false,
      "Failed to draw initial card"
    );
  }

  canPlayCard(card: UnoCard): boolean {
    const topCard = this.discardPile[this.discardPile.length - 1];
    if (!topCard) return false;

    return (
      card.color === CardColor.Wild ||
      card.color === this.currentColor ||
      card.color === topCard.color ||
      (card.type === topCard.type && card.type !== CardType.Number) ||
      (card.type === CardType.Number &&
        topCard.type === CardType.Number &&
        card.value === topCard.value)
    );
  }

  playCard(
    player: UnoEnginePlayer,
    cardId: string,
    wildColor?: CardColor
  ): UnoEngineTurn {
    this.turnNumber++;
    if (this.players[this.currentPlayerIndex] !== player || !this.gameStarted) {
      return new UnoEngineTurn(
        TurnAction.PlayCard,
        player,
        this.players[this.currentPlayerIndex],
        this.currentColor,
        this.isReverse,
        this.turnNumber,
        false,
        null,
        [],
        wildColor || null,
        false,
        !this.gameStarted ? "Game not started" : "Not player's turn"
      );
    }

    const card = player.playCard(cardId, wildColor);
    if (!card || !this.canPlayCard(card)) {
      if (card) player.drawCard(card);
      return new UnoEngineTurn(
        TurnAction.PlayCard,
        player,
        this.players[this.currentPlayerIndex],
        this.currentColor,
        this.isReverse,
        this.turnNumber,
        false,
        card,
        [],
        wildColor || null,
        false,
        !card ? "Card not found" : "Invalid card play"
      );
    }

    this.discardPile.push(card);
    this.currentColor = card.color;
    let nextPlayerIndex = this.currentPlayerIndex;
    const gameEnded = player.deck.length === 0;

    switch (card.type) {
      case CardType.Skip:
        nextPlayerIndex = this.calculateNextPlayerIndex();
        break;
      case CardType.Reverse:
        this.isReverse = !this.isReverse;
        if (this.players.length === 2)
          nextPlayerIndex = this.calculateNextPlayerIndex();
        break;
      case CardType.DrawTwo:
        nextPlayerIndex = this.calculateNextPlayerIndex();
        this.drawCards(this.players[nextPlayerIndex], 2);
        break;
      case CardType.WildDrawFour:
        nextPlayerIndex = this.calculateNextPlayerIndex();
        this.drawCards(this.players[nextPlayerIndex], 4);
        break;
    }

    nextPlayerIndex = this.calculateNextPlayerIndex();
    const turn = new UnoEngineTurn(
      TurnAction.PlayCard,
      player,
      this.players[nextPlayerIndex],
      this.currentColor,
      this.isReverse,
      this.turnNumber,
      true,
      card,
      [],
      wildColor || null,
      gameEnded
    );
    this.turnHistory.push(turn);
    this.currentPlayerIndex = nextPlayerIndex;

    if (gameEnded) {
      this.gameStarted = false;
    }

    return turn;
  }

  drawCards(player: UnoEnginePlayer, count: number): UnoEngineTurn {
    this.turnNumber++;
    if (this.players[this.currentPlayerIndex] !== player || !this.gameStarted) {
      return new UnoEngineTurn(
        TurnAction.DrawCards,
        player,
        this.players[this.currentPlayerIndex],
        this.currentColor,
        this.isReverse,
        this.turnNumber,
        false,
        null,
        [],
        null,
        false,
        !this.gameStarted ? "Game not started" : "Not player's turn"
      );
    }

    const drawnCards: UnoCard[] = [];
    for (let i = 0; i < count; i++) {
      if (this.deck.length === 0) {
        const topCard = this.discardPile.pop();
        this.deck = this.discardPile;
        this.discardPile = topCard ? [topCard] : [];
        this.deck.sort(() => Math.random() - 0.5);
      }
      const card = this.deck.pop();
      if (card) {
        player.drawCard(card);
        drawnCards.push(card);
      }
    }
    const nextPlayerIndex = this.calculateNextPlayerIndex();
    const turn = new UnoEngineTurn(
      TurnAction.DrawCards,
      player,
      this.players[nextPlayerIndex],
      this.currentColor,
      this.isReverse,
      this.turnNumber,
      true,
      null,
      drawnCards
    );
    this.turnHistory.push(turn);
    this.currentPlayerIndex = nextPlayerIndex;
    return turn;
  }

  sayUno(player: UnoEnginePlayer): UnoEngineTurn {
    this.turnNumber++;
    if (this.players[this.currentPlayerIndex] !== player || !this.gameStarted) {
      return new UnoEngineTurn(
        TurnAction.SayUno,
        player,
        this.players[this.currentPlayerIndex],
        this.currentColor,
        this.isReverse,
        this.turnNumber,
        false,
        null,
        [],
        null,
        false,
        !this.gameStarted ? "Game not started" : "Not player's turn"
      );
    }
    const success = player.sayUno();
    const nextPlayerIndex = this.calculateNextPlayerIndex();
    const turn = new UnoEngineTurn(
      TurnAction.SayUno,
      player,
      this.players[nextPlayerIndex],
      this.currentColor,
      this.isReverse,
      this.turnNumber,
      success,
      null,
      [],
      null,
      false,
      success ? null : "Cannot say UNO with more than one card"
    );
    if (success) {
      this.turnHistory.push(turn);
      this.currentPlayerIndex = nextPlayerIndex;
    }
    return turn;
  }

  private calculateNextPlayerIndex(): number {
    const increment = this.isReverse ? -1 : 1;
    let nextIndex =
      (this.currentPlayerIndex + increment + this.players.length) %
      this.players.length;
    while (!this.players[nextIndex].isActive) {
      nextIndex =
        (nextIndex + increment + this.players.length) % this.players.length;
    }
    return nextIndex;
  }

  getGameState(): {
    currentPlayer: UnoEnginePlayer;
    topCard: UnoCard | null;
    currentColor: CardColor;
    isReverse: boolean;
    gameStarted: boolean;
    turnHistory: UnoEngineTurn[];
  } {
    return {
      currentPlayer: this.players[this.currentPlayerIndex],
      topCard: this.discardPile[this.discardPile.length - 1] || null,
      currentColor: this.currentColor,
      isReverse: this.isReverse,
      gameStarted: this.gameStarted,
      turnHistory: this.turnHistory,
    };
  }
}
