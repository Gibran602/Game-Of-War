let deckId: string | null = null;
let computerScore: number = 0;
let myScore: number = 0;

const cardsContainer = document.getElementById("cards") as HTMLElement;
const newDeckBtn = document.getElementById("new-deck") as HTMLButtonElement;
const drawCardBtn = document.getElementById("draw-cards") as HTMLButtonElement;
const header = document.getElementById("header") as HTMLElement;
const remainingText = document.getElementById("remaining") as HTMLElement;
const computerScoreEl = document.getElementById(
  "computer-score"
) as HTMLElement;
const myScoreEl = document.getElementById("my-score") as HTMLElement;

interface DeckResponse {
  deck_id: string;
  remaining: number;
}

interface Card {
  value: string;
  image: string;
}

interface DrawResponse {
  remaining: number;
  cards: Card[];
}

async function handleClick(): Promise<void> {
  const response = await fetch(
    "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
  );
  const data: DeckResponse = await response.json();
  console.log(data);
  if (remainingText) {
    remainingText.textContent = `Remaining cards: ${data.remaining}`;
  }
  deckId = data.deck_id;
}

drawCardBtn.addEventListener("click", async () => {
  if (!deckId) return;

  const response = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`
  );
  const data: DrawResponse = await response.json();
  console.log(data);

  if (remainingText) {
    remainingText.textContent = `Remaining cards: ${data.remaining}`;
  }

  if (cardsContainer.children.length >= 2) {
    (cardsContainer.children[0] as HTMLElement).innerHTML = `
      <img src="${data.cards[0].image}" class="card" />
    `;
    (cardsContainer.children[1] as HTMLElement).innerHTML = `
      <img src="${data.cards[1].image}" class="card" />
    `;
  }

  const winnerText = determineCardWinner(data.cards[0], data.cards[1]);
  if (header) header.textContent = winnerText;

  if (data.remaining === 0) {
    drawCardBtn.disabled = true;
    determineGameWinner(myScore, computerScore);
  }
});

function determineCardWinner(card1: Card, card2: Card): string {
  const valueOptions: string[] = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "JACK",
    "QUEEN",
    "KING",
    "ACE",
  ];

  const card1ValueIndex = valueOptions.indexOf(card1.value);
  const card2ValueIndex = valueOptions.indexOf(card2.value);

  if (card1ValueIndex > card2ValueIndex) {
    computerScore++;
    if (computerScoreEl) {
      computerScoreEl.textContent = `Computer score: ${computerScore}`;
    }
    return "Computer wins!";
  } else if (card1ValueIndex < card2ValueIndex) {
    myScore++;
    if (myScoreEl) {
      myScoreEl.textContent = `Player score: ${myScore}`;
    }
    return "You win!";
  } else {
    return "War!";
  }
}

function determineGameWinner(playerScore: number, computerScore: number): void {
  if (!header) return;

  if (playerScore > computerScore) {
    header.textContent = `Player Wins The Game!`;
  } else if (playerScore < computerScore) {
    header.textContent = `Computer Wins The Game!`;
  } else {
    header.textContent = `Tie!`;
  }
}

function resetGame(): void {
  myScore = 0;
  computerScore = 0;
  deckId = null;

  drawCardBtn.disabled = false;

  if (myScoreEl) myScoreEl.textContent = `Player score: ${myScore}`;
  if (computerScoreEl)
    computerScoreEl.textContent = `Computer score: ${computerScore}`;
  if (header) header.textContent = `Game of War`;

  if (cardsContainer) {
    cardsContainer.innerHTML = `
      <div class="card-slot"></div>
      <div class="card-slot"></div>
    `;
  }
}

newDeckBtn.addEventListener("click", () => {
  resetGame();
  handleClick();
});
