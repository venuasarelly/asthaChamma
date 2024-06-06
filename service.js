document.addEventListener('DOMContentLoaded', () => {
    const diceButton = document.getElementById('randomButton');
    const diceResult = document.getElementById('randomNumber');
    const gameBoard = document.getElementById('gameBoard');
    const diceSound = document.getElementById('diceSound');
    const gameOverModal = document.getElementById('gameOverModal');
    const modalMessage = document.getElementById('modalMessage');
    const closeModal = document.getElementById('closeModal');
    const restartButton = document.getElementById('restartButton');

    let currentPlayer = 1;
    let currentDiceValue = 0;
    let hasRolledDice = false;

    const safePositions = [
        { row: 2, col: 0 }, { row: 4, col: 2 }, { row: 2, col: 4 }, { row: 0, col: 2 },
        { row: 2, col: 1 }, { row: 2, col: 3 }, { row: 1, col: 2 }, { row: 3, col: 2 }
    ];

    const playerPositions = {
        1: [ { row: 2, col: 0 }, { row: 2, col: 0 }, { row: 2, col: 0 }, { row: 2, col: 0 } ],
        2: [ { row: 2, col: 4 }, { row: 2, col: 4 }, { row: 2, col: 4 }, { row: 2, col: 4 } ]
    };

    const startingPositions = {
        1: { row: 2, col: 0 },
        2: { row: 2, col: 4 }
    };

    const path1 = [
        { row: 2, col: 0 }, { row: 3, col: 0 }, { row: 4, col: 0 }, { row: 4, col: 1 }, { row: 4, col: 2 },
        { row: 4, col: 3 }, { row: 4, col: 4 }, { row: 3, col: 4 }, { row: 2, col: 4 }, { row: 1, col: 4 },
        { row: 0, col: 4 }, { row: 0, col: 3 }, { row: 0, col: 2 }, { row: 0, col: 1 }, { row: 0, col: 0 },
        { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 2, col: 3 },
        { row: 3, col: 3 }, { row: 3, col: 2 }, { row: 3, col: 1 }, { row: 2, col: 1 }
    ];

    const path2 = [
        { row: 2, col: 4 }, { row: 1, col: 4 }, { row: 0, col: 4 }, { row: 0, col: 3 }, { row: 0, col: 2 },
        { row: 0, col: 1 }, { row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 },
        { row: 4, col: 0 }, { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 },
        { row: 3, col: 4 }, { row: 3, col: 3 }, { row: 3, col: 2 }, { row: 3, col: 1 }, { row: 2, col: 1 },
        { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 2, col: 3 }
    ];

    const homePosition = { row: 2, col: 2 };

    function initializeBoard() {
        // Remove all player pieces from the board
        document.querySelectorAll('.cell-image').forEach(piece => piece.remove());

        // Initialize player positions
        playerPositions[1] = [ { row: 2, col: 0 }, { row: 2, col: 0 }, { row: 2, col: 0 }, { row: 2, col: 0 } ];
        playerPositions[2] = [ { row: 2, col: 4 }, { row: 2, col: 4 }, { row: 2, col: 4 }, { row: 2, col: 4 } ];

        // Add the initial player images to their starting positions
        playerPositions[1].forEach((pos, index) => {
            const playerImage = document.createElement('img');
            playerImage.src = 'blue.png';
            playerImage.classList.add('cell-image', `player1-piece-${index}`);
            playerImage.alt = `Player 1 Piece ${index + 1}`;
            playerImage.style.left = `${index * 5}px`; // Adjust the position to prevent overlapping
            playerImage.style.top = `${index * 5}px`; // Adjust the position to prevent overlapping
            gameBoard.rows[pos.row].cells[pos.col].appendChild(playerImage);
        });

        playerPositions[2].forEach((pos, index) => {
            const playerImage = document.createElement('img');
            playerImage.src = 'red.png';
            playerImage.classList.add('cell-image', `player2-piece-${index}`);
            playerImage.alt = `Player 2 Piece ${index + 1}`;
            playerImage.style.left = `${index * 5}px`; // Adjust the position to prevent overlapping
            playerImage.style.top = `${index * 5}px`; // Adjust the position to prevent overlapping
            gameBoard.rows[pos.row].cells[pos.col].appendChild(playerImage);
        });

        // Reset currentPlayer, currentDiceValue, and hasRolledDice
        currentPlayer = 1;
        currentDiceValue = 0;
        hasRolledDice = false;

        // Hide the game over modal
        gameOverModal.style.display = "none";
    }

    diceButton.addEventListener('click', () => {
        if (!hasRolledDice) {
            diceSound.play(); // Play the dice sound
            currentDiceValue = Math.floor(Math.random() * 4) + 1;
            diceResult.textContent = `Player ${currentPlayer}'s Dice Roll Result: ${currentDiceValue}`;
            hasRolledDice = true;
        }
    });

    gameBoard.addEventListener('click', (event) => {
        if (hasRolledDice && event.target.tagName === 'IMG') {
            const pieceClass = Array.from(event.target.classList).find(cls => cls.startsWith(`player${currentPlayer}-piece-`));
            const pieceIndex = parseInt(pieceClass.split('-')[2], 10);

            const currentPos = playerPositions[currentPlayer][pieceIndex];
            const path = currentPlayer === 1 ? path1 : path2;
            const currentIndex = path.findIndex(pos => pos.row === currentPos.row && pos.col === currentPos.col);
            const newIndex = currentIndex + currentDiceValue;

            if (newIndex < path.length) {
                const newPos = path[newIndex];
                updatePiecePosition(currentPlayer, pieceIndex, newPos);
                checkAndHandleCollision(currentPlayer, newPos);
            } else if (newIndex === path.length) {
                updatePiecePosition(currentPlayer, pieceIndex, homePosition);
            }

            if (checkForWin(currentPlayer)) {
                showGameOverMessage(`Player ${currentPlayer} wins!`);
                diceButton.disabled = true; // Disable the dice button
            } else {
                currentPlayer = currentPlayer === 1 ? 2 : 1;
                hasRolledDice = false;
            }
        }
    });

    function updatePiecePosition(player, pieceIndex, newPos) {
        const oldPos = playerPositions[player][pieceIndex];
        const oldCell = gameBoard.rows[oldPos.row].cells[oldPos.col];
        const newCell = gameBoard.rows[newPos.row].cells[newPos.col];
        const piece = oldCell.querySelector(`.player${player}-piece-${pieceIndex}`);
        if (piece) {
            oldCell.removeChild(piece);
            newCell.appendChild(piece);
            playerPositions[player][pieceIndex] = newPos;

            // Reposition all pieces in the new cell to prevent overlapping
            const pieces = newCell.querySelectorAll('.cell-image');
            pieces.forEach((piece, idx) => {
                piece.style.left = `${idx * 5}px`;
                piece.style.top = `${idx * 5}px`;
            });
        }
    }

    function checkAndHandleCollision(currentPlayer, newPos) {
        const otherPlayer = currentPlayer === 1 ? 2 : 1;
        const otherPlayerPieces = playerPositions[otherPlayer];
        const isSafePosition = safePositions.some(pos => pos.row === newPos.row && pos.col === newPos.col);

        if (!isSafePosition) {
            otherPlayerPieces.forEach((pos, index) => {
                if (pos.row === newPos.row && pos.col === newPos.col) {
                    const startingPos = startingPositions[otherPlayer];
                    updatePiecePosition(otherPlayer, index, startingPos);
                }
            });
        }
    }

    function checkForWin(player) {
        return playerPositions[player].every(pos => pos.row === homePosition.row && pos.col === homePosition.col);
    }

    function showGameOverMessage(message) {
        modalMessage.textContent = message;
        gameOverModal.style.display = "block";
    }

    closeModal.addEventListener('click', () => {
        gameOverModal.style.display = "none";
    });

    restartButton.addEventListener('click', () => {
        diceButton.disabled = false;
        initializeBoard();
    });

    // Initialize the game board on page load
    initializeBoard();
});
