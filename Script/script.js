// Game Variables
let currentRow = 0;
let currentColumn = 0;
let targetWord = "";
let maxGuesses = 7;

// Fetch the selected range from localStorage
const currentRange = parseInt(localStorage.getItem("wordRange")) || 5;

// Function to fetch words from the local words.json file
async function fetchWordsFromDatabase() {
    const response = await fetch('DataBase/words.json');
    if (!response.ok) throw new Error("Failed to load word database.");
    return await response.json();
}

// Function to generate a consistent word of the day
async function fetchWordOfTheDay(length) {
    const wordDatabase = await fetchWordsFromDatabase();
    const words = wordDatabase[`${length}_letters`] || [];
    if (words.length === 0) return null;

    // Generate a deterministic index based on the current date
    const today = new Date().toISOString().split("T")[0]; // Get YYYY-MM-DD
    const hash = Array.from(today).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % words.length;

    return words[index];
}

// Function to validate a word using the Datamuse API
async function isValidWord(word) {
    const response = await fetch(`https://api.datamuse.com/words?sp=${word}&max=1`);
    const data = await response.json();
    return data.length > 0 && data[0].word.toUpperCase() === word.toUpperCase();
}

// Start the game
async function startGame() {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Check if today's word for the current range is already solved or lost
    const solvedData = JSON.parse(localStorage.getItem("solvedWord")) || {};
    const lostData = JSON.parse(localStorage.getItem("lostWord")) || {};

    if (solvedData.date === today && solvedData.range === currentRange) {
        alert(`Today's word is already solved: ${solvedData.word}. Try again tomorrow!`);
        window.location.href = "index.html"; // Redirect to index.html
        return;
    }

    if (lostData.date === today && lostData.range === currentRange) {
        alert(`You already lost today's word. Try again tomorrow!`);
        window.location.href = "index.html"; // Redirect to index.html
        return;
    }

    currentRow = 0;
    currentColumn = 0;
    targetWord = await fetchWordOfTheDay(currentRange);

    if (!targetWord) {
        alert("No words available for the selected range.");
        return;
    }

    setupGrid();
    setupKeyboard();

    alert("Game Started! Enter your guesses.");
}



// Setup the game grid
function setupGrid() {
    const gameGrid = document.getElementById("gameGrid");
    gameGrid.innerHTML = "";

    for (let i = 0; i < maxGuesses; i++) {
        const row = document.createElement("div");
        row.className = "row";

        // Dynamically set the grid-template-columns based on currentRange
        if (CSS.supports("grid-template-columns", `repeat(${currentRange}, 40px)`)) {
            row.style.gridTemplateColumns = `repeat(${currentRange}, 40px)`;
        } else {
            console.warn("grid-template-columns is not supported in this browser.");
        }


        for (let j = 0; j < currentRange; j++) {
            const box = document.createElement("div");
            box.className = "letter-box";
            row.appendChild(box);
        }
        gameGrid.appendChild(row);
    }
}

// Setup the on-screen keyboard
function setupKeyboard() {
    const keyboard = document.getElementById("keyboard");
    keyboard.innerHTML = "";

    const rows = [
        "QWERTYUIOP",
        "ASDFGHJKL",
        "⌫ZXCVBNM⏎"
    ];

    rows.forEach((row) => {
        const keyboardRow = document.createElement("div");
        keyboardRow.className = "keyboard-row";

        row.split("").forEach((key) => {
            const button = document.createElement("button");
            button.className = "key";
            button.textContent = key;

            if (key === "⌫") button.id = "backspace";
            if (key === "⏎") button.id = "enter";

            keyboardRow.appendChild(button);
        });

        keyboard.appendChild(keyboardRow);
    });
}

