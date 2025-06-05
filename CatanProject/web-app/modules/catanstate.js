const gameState = Object.create(null);

gameState.players = [
    {
        id: 1,
        name: 'Player 1',
        color: '#C93434',
        resources: { lumber: 0, brick: 0, wool: 0, grain: 0, ore: 0 },
        victoryPoints: 0,
    },
    {
        id: 2,
        name: 'Player 2',
        color: '#3455C9',
        resources: { lumber: 0, brick: 0, wool: 0, grain: 0, ore: 0 },
        victoryPoints: 0,
    },
    {
        id: 3,
        name: 'Player 3',
        color: '#34C942',
        resources: { lumber: 0, brick: 0, wool: 0, grain: 0, ore: 0 },
        victoryPoints: 0,
    },
    {
        id: 4,
        name: 'Player 4',
        color: '#C9C434',
        resources: { lumber: 0, brick: 0, wool: 0, grain: 0, ore: 0 },
        victoryPoints: 0,
    },
];

gameState.currentPlayerIndex = 0; // Player 1 starts
gameState.gamePhase = 'SetupPlacement1'; // e.g., 'SETUP_PLACEMENT_1', 'SETUP_PLACEMENT_2', 'PLAYER_TURN'
// ... we will add more properties here later, like the robber's location

gameState.getCurrentPlayer = function getCurrentPlayer() {
    return gameState.players[gameState.currentPlayerIndex];
};

gameState.nextPlayer = function nextPlayer() {
    gameState.currentPlayerIndex =
        (gameState.currentPlayerIndex + 1) % gameState.players.length;
    const currentPlayer = this.getCurrentPlayer();
    // You could update a UI element here to show whose turn it is
    console.log(`It is now ${currentPlayer.playerName}'s turn.`);
};

export default gameState;
