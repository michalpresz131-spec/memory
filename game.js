const symbols = ["🍓", "🌼", "🐝", "🍋", "🐸", "🌷", "🍄", "🐞", "🍐", "🦋", "🌱"];
const trioSymbol = "🍒";
const mismatchDelay = 850;

const board = document.querySelector("#board");
const movesDisplay = document.querySelector("#moves");
const matchesDisplay = document.querySelector("#matches");
const timerDisplay = document.querySelector("#timer");
const statusDisplay = document.querySelector("#status");
const restartButton = document.querySelector("#restart");

let cards = [];
let selectedCards = [];
let moves = 0;
let matchedSets = 0;
let elapsedSeconds = 0;
let timerInterval = null;
let mismatchTimeout = null;
let locked = false;
let started = false;

function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function updateStats() {
  movesDisplay.textContent = moves;
  matchesDisplay.textContent = matchedSets;
  timerDisplay.textContent = formatTime(elapsedSeconds);
}

function startTimer() {
  if (started) return;

  started = true;
  timerInterval = window.setInterval(() => {
    elapsedSeconds += 1;
    timerDisplay.textContent = formatTime(elapsedSeconds);
  }, 1000);
}

function makeDeck() {
  const deck = symbols.flatMap((symbol) => [
    { symbol, groupSize: 2 },
    { symbol, groupSize: 2 },
  ]);
  deck.push(
    { symbol: trioSymbol, groupSize: 3 },
    { symbol: trioSymbol, groupSize: 3 },
    { symbol: trioSymbol, groupSize: 3 },
  );
  return shuffle(deck);
}

function setStatus(message) {
  statusDisplay.textContent = message;
}

function finishGame() {
  window.clearInterval(timerInterval);
  setStatus(`Lovely! You finished in ${formatTime(elapsedSeconds)}`);
}

function handleCardClick(index) {
  const card = cards[index];

  if (locked || card.revealed || card.matched) return;

  startTimer();
  card.revealed = true;
  selectedCards.push(index);
  renderBoard();

  if (selectedCards.length === 1) {
    const targetCount = card.groupSize;
    setStatus(`Find ${targetCount === 3 ? "3 matching cards" : "a matching pair"}`);
    return;
  }

  const firstCard = cards[selectedCards[0]];
  const completeSet = selectedCards.length === firstCard.groupSize;

  if (!completeSet) return;

  moves += 1;
  updateStats();
  locked = true;

  const isMatch = selectedCards.every(
    (selectedIndex) => cards[selectedIndex].symbol === firstCard.symbol,
  );

  if (isMatch) {
    selectedCards.forEach((selectedIndex) => {
      cards[selectedIndex].matched = true;
    });
    selectedCards = [];
    matchedSets += 1;
    updateStats();

    if (matchedSets === 12) {
      finishGame();
    } else {
      locked = false;
      setStatus("Beautiful match!");
    }

    renderBoard();
    return;
  }

  setStatus("Not quite — take another look");
  mismatchTimeout = window.setTimeout(() => {
    selectedCards.forEach((selectedIndex) => {
      cards[selectedIndex].revealed = false;
    });
    selectedCards = [];
    locked = false;
    mismatchTimeout = null;
    setStatus("Find a pair to begin");
    renderBoard();
  }, mismatchDelay);
}

function renderBoard() {
  board.replaceChildren();

  cards.forEach((card, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "card";

    if (card.revealed) button.classList.add("is-revealed");
    if (card.matched) button.classList.add("is-matched");
    if (card.matched || locked) button.disabled = true;

    button.setAttribute(
      "aria-label",
      card.revealed || card.matched
        ? `${card.symbol}${card.groupSize === 3 ? ", part of the trio" : ", part of a pair"}`
        : `Card ${index + 1}, face down, hamster dressed as Santa`,
    );
    button.setAttribute("aria-pressed", String(card.revealed || card.matched));

    const photo = document.createElement("img");
    photo.className = "card-photo";
    photo.src = "images/hamster-peach.jpg";
    photo.alt = "";
    photo.setAttribute("aria-hidden", "true");
    button.append(photo);

    const hat = document.createElement("img");
    hat.className = "card-back-hat";
    hat.src = "images/santa-hat.svg";
    hat.alt = "";
    hat.setAttribute("aria-hidden", "true");
    button.append(hat);

    const symbol = document.createElement("span");
    symbol.className = "card-emoji";
    symbol.setAttribute("aria-hidden", "true");
    symbol.textContent = card.symbol;
    button.append(symbol);

    button.addEventListener("click", () => handleCardClick(index));
    board.append(button);
  });
}

function resetGame() {
  window.clearInterval(timerInterval);
  window.clearTimeout(mismatchTimeout);
  cards = makeDeck().map((card) => ({ ...card, revealed: false, matched: false }));
  selectedCards = [];
  moves = 0;
  matchedSets = 0;
  elapsedSeconds = 0;
  timerInterval = null;
  mismatchTimeout = null;
  locked = false;
  started = false;
  updateStats();
  setStatus("Find a pair to begin");
  renderBoard();
}

restartButton.addEventListener("click", resetGame);
resetGame();
