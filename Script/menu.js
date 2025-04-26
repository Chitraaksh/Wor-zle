let currentRange = 5; // Default range

// Initialize solvedWords and lostWords arrays in localStorage
if (!localStorage.getItem("solvedWords")) {
    localStorage.setItem("solvedWords", JSON.stringify([]));
}
if (!localStorage.getItem("lostWords")) {
    localStorage.setItem("lostWords", JSON.stringify([]));
}

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
    const solvedWords = JSON.parse(localStorage.getItem("solvedWords")) || [];
    const lostWords = JSON.parse(localStorage.getItem("lostWords")) || [];
    const startButton = document.getElementById("startButton");

    // Check if the current range is solved
    const solvedEntry = solvedWords.find(entry => entry.date === today && entry.range === currentRange);
    if (solvedEntry) {
        startButton.disabled = true;
        startButton.textContent = `Solved! Today's word: ${solvedEntry.word}`;
        startButton.classList.add("startbtn-disabled");
        return;
    }

    // Check if the current range is lost
    const lostEntry = lostWords.find(entry => entry.date === today && entry.range === currentRange);
    if (lostEntry) {
        startButton.disabled = true;
        startButton.textContent = `Lost! Word : ${lostEntry.word}`;
        startButton.classList.add("startbtn-disabled");
        return;
    }

    // If not solved or lost, enable the start button
    startButton.disabled = false;
    startButton.textContent = "Start Game";
    startButton.classList.remove("startbtn-disabled");
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
