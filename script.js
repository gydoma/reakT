
// TODO: make the game more customizable - eg. time limit, custom modes like 
// TODO: (Tricky Colors | Color Namer | basic-numbers), etc.

const directions = ["UP", "DOWN", "LEFT", "RIGHT"];
let currentDirection = "";
let correctAttempts = 0;
let totalAttempts = 0;
let gameActive = false;
let countdownInterval;
let startTime;
let totalReactionTime = 0;

const directionDisplay = document.getElementById("direction");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const countdownDisplay = document.getElementById("countdown");
const hintDisplay = document.getElementById("hint");

const arrowElements = {
    ArrowUp: document.querySelector(".arrow.up"),
    ArrowDown: document.querySelector(".arrow.down"),
    ArrowLeft: document.querySelector(".arrow.left"),
    ArrowRight: document.querySelector(".arrow.right")
};

const leaderboardButton = document.getElementById("leaderboardButton");
const leaderboardContainer = document.getElementById("leaderboardContainer");
const leaderboardTableBody = document.querySelector("#leaderboardTable tbody");
const nameInput = document.getElementById("nameInput");

leaderboardButton.addEventListener("click", () => {
    leaderboardContainer.classList.toggle("hidden");
    loadLeaderboard();
});

function saveScore(name, points) {
    //? i wrote this code, and iam the only one who don't know what is going on here
    const dateTime = new Date().toISOString().replace("T", " ").split(".")[0];
    const leaderboard = getCookie("leaderboard") ? JSON.parse(getCookie("leaderboard")) : [];
    leaderboard.push({ name, dateTime, points });
    setCookie("leaderboard", JSON.stringify(leaderboard), 365);
}

function loadLeaderboard() {
    //! welp, maybe change the table into a much more modern thingy
    const leaderboard = getCookie("leaderboard") ? JSON.parse(getCookie("leaderboard")) : [];
    leaderboardTableBody.innerHTML = "";
    leaderboard.forEach(entry => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${entry.name}</td><td>${entry.dateTime}</td><td>${entry.points}</td>`;
        leaderboardTableBody.appendChild(row);
    });
}

function setCookie(name, value, days) {
    const d = new Date();
    //! find better way to set the expiration date
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cname) == 0) {
            return c.substring(cname.length, c.length);
        }
    }
    return "";
}

function getRandomDirection() {
    //? is this really the best way to get random direction?
    return directions[Math.floor(Math.random() * directions.length)];
}

function startGame() {
    gameActive = true;
    correctAttempts = 0;
    totalAttempts = 0;
    totalReactionTime = 0;
    //! think about a better way to display the hint
    hintDisplay.classList.add("hidden");
    startCountdown();
    nextDirection();
}

// TODO: make stopSafe function

function stopGame() {
    gameActive = false;
    clearInterval(countdownInterval);
    const averageReactionTime = totalAttempts > 0 ? (totalReactionTime / totalAttempts).toFixed(2) : 0;
    //op: 0.00%
    const accuracyPercentage = totalAttempts > 0 ? (correctAttempts / totalAttempts * 100).toFixed(2) : 0;
    //!tf+r
    const calculatedPoints = (correctAttempts / totalAttempts) * averageReactionTime;
    directionDisplay.textContent = `${correctAttempts} / ${totalAttempts}, AP: ${accuracyPercentage}%, ART: ${averageReactionTime} ms`;
    hintDisplay.classList.remove("hidden");
    saveScore(nameInput.value || "anonymous", calculatedPoints);
}

function nextDirection() {
    if (!gameActive) return;
    currentDirection = getRandomDirection();
    directionDisplay.textContent = currentDirection;
    directionDisplay.style.color = "#abb2bf";
    startTime = new Date().getTime();
}

function handleKeyPress(event) {
    if (!gameActive) return;

    const keyMap = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT"
    };

    if (keyMap[event.key]) {
        const reactionTime = new Date().getTime() - startTime;
        totalReactionTime += reactionTime;
        totalAttempts++;
        if (keyMap[event.key] === currentDirection) {
            correctAttempts++;
            directionDisplay.style.color = "#98c379";
        } else {
            directionDisplay.style.color = "#e06c75";
        }
        setTimeout(nextDirection, 200);

        arrowElements[event.key].classList.add("pressed");
        setTimeout(() => {
            arrowElements[event.key].classList.remove("pressed");
        }, 100);
    }
}

function startCountdown() {
    let timeLeft = 20;
    const startTime = Date.now();
    countdownInterval = setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 1000;
        timeLeft = 20 - elapsedTime;
        countdownDisplay.textContent = timeLeft.toFixed(2) + "s";
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            countdownDisplay.textContent = "Time's up!";
            stopGame();
        }
    }, 10);
}

function handleControlKeyPress(event) {
    if (event.key === "Enter") {
        stopGame();
        startGame();
    } else if (event.key === "Escape") {
        stopGame();
    }
}

startButton.addEventListener("click", startGame);
stopButton.addEventListener("click", stopGame);
window.addEventListener("keydown", handleKeyPress);
window.addEventListener("keydown", handleControlKeyPress);
