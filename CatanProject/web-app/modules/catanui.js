// File: web-app/modules/catan-svg-renderer.js

import { SVG_NS } from './catanconfig.js'; // Use importedConfigBase if needed for defaults
import CatanLogic from './catanlogic.js';

const CatanUI = Object.create(null);

/**
 * Utility function to set multiple attributes on an SVG or HTML element.
 * @param {Element} el - The DOM element.
 * @param {Object.<string, (string|number|boolean)>} attrs - Attributes object.
 */
CatanUI.setAttributes = function setAttributes(el, attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
        el.setAttribute(key, value);
    });
};

/**
 * Creates and defines a reusable SVG <clipPath> for hexagons.
 * @param {SVGElement} svgBoardEl - The main SVG board element.
 * @param {Object} currentConfig - The runtime config object with HEX_SIZE, HEX_VISUAL_OFFSET.
 */
CatanUI.defineHexagonClipPath = function defineHexagonClipPath(
    svgBoardEl,
    currentConfig
) {
    console.log('defineHexagonClipPath() called.');
    let defs = svgBoardEl.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS(SVG_NS, 'defs');
        svgBoardEl.appendChild(defs);
    }
    let clipPath = defs.querySelector('#hexagon-clip');
    if (clipPath) return;

    clipPath = document.createElementNS(SVG_NS, 'clipPath');
    clipPath.id = 'hexagon-clip';
    const clipPolygon = document.createElementNS(SVG_NS, 'polygon');
    const points = [];
    const visualRadius =
        currentConfig.HEX_SIZE - currentConfig.HEX_VISUAL_OFFSET;
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i - 30);
        points.push(
            `${(visualRadius * Math.cos(angle)).toFixed(3)},${(visualRadius * Math.sin(angle)).toFixed(3)}`
        );
    }
    CatanUI.setAttributes(clipPolygon, { points: points.join(' ') });
    clipPath.appendChild(clipPolygon);
    defs.appendChild(clipPath);
};

/**
 * Renders the layered island background.
 * @param {SVGElement} svgBoardEl - The main SVG board element.
 * @param {Object} currentConfig - The runtime config object.
 */
CatanUI.renderIslandBackground = function renderIslandBackground(
    svgBoardEl,
    currentConfig
) {
    console.log('renderIslandBackground() called.');
    const centerX = currentConfig.VIEWBOX_WIDTH / 2;
    const centerY = currentConfig.VIEWBOX_HEIGHT / 2;
    const coreIslandRadius = currentConfig.HEX_HEIGHT * 2.1; // Uses HEX_HEIGHT from currentConfig

    // const sea = document.createElementNS(SVG_NS, "rect");
    // setAttributes(sea, { x: 0, y: 0, width: currentConfig.VIEWBOX_WIDTH, height: currentConfig.VIEWBOX_HEIGHT, fill: "#4682B4" });
    // svgBoardEl.appendChild(sea);

    const islandLayers = [
        {
            name: 'sand',
            avgRadius: coreIslandRadius * 1.2,
            fill: '#F0E68C',
            irregularity: 0.05,
            numPoints: 40,
        },
        {
            name: 'rocky',
            avgRadius: coreIslandRadius * 1.15,
            fill: '#A9A9A9',
            irregularity: 0.03,
            numPoints: 80,
        },
        {
            name: 'green',
            avgRadius: coreIslandRadius * 1.1,
            fill: '#556B2F',
            irregularity: 0.04,
            numPoints: 40,
        },
    ];
    islandLayers.forEach((layer) => {
        const polygon = document.createElementNS(SVG_NS, 'polygon');
        const pointsStr = CatanLogic.createIrregularPolygon(
            centerX,
            centerY,
            layer.avgRadius,
            layer.numPoints,
            layer.irregularity
        );
        CatanUI.setAttributes(polygon, {
            points: pointsStr,
            fill: layer.fill,
            id: `background-${layer.name}`,
        });
        svgBoardEl.appendChild(polygon);
    });
};