// Handle on-screen keyboard input
document.getElementById("keyboard").addEventListener("click", (event) => {
    const key = event.target;

    if (!key.classList.contains("key")) return;

    const keyValue = key.textContent;

    if (keyValue === "⌫") {
        // Handle backspace
        if (currentColumn > 0) {
            currentColumn--;
            const rows = document.querySelectorAll(".row");
            const box = rows[currentRow].children[currentColumn];
            box.textContent = "";
        }
    } else if (keyValue === "⏎") {
        // Handle enter
        const rows = document.querySelectorAll(".row");
            checkGuess(rows[currentRow]);
    } else if (keyValue.match(/^[a-zA-Z]$/) && currentColumn < currentRange) {
        // Handle letter input
        const rows = document.querySelectorAll(".row");
        const box = rows[currentRow].children[currentColumn];
        box.textContent = keyValue.toUpperCase();
        currentColumn++;
    }
});

// Handle physical keyboard input
document.addEventListener("keydown", (event) => {
    const rows = document.querySelectorAll(".row");

    if (currentRow >= maxGuesses) return;

    if (event.key.match(/^[a-zA-Z]$/) && currentColumn < currentRange) {
        const box = rows[currentRow].children[currentColumn];
        box.textContent = event.key.toUpperCase();
        currentColumn++;
    }

    if (event.key === "Backspace" && currentColumn > 0) {
        currentColumn--;
        const box = rows[currentRow].children[currentColumn];
        box.textContent = "";
    }

    if (event.key === "Enter") {
        checkGuess(rows[currentRow]);
    }
});

// Check the player's guess
async function checkGuess(row) {
    const guess = Array.from(row.children).map((box) => box.textContent).join("");

    // Check if the word is too short
    if (guess.length < currentRange) {
        alert("Word too short. Please type all letters before pressing Enter.");
        return;
    }

    // Validate the guess using the Datamuse API
    const isValid = await isValidWord(guess);
    if (!isValid) {
        alert("Word not found.");
        return;
    }

    let correct = 0;

    guess.split("").forEach((letter, index) => {
        const box = row.children[index];
        setTimeout(() => {
            box.classList.add("flip");
        }, index * 200);

        setTimeout(() => {
            if (letter === targetWord[index]) {
                box.classList.add("correct");
                updateKeyboard(letter, "correct");
                correct++;
            } else if (targetWord.includes(letter)) {
                box.classList.add("present");
                updateKeyboard(letter, "present");
            } else {
                box.classList.add("absent");
                updateKeyboard(letter, "absent");
            }
        }, index * 200 + 300);
    });

    setTimeout(() => {
        if (correct === currentRange) {
            alert(`You win, the word was ${targetWord}.`);

            // Save the solved word and date in localStorage
            const today = new Date().toISOString().split("T")[0];
            localStorage.setItem(
                "solvedWord",
                JSON.stringify({ date: today, range: currentRange, word: targetWord })
            );

            // Redirect to index.html after 5 seconds
            setTimeout(() => {
                window.location.href = "index.html";
            }, 5000);

            currentRow = maxGuesses;
            return;
        }

        currentRow++;
        currentColumn = 0;

        if (currentRow >= maxGuesses) {
            alert(`You lost, the word was ${targetWord}.`);

            // Save the loss information in localStorage
            const today = new Date().toISOString().split("T")[0];
            localStorage.setItem(
                "lostWord",
                JSON.stringify({ date: today, range: currentRange, word: targetWord })
            );

            // Redirect to index.html after 5 seconds
            setTimeout(() => {
                window.location.href = "index.html";
            }, 5000);
        }
    }, currentRange * 200 + 300);
}


// Update keyboard key colors based on guess
function updateKeyboard(letter, status) {
    const keys = document.querySelectorAll(".key");
    keys.forEach((key) => {
        if (key.textContent === letter.toUpperCase()) {
            if (status === "correct") {
                key.classList.remove("present", "absent");
                key.classList.add("correct");
            } else if (status === "present" && !key.classList.contains("correct")) {
                key.classList.remove("absent");
                key.classList.add("present");
            } else if (status === "absent" && !key.classList.contains("correct") && !key.classList.contains("present")) {
                key.classList.add("absent");
            }
        }
    });
}

// Initialize the game
startGame();
