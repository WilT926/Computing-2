// File: web-app/tests/main.tests.js
/* eslint-disable */

// Import Ramda (assuming 'ramda' is installed via npm and used in your modules)
import R from '../ramda.js';

// Import the CatanLogic object and configBase from your modules
// Adjust paths if your test file is located differently relative to the 'modules' folder.
// This assumes 'main.tests.js' is in 'web-app/tests/'
import { configBase } from '../modules/catanconfig.js';
import CatanLogic from '../modules/catanlogic.js'; // Default import

// Helper for displaying data in error messages
function formatForError(data) {
    try {
        return JSON.stringify(data, null, 2);
    } catch (e) {
        return String(data);
    }
}

describe('Catan Logic Module (CatanLogic object tests)', function () {
    // Use a subset of configBase or the full configBase for tests
    // The methods on CatanLogic are designed to take parameters for what they need from config
    const testHexSize = configBase.HEX_SIZE;
    const testTileTypes = configBase.tileTypes;

    describe('CatanLogic.axialToPixel', function () {
        it('should correctly convert origin (0,0)', function () {
            const result = CatanLogic.axialToPixel(0, 0, testHexSize);
            const expected = { x: 0, y: 0 };
            if (!R.equals(result, expected)) {
                throw new Error(
                    `CatanLogic.axialToPixel(0,0) failed.\nExpected: ${formatForError(expected)}\nGot: ${formatForError(result)}`
                );
            }
        });

        it('should correctly convert (1,0)', function () {
            const result = CatanLogic.axialToPixel(1, 0, testHexSize);
            const expectedX = testHexSize * Math.sqrt(3);
            const expectedY = 0;
            const delta = 0.001;
            if (
                Math.abs(result.x - expectedX) > delta ||
                Math.abs(result.y - expectedY) > delta
            ) {
                throw new Error(
                    `CatanLogic.axialToPixel(1,0) failed.\nExpected x ~${expectedX.toFixed(3)}, y ~${expectedY.toFixed(3)}\nGot: ${formatForError(result)}`
                );
            }
        });

        it('should correctly convert (0,1)', function () {
            const result = CatanLogic.axialToPixel(0, 1, testHexSize);
            const expectedX = (testHexSize * Math.sqrt(3)) / 2;
            const expectedY = (testHexSize * 3) / 2;
            const delta = 0.001;
            if (
                Math.abs(result.x - expectedX) > delta ||
                Math.abs(result.y - expectedY) > delta
            ) {
                throw new Error(
                    `CatanLogic.axialToPixel(0,1) failed.\nExpected x ~${expectedX.toFixed(3)}, y ~${expectedY.toFixed(3)}\nGot: ${formatForError(result)}`
                );
            }
        });
    });

    describe('CatanLogic.generateTiles', function () {
        const tiles = CatanLogic.generateTiles(testTileTypes);
        const expectedTotalTiles = Object.values(testTileTypes).reduce(
            (sum, type) => sum + type.count,
            0
        );

        it('should generate the correct total number of tiles', function () {
            if (tiles.length !== expectedTotalTiles) {
                throw new Error(
                    `CatanLogic.generateTiles total count failed.\nExpected: ${expectedTotalTiles}\nGot: ${tiles.length}`
                );
            }
        });

        it('should generate correct counts for each tile type', function () {
            for (const typeKey in testTileTypes) {
                const typeInfo = testTileTypes[typeKey];
                const count = tiles.filter(
                    (t) => t.name === typeInfo.name
                ).length;
                if (count !== typeInfo.count) {
                    throw new Error(
                        `CatanLogic.generateTiles count for ${typeInfo.name} failed.\nExpected: ${typeInfo.count}\nGot: ${count}`
                    );
                }
            }
        });
    });

    describe('CatanLogic.shuffleTiles', function () {
        it('should maintain all original elements and length after shuffle', function () {
            const originalTiles = [
                { id: 1 },
                { id: 2 },
                { id: 3 },
                { id: 4 },
                { id: 5 },
            ];
            // CatanLogic.shuffleTiles uses the 'R' imported at the top of catanlogic.js
            const shuffled = CatanLogic.shuffleTiles([...originalTiles]);

            if (shuffled.length !== originalTiles.length) {
                throw new Error(
                    `CatanLogic.shuffleTiles length mismatch.\nExpected: ${originalTiles.length}\nGot: ${shuffled.length}`
                );
            }

            originalTiles.forEach((originalTile) => {
                const found = shuffled.some((shuffledTile) =>
                    R.equals(shuffledTile, originalTile)
                );
                if (!found) {
                    throw new Error(
                        `CatanLogic.shuffleTiles missing original tile: ${formatForError(originalTile)}\nShuffled: ${formatForError(shuffled)}`
                    );
                }
            });

            if (originalTiles.length > 1 && R.equals(shuffled, originalTiles)) {
                console.warn(
                    'CatanLogic.shuffleTiles produced the same order as original; this can happen randomly.'
                );
            }
        });
    });

    describe('CatanLogic.createIrregularPolygon', function () {
        it('should return a string of points', function () {
            const pointsStr = CatanLogic.createIrregularPolygon(
                100,
                100,
                50,
                10,
                0.1
            );
            if (typeof pointsStr !== 'string') {
                throw new Error(
                    `CatanLogic.createIrregularPolygon did not return a string. Got: ${typeof pointsStr}`
                );
            }
            if (pointsStr.length === 0 || !pointsStr.includes(',')) {
                throw new Error(
                    `CatanLogic.createIrregularPolygon returned an invalid points string: "${pointsStr}"`
                );
            }
        });

        it('should generate the specified number of points', function () {
            const numPoints = 12;
            const pointsStr = CatanLogic.createIrregularPolygon(
                0,
                0,
                30,
                numPoints,
                0.2
            );
            const pointsArray = pointsStr
                .split(' ')
                .filter((p) => p.length > 0);
            if (pointsArray.length !== numPoints) {
                throw new Error(
                    `CatanLogic.createIrregularPolygon point count failed.\nExpected: ${numPoints}\nGot: ${pointsArray.length}\nPoints: "${pointsStr}"`
                );
            }
        });
    });

    describe('CatanLogic.getHexagonVerticesSVG', function () {
        const hexSize = configBase.HEX_SIZE;
        const center = { x: 100, y: 100 };

        it('should return an array of 6 vertices', function () {
            const vertices = CatanLogic.getHexagonVerticesSVG(center, hexSize);
            if (!Array.isArray(vertices) || vertices.length !== 6) {
                throw new Error(
                    `Expected 6 vertices, got ${vertices ? vertices.length : 'not an array'}`
                );
            }
        });

        it('a vertex should have x and y properties', function () {
            const vertices = CatanLogic.getHexagonVerticesSVG(center, hexSize);
            const firstVertex = vertices[0];
            if (
                typeof firstVertex.x !== 'number' ||
                typeof firstVertex.y !== 'number'
            ) {
                throw new Error(
                    `Vertex should have numeric x and y properties. Got: ${formatForError(firstVertex)}`
                );
            }
        });

        it('all vertices should be approximately hexSize distance from the center', function () {
            const vertices = CatanLogic.getHexagonVerticesSVG(center, hexSize);
            const delta = 0.01;
            vertices.forEach((v, index) => {
                const dist = Math.sqrt(
                    Math.pow(v.x - center.x, 2) + Math.pow(v.y - center.y, 2)
                );
                if (Math.abs(dist - hexSize) > delta) {
                    throw new Error(
                        `Vertex ${index} distance from center is wrong. Expected ~${hexSize}, Got: ${dist.toFixed(3)}`
                    );
                }
            });
        });
    });
});
