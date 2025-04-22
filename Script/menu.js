let currentRange = 5; // Default range

// Update the displayed range
function updateRangeDisplay() {
    document.getElementById("rangeDisplay").textContent = `${currentRange} Letters`;
    updateButtonStates(); // Check and update button states
}

// Enable/disable buttons based on the range
function updateButtonStates() {
    const incrementButton = document.getElementById("incrementButton");
    const decrementButton = document.getElementById("decrementButton");

    // Update increment button state and class
    if (currentRange >= 7) {
        incrementButton.disabled = true;
        incrementButton.classList.add("button-disabled");
        incrementButton.classList.remove("increment-enabled");
    } else {
        incrementButton.disabled = false;
        incrementButton.classList.add("increment-enabled");
        incrementButton.classList.remove("button-disabled");
    }

    // Update decrement button state and class
    if (currentRange <= 3) {
        decrementButton.disabled = true;
        decrementButton.classList.add("button-disabled");
        decrementButton.classList.remove("decrement-enabled");
    } else {
        decrementButton.disabled = false;
        decrementButton.classList.add("decrement-enabled");
        decrementButton.classList.remove("button-disabled");
    }
}

// Check if today's word for the current range is solved or lost
function checkGameState() {
    const today = new Date().toISOString().split("T")[0];
    const solvedData = JSON.parse(localStorage.getItem("solvedWord")) || {};
    const lostData = JSON.parse(localStorage.getItem("lostWord")) || {};
    const startButton = document.getElementById("startButton");

    if (solvedData.date === today && solvedData.range === currentRange) {
        startButton.disabled = true;
        startButton.textContent = `Today's word is solved: ${solvedData.word}`;
        startButton.classList.add("startbtn-disabled");
    } else if (lostData.date === today && lostData.range === currentRange) {
        startButton.disabled = true;
        startButton.textContent = `Today's word was: ${lostData.word}`;
        startButton.classList.add("startbtn-disabled");
    } else {
        startButton.disabled = false;
        startButton.textContent = "Start Game";
        startButton.classList.remove("startbtn-disabled");
    }
}

// Increment the range
document.getElementById("incrementButton").addEventListener("click", () => {
    if (currentRange < 7) {
        currentRange++;
        updateRangeDisplay();
        checkGameState(); // Recheck game state for the new range
    }
});

// Decrement the range
document.getElementById("decrementButton").addEventListener("click", () => {
    if (currentRange > 3) {
        currentRange--;
        updateRangeDisplay();
        checkGameState(); // Recheck game state for the new range
    }
});

// Save the range to localStorage for the game page to use
document.getElementById("startButton").addEventListener("click", () => {
    localStorage.setItem("wordRange", currentRange);
});

// Initialize the display and button states on page load
updateRangeDisplay();
checkGameState();

