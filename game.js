const animals = [
  { id: "cat", name: "Cat", image: "images/animal-cat.jpg" },
  { id: "dog", name: "Dog", image: "images/animal-dog.jpg" },
  { id: "rabbit", name: "Rabbit", image: "images/animal-rabbit.jpg" },
  { id: "fox", name: "Fox", image: "images/animal-fox.jpg" },
  { id: "owl", name: "Owl", image: "images/animal-owl.jpg" },
  { id: "hedgehog", name: "Hedgehog", image: "images/animal-hedgehog.jpg" },
  { id: "turtle", name: "Turtle", image: "images/animal-turtle.jpg" },
  { id: "koala", name: "Koala", image: "images/animal-koala.jpg" },
  { id: "lion", name: "Lion", image: "images/animal-lion.jpg" },
  { id: "panda", name: "Panda", image: "images/animal-panda.jpg" },
  { id: "otter", name: "Otter", image: "images/animal-otter.jpg" },
  { id: "squirrel", name: "Squirrel", image: "images/animal-squirrel.jpg", groupSize: 3 },
];
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
  const deck = animals.flatMap((animal) =>
    Array.from({ length: animal.groupSize || 2 }, () => ({ ...animal, groupSize: animal.groupSize || 2 })),
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
    (selectedIndex) => cards[selectedIndex].id === firstCard.id,
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
        ? `${card.name}${card.groupSize === 3 ? ", part of the trio" : ", part of a pair"}`
        : `Card ${index + 1}, face down, hamster dressed as Santa`,
    );
    button.setAttribute("aria-pressed", String(card.revealed || card.matched));

    const photo = document.createElement("img");
    photo.className = "card-photo";
    photo.src = "images/hamster-peach.jpg";
    photo.alt = "";
    photo.setAttribute("aria-hidden", "true");
    button.append(photo);

    const animalImage = document.createElement("img");
    animalImage.className = "card-animal";
    animalImage.src = card.image;
    animalImage.alt = "";
    animalImage.setAttribute("aria-hidden", "true");
    button.append(animalImage);

    const hat = document.createElement("img");
    hat.className = "card-back-hat";
    hat.src = "images/santa-hat.svg";
    hat.alt = "";
    hat.setAttribute("aria-hidden", "true");
    button.append(hat);

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
