const square = document.querySelectorAll('.square');
const mole = document.querySelectorAll('.mole');
const timeLeft = document.querySelector('#time-left');
const score = document.querySelector('#score');

let result = 0;
let currentTime = timeLeft.textContent;
let hitPosition;

function hitHandler(id, hitPosition) {
  if (id === hitPosition) {
    result = result + 1;
    score.textContent = result;
    hitPosition = null;
  }
}

function randomSquare() {
  square.forEach((className) => {
    className.classList.remove('mole');
  });
  let randomPosition = square[Math.floor(Math.random() * 9)];
  randomPosition.classList.add('mole');

  // assign the id of the randomPosition to hitPosition for us to use later
  hitPosition = randomPosition.id;
}

square.forEach((id) => {
  id.addEventListener('mouseup', () => {
    hitHandler(id.id, hitPosition);
  });
});

function moveMole() {
  let timerId = null;
  timerId = setInterval(randomSquare, 500);
}

function countDown() {
  currentTime--;
  timeLeft.textContent = currentTime;

  if (currentTime === 0) {
    clearInterval(timerId);
    alert('GAME OVER! Your final score is' + result);
  }
}

function startMole() {
  // moveMole();
  // setInterval(countDown, 1000);
}

window.addEventListener('DOMContentLoaded', () => {
  // startMole()
});