/**
 * Renders the Catan board tiles.
 * @memberof CatanUI
 * @function renderBoard
 * @param {SVGElement} svgBoardEl - The main SVG board element.
 * @param {Object} currentConfig - The runtime config object.
 * @param {Array<Object>} shuffledTiles - Array of shuffled tile objects.
 * @returns {Array<Object>} Array of hexagon data objects.
 */
CatanUI.renderBoard = function renderBoard(
    svgBoardEl,
    currentConfig,
    shuffledTiles
) {
    console.log('renderBoard() called with', shuffledTiles.length, 'tiles.');
    while (svgBoardEl.lastChild && svgBoardEl.lastChild.tagName !== 'defs') {
        svgBoardEl.removeChild(svgBoardEl.lastChild);
    }
    CatanUI.renderIslandBackground(svgBoardEl, currentConfig);
    CatanUI.defineHexagonClipPath(svgBoardEl, currentConfig);

    const hexagonsData = [];
    const tileNativePositions = currentConfig.axialCoordinates.map((coord) =>
        CatanLogic.axialToPixel(coord.q, coord.r, currentConfig.HEX_SIZE)
    );

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    tileNativePositions.forEach((pos) => {
        minX = Math.min(minX, pos.x - currentConfig.HEX_WIDTH / 2);
        maxX = Math.max(maxX, pos.x + currentConfig.HEX_WIDTH / 2);
        minY = Math.min(minY, pos.y - currentConfig.HEX_HEIGHT / 2);
        maxY = Math.max(maxY, pos.y + currentConfig.HEX_HEIGHT / 2);
    });
    const boardNativeWidth = maxX - minX;
    const boardNativeHeight = maxY - minY;
    const centeringOffsetX =
        (currentConfig.VIEWBOX_WIDTH - boardNativeWidth) / 2 - minX;
    const centeringOffsetY =
        (currentConfig.VIEWBOX_HEIGHT - boardNativeHeight) / 2 - minY;

    let numberTokenIndex = 0;

    shuffledTiles.forEach((tile, index) => {
        const axialCoord = currentConfig.axialCoordinates[index];
        const nativePos = tileNativePositions[index];
        const svgCenterX = nativePos.x + centeringOffsetX;
        const svgCenterY = nativePos.y + centeringOffsetY;

        const group = document.createElementNS(SVG_NS, 'g');
        CatanUI.setAttributes(group, {
            transform: `translate(${svgCenterX.toFixed(3)}, ${svgCenterY.toFixed(3)})`,
            class: 'hexagon-tile-group',
        });

        const visualRadius =
            currentConfig.HEX_SIZE - currentConfig.HEX_VISUAL_OFFSET;
        const hexagonPolygon = document.createElementNS(SVG_NS, 'polygon');
        const polygonPoints = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 180) * (60 * i - 30);
            polygonPoints.push(
                `${(visualRadius * Math.cos(angle)).toFixed(3)},${(visualRadius * Math.sin(angle)).toFixed(3)}`
            );
        }
        CatanUI.setAttributes(hexagonPolygon, {
            points: polygonPoints.join(' '),
            class: 'svg-hexagon-polygon',
            fill: tile.color || '#ddc',
        });
        group.appendChild(hexagonPolygon);

        const image = document.createElementNS(SVG_NS, 'image');
        const imageDisplayWidth = Math.sqrt(3) * visualRadius;
        const imageDisplayHeight = 2 * visualRadius;
        CatanUI.setAttributes(image, {
            x: (-imageDisplayWidth / 2).toFixed(3),
            y: (-imageDisplayHeight / 2).toFixed(3),
            width: imageDisplayWidth.toFixed(3),
            height: imageDisplayHeight.toFixed(3),
            href: currentConfig.imagesPath + tile.image,
            'clip-path': 'url(#hexagon-clip)',
            preserveAspectRatio: 'xMidYMid slice',
        });
        image.onerror = function onerror() {
            console.warn(
                `Image not found: ${this.href.baseVal}. Using fallback color for ${tile.name}.`
            );
            this.setAttribute('display', 'none');
        };
        group.appendChild(image);

        if (tile.name !== currentConfig.tileTypes.DESERT.name) {
            if (numberTokenIndex < currentConfig.numberTokenSequence.length) {
                const numberValue =
                    currentConfig.numberTokenSequence[numberTokenIndex];
                const tokenGroup = document.createElementNS(SVG_NS, 'g');
                CatanUI.setAttributes(tokenGroup, {
                    class: 'number-token-group',
                });
                const tokenRadius = currentConfig.HEX_SIZE * 0.35;
                const tokenCircle = document.createElementNS(SVG_NS, 'circle');
                CatanUI.setAttributes(tokenCircle, {
                    cx: 0,
                    cy: 0,
                    r: tokenRadius,
                    class: 'number-token-circle',
                });
                tokenGroup.appendChild(tokenCircle);
                const tokenText = document.createElementNS(SVG_NS, 'text');
                const textClass =
                    numberValue === 6 || numberValue === 8
                        ? 'number-token-text-red'
                        : 'number-token-text';
                const fontSize = tokenRadius;
                CatanUI.setAttributes(tokenText, {
                    x: 0,
                    y: 0,
                    class: `number-token-text ${textClass}`,
                    'font-size': `${fontSize.toFixed(1)}`,
                    'dominant-baseline': 'middle',
                    'text-anchor': 'middle',
                });
                tokenText.textContent = numberValue.toString();
                tokenGroup.appendChild(tokenText);
                group.appendChild(tokenGroup);
                numberTokenIndex++;
            }
        }
        svgBoardEl.appendChild(group);
        hexagonsData.push({
            tile,
            axial: axialCoord,
            pixelCenter: { x: svgCenterX, y: svgCenterY },
            element: group,
        });
    });
    return hexagonsData;
};

