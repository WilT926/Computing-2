// File: web-app/modules/catan-logic.js
import R from '../ramda.js';
// configBase will be passed or specific values from it will be passed to functions here

const CatanLogic = Object.create(null);

/**
 * Converts axial hex grid coordinates to pixel/SVG unit coordinates.
 * @memberof CatanLogic
 * @function axialToPixel
 * @param {number} q - The 'q' axial coordinate.
 * @param {number} r - The 'r' axial coordinate.
 * @param {number} hexSize - The true radius of the hexagon.
 * @returns {{x: number, y: number}} Pixel/SVG coordinates.
 */
CatanLogic.axialToPixel = function (q, r, hexSize) {
    const x = hexSize * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
    const y = hexSize * (3 / 2 * r);
    return { x, y };
}

/**
 * Generates the initial array of tile objects.
 * @memberof CatanLogic
 * @function generateTiles
 * @param {Object} tileTypesConfig - The tileTypes section of the configuration.
 * @returns {Array<Object>} Array of tile objects.
 */

CatanLogic.generateTiles = function (tileTypesConfig) {
    let tiles = [];
    for (const typeKey in tileTypesConfig) {
        const type = tileTypesConfig[typeKey];
        for (let i = 0; i < type.count; i++) {
            tiles.push({ ...type });
        }
    }
    return tiles;
}

/**
 * Shuffles an array of tiles.
 * @memberof CatanLogic
 * @function shuffleTiles
 * @param {Array<Object>} tiles - Array of tiles to shuffle.
 * @returns {Array<Object>} Shuffled array of tiles.
 */
CatanLogic.shuffleTiles = function(tiles) {
    return R.sortBy(() => Math.random(), tiles);
}

/**
 * Creates an array of points for an irregular polygon.
 * @memberof CatanLogic
 * @function createIrregularPolygon
 * @param {number} centerX - Center X.
 * @param {number} centerY - Center Y.
 * @param {number} avgRadius - Average radius.
 * @param {number} numPoints - Number of points.
 * @param {number} irregularity - Irregularity factor.
 * @returns {string} Points string.
 */
CatanLogic.createIrregularPolygon = function (centerX, centerY, avgRadius, numPoints, irregularity) {
    const points = [];
    const angleStep = (Math.PI * 2) / numPoints;
    for (let i = 0; i < numPoints; i++) {
        const currentAngleBase = angleStep * i;
        const radiusFluctuation = avgRadius * irregularity * (Math.random() - 0.5) * 2;
        const radius = avgRadius + radiusFluctuation;
        const angleFluctuation = angleStep * irregularity * (Math.random() - 0.5);
        const currentAngle = currentAngleBase + angleFluctuation;
        const x = centerX + radius * Math.cos(currentAngle);
        const y = centerY + radius * Math.sin(currentAngle);
        points.push(`${x.toFixed(3)},${y.toFixed(3)}`);
    }
    return points.join(' ');
}

/**
 * Calculates SVG coordinates of hexagon vertices.
 * @memberof CatanLogic
 * @function getHexagonVerticesSVG
 * @param {{x: number, y: number}} svgCenterPos - Center coordinates.
 * @param {number} hexSize - The true radius of the hexagon.
 * @returns {Array<{x: number, y: number}>} Array of vertex coordinates.
 */
CatanLogic.getHexagonVerticesSVG = function (svgCenterPos, hexSize) {
    const vertices = [];
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 180 * (60 * i - 30);
        const x = svgCenterPos.x + hexSize * Math.cos(angle);
        const y = svgCenterPos.y + hexSize * Math.sin(angle);
        vertices.push({ x: parseFloat(x.toFixed(3)), y: parseFloat(y.toFixed(3)) });
    }
    return vertices;
}

export default CatanLogic;