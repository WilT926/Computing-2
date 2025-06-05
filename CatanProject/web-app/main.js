// File: web-app/main-app.js
import R from './ramda.js';
import { configBase } from './modules/catanconfig.js';
import CatanLogic from './modules/catanlogic.js';
import CatanUI from './modules/catanui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check if Ramda and necessary functions are loaded
    if (typeof R === 'undefined' || typeof R.sortBy !== 'function') {
        console.error('Ramda library (R) is not correctly available.');
        return;
    }
    console.log('Ramda (R) object is available:', R);

    // Create the full runtime config, including the SVG element
    const runtimeConfig = {
        ...configBase, // Spread properties from the base config
        svgBoardElement: document.getElementById('catan-board-svg'),
        // If VIEWBOX_WIDTH/HEIGHT were dynamic, get them here too:
        // VIEWBOX_WIDTH: document.getElementById("catan-board-svg").viewBox.baseVal.width || configBase.VIEWBOX_WIDTH,
        // VIEWBOX_HEIGHT: document.getElementById("catan-board-svg").viewBox.baseVal.height || configBase.VIEWBOX_HEIGHT,
    };

    if (!runtimeConfig.svgBoardElement) {
        console.error(
            'CRITICAL: Could not find SVG element with ID ',
            catan - board - svg,
            '!'
        );
        return;
    }
    console.log(
        'SVG Board Element reference acquired:',
        runtimeConfig.svgBoardElement
    );

    function initGame() {
        console.log('initGame() called.');
        // Pass relevant part of config
        const allTiles = CatanLogic.generateTiles(runtimeConfig.tileTypes);

        if (allTiles.length !== runtimeConfig.axialCoordinates.length) {
            console.error('Tile count/coordinate mismatch.');
            return;
        }
        // Uses imported R
        const shuffledTiles = CatanLogic.shuffleTiles(allTiles);
        const hexagonsData = CatanUI.renderBoard(
            runtimeConfig.svgBoardElement,
            runtimeConfig,
            shuffledTiles
        );
        if (hexagonsData && hexagonsData.length > 0) {
            CatanUI.createInteractiveElements(
                runtimeConfig.svgBoardElement,
                runtimeConfig,
                hexagonsData
            );
        } else {
            console.error(
                'Board rendering failed or produced no data, skipping interactive elements.'
            );
        }
    }

    const gameState = {
        players: [
            {
                id: 1,
                playerName: 'Player 1',
                colour: '#ffffff',
                resources: { lumber: 0, wool: 0, brick: 0, ore: 0, grain: 0 },
                victoryPoints: 0,
            },
            {
                id: 2,
                playerName: 'Player 2',
                colour: '#ffffff',
                resources: { lumber: 0, wool: 0, brick: 0, ore: 0, grain: 0 },
                victoryPoints: 0,
            },
            {
                id: 3,
                playerName: 'Player 3',
                colour: '#ffffff',
                resources: { lumber: 0, wool: 0, brick: 0, ore: 0, grain: 0 },
                victoryPoints: 0,
            },
            {
                id: 4,
                playerName: 'Player 4',
                colour: '#ffffff',
                resources: { lumber: 0, wool: 0, brick: 0, ore: 0, grain: 0 },
                victoryPoints: 0,
            },
        ],
        currentPlayerIndex: 0,
        gamePhase: 'SetupPlacement1',
    };

    function getCurrentPlayer() {
        return gameState.players[gameState.currentPlayerIndex];
    }

    function nextPlayer() {
        gameState.currentPlayerIndex =
            (gameState.currentPlayerIndex + 1) % gameState.players.length;
        console.log(`It is now ${getCurrentPlayer().playerName}"s turn.`);
    }

    console.log(
        'main-app.js loaded and DOMContentLoaded. Initializing Catan board...'
    );
    initGame();
});