/**
 * Creates interactive SVG elements (points and lines).
 * @param {SVGElement} svgBoardEl - The main SVG board element.
 * @param {Object} currentConfig - The runtime config object.
 * @param {Array<Object>} hexagonsData - Data from renderBoard.
 */
CatanUI.createInteractiveElements = function createInteractiveElements(
    svgBoardEl,
    currentConfig,
    hexagonsData
) {
    console.log(
        'createInteractiveElements() called with',
        hexagonsData.length,
        'hexagon data entries.'
    );
    const uniqueVertices = new Map();
    const uniqueEdges = new Map();

    hexagonsData.forEach((hexData) => {
        const vertices = CatanLogic.getHexagonVerticesSVG(
            hexData.pixelCenter,
            currentConfig.HEX_SIZE
        );
        vertices.forEach((vertex, i) => {
            const vertexKey = `${vertex.x},${vertex.y}`;
            if (!uniqueVertices.has(vertexKey)) {
                uniqueVertices.set(vertexKey, vertex);
            }
            const nextVertex = vertices[(i + 1) % 6];
            const nextVertexKey = `${nextVertex.x},${nextVertex.y}`;
            const edgeKey = [vertexKey, nextVertexKey].sort().join(';');
            if (!uniqueEdges.has(edgeKey)) {
                uniqueEdges.set(edgeKey, { v1: vertex, v2: nextVertex });
            }
        });
    });

    uniqueEdges.forEach((edge) => {
        const lineEl = document.createElementNS(SVG_NS, 'line');
        CatanUI.setAttributes(lineEl, {
            x1: edge.v1.x,
            y1: edge.v1.y,
            x2: edge.v2.x,
            y2: edge.v2.y,
            class: 'svg-interactive-line',
            'stroke-width': currentConfig.LINE_THICKNESS,
        });
        lineEl.addEventListener('click', () =>
            console.log('Clicked SVG line between:', edge.v1, 'and', edge.v2)
        );
        svgBoardEl.appendChild(lineEl);
    });

    uniqueVertices.forEach((vertex) => {
        const circleEl = document.createElementNS(SVG_NS, 'circle');
        CatanUI.setAttributes(circleEl, {
            cx: vertex.x,
            cy: vertex.y,
            r: currentConfig.POINT_RADIUS,
            class: 'svg-interactive-point',
        });
        circleEl.addEventListener('click', () => {
                console.log('Clicked SVG point at:', vertex)

                if (gameState.gamePhase.startsWith('SetupPlacement1'))


            }
            
        );
        svgBoardEl.appendChild(circleEl);
    });
};

export default CatanUI;
