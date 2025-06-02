import R from "./ramda.js";
document.addEventListener('DOMContentLoaded', () => {
    if (typeof R === 'undefined') {
        console.error('Ramda library (R) not found. Ensure "./js/ramda.min.js" is correctly loaded in index.html.');
        alert('Error: Ramda library (R) not found. Check console.');
        return;
    }
    console.log("Ramda (R) object is available:", R);

    const SVG_NS = 'http://www.w3.org/2000/svg';

    const config = {
        HEX_SIZE: 45, // True radius for layout and interactive points/edges (SVG units)
        HEX_VISUAL_OFFSET: 2, // Shrinks visual hex from its true edge to create gaps (SVG units)
        get HEX_WIDTH() { return Math.sqrt(3) * this.HEX_SIZE; }, // True width (flat to flat edge because width is root 3/2 of the radius)
        get HEX_HEIGHT() { return 2 * this.HEX_SIZE; }, // True height (point to point)
        /* Creating a direct js reference to the SVG board from the html*/
        svgBoardElement: document.getElementById('catan-board-svg'),
        imagesPath: './assets/',

        /*  Defining the types of tile that there are going to be, creating alt text incase*/
        tileTypes: {
            DESERT: { name: 'Desert', image: 'desert.png', count: 1, color: '#ebd8a2' },
            GRAIN:  { name: 'Grain',  image: 'grain.png',  count: 4, color: '#f0e085' },
            LUMBER: { name: 'Lumber', image: 'lumber.png', count: 4, color: '#5a823b' },
            WOOL:   { name: 'Wool',   image: 'wool.png',   count: 4, color: '#a2d161' },
            ORE:    { name: 'Ore',    image: 'ore.png',    count: 3, color: '#9ca0a8' },
            BRICK:  { name: 'Brick',  image: 'brick.png',  count: 3, color: '#b86a3d' },
        },

        /*  Defining the location of the 19 tiles on the hex grid, each object represents position using axial (hexagonal) tiles */
        axialCoordinates: [
            {q:0,r:-2}, {q:1,r:-2}, {q:2,r:-2},
            {q:-1,r:-1},{q:0,r:-1}, {q:1,r:-1}, {q:2,r:-1},
            {q:-2,r:0}, {q:-1,r:0}, {q:0,r:0}, {q:1,r:0}, {q:2,r:0},
            {q:-2,r:1}, {q:-1,r:1}, {q:0,r:1}, {q:1,r:1},
            {q:-2,r:2}, {q:-1,r:2}, {q:0,r:2}
        ],
        POINT_RADIUS: 8, // SVG units for interactive circle radius
        LINE_THICKNESS: 5, // SVG units for interactive line stroke-width

        /* might be worth making this pull the value from the html file*/
        VIEWBOX_WIDTH: 500,
        VIEWBOX_HEIGHT: 500
    };
    /* Checking if the SVG has been loaded */
    console.log("SVG Board Element reference:", config.svgBoardElement);
    if (!config.svgBoardElement) {
        console.error("CRITICAL: Could not find SVG element with ID 'catan-board-svg'!");
        alert("CRITICAL: Could not find SVG element. Board cannot be drawn.");
        return;
    }

    /**
     * Utility function to set multiple attributes on an SVG or HTML element.
     * This function iterates through an object of attribute key-value pairs and applies them
     * to the provided DOM element.
     *
     * @param {Element} el - The DOM element (HTML or SVG) on which to set attributes.
     * @param {Object.<string, (string|number|boolean)>} attrs - An object where keys are attribute names
     * (e.g., 'class', 'stroke-width', 'cx') and values are the attribute values.
     * @returns {void} This function does not return a value; it modifies the element directly.
     */

    function setAttributes(el, attrs) {
        for (let key in attrs) {
            el.setAttribute(key, attrs[key]);
        }
    }

    /**
     * Creates and defines a reusable SVG <clipPath> element with a hexagonal shape.
     * This clip path is stored in the SVG's <defs> section and can be referenced by its ID ('hexagon-clip')
     * to clip other SVG elements (like images) into a hexagonal form. It ensures the clip path
     * is defined only once. The size of the hexagonal clip is based on the `visualRadius`,
     * derived from `config.HEX_SIZE` and `config.HEX_VISUAL_OFFSET`, to create spacing between tiles.
     *
     * This function relies on `config.svgBoardElement`, `config.HEX_SIZE`,
     * and `config.HEX_VISUAL_OFFSET` from the global scope.
     * @returns {void} This function does not return a value; it modifies the SVG DOM.
     */
    
    function defineHexagonClipPath() {
        console.log("defineHexagonClipPath() called.");
        let defs = config.svgBoardElement.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS(SVG_NS, 'defs');
            config.svgBoardElement.appendChild(defs);
        }
        
        let clipPath = defs.querySelector('#hexagon-clip');
        if (clipPath) {
            console.log("ClipPath #hexagon-clip already exists.");
            return; 
        }

        clipPath = document.createElementNS(SVG_NS, 'clipPath');
        clipPath.id = 'hexagon-clip';

        const clipPolygon = document.createElementNS(SVG_NS, 'polygon');
        const points = [];
        const visualRadius = config.HEX_SIZE - config.HEX_VISUAL_OFFSET;
        
        for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 180 * (60 * i - 30); // Pointy-top hex
            points.push(
                `${(visualRadius * Math.cos(angle)).toFixed(3)},${(visualRadius * Math.sin(angle)).toFixed(3)}`
            );
        }
        setAttributes(clipPolygon, { points: points.join(' ') });
        console.log("ClipPolygon points for #hexagon-clip:", points.join(' '));
        
        clipPath.appendChild(clipPolygon);
        defs.appendChild(clipPath);
    }

    /**/
    function axialToPixel(q, r) {
        const x = config.HEX_SIZE * (Math.sqrt(3) * q + Math.sqrt(3)/2 * r);
        const y = config.HEX_SIZE * (3/2 * r);
        return { x, y };
    }

    /**/
    function renderBoard(shuffledTiles) {
        console.log("renderBoard() called with", shuffledTiles.length, "tiles.");
        // Clear existing board elements except for <defs>
        while (config.svgBoardElement.lastChild && config.svgBoardElement.lastChild.tagName !== 'defs') {
            config.svgBoardElement.removeChild(config.svgBoardElement.lastChild);
        }
        defineHexagonClipPath(); // Ensure clip path is defined

        const hexagonsData = [];
        const tileNativePositions = config.axialCoordinates.map(coord => axialToPixel(coord.q, coord.r));

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        tileNativePositions.forEach(pos => {
            minX = Math.min(minX, pos.x - config.HEX_WIDTH / 2);
            maxX = Math.max(maxX, pos.x + config.HEX_WIDTH / 2);
            minY = Math.min(minY, pos.y - config.HEX_HEIGHT / 2);
            maxY = Math.max(maxY, pos.y + config.HEX_HEIGHT / 2);
        });
        const boardNativeWidth = maxX - minX;
        const boardNativeHeight = maxY - minY;

        const centeringOffsetX = (config.VIEWBOX_WIDTH - boardNativeWidth) / 2 - minX;
        const centeringOffsetY = (config.VIEWBOX_HEIGHT - boardNativeHeight) / 2 - minY;

        shuffledTiles.forEach((tile, index) => {
            const axialCoord = config.axialCoordinates[index];
            const nativePos = tileNativePositions[index];

            const svgCenterX = nativePos.x + centeringOffsetX;
            const svgCenterY = nativePos.y + centeringOffsetY;

            const group = document.createElementNS(SVG_NS, 'g');
            setAttributes(group, {
                transform: `translate(${svgCenterX.toFixed(3)}, ${svgCenterY.toFixed(3)})`,
                class: 'hexagon-tile-group' // Added class for potential group hover effects
            });
            // console.log(`Creating group for ${tile.name} at SVG coords: x=${svgCenterX.toFixed(3)}, y=${svgCenterY.toFixed(3)}`);

            const visualRadius = config.HEX_SIZE - config.HEX_VISUAL_OFFSET;
            const hexagonPolygon = document.createElementNS(SVG_NS, 'polygon');
            const polygonPoints = [];
            for (let i = 0; i < 6; i++) {
                const angle = Math.PI / 180 * (60 * i - 30);
                polygonPoints.push(
                    `${(visualRadius * Math.cos(angle)).toFixed(3)},${(visualRadius * Math.sin(angle)).toFixed(3)}`
                );
            }
            setAttributes(hexagonPolygon, {
                points: polygonPoints.join(' '),
                class: 'svg-hexagon-polygon',
                fill: tile.color || '#ddc'
            });
            group.appendChild(hexagonPolygon);

            const image = document.createElementNS(SVG_NS, 'image');
            setAttributes(image, {
                x: -config.HEX_SIZE, // Image is larger than visual hex, centered
                y: -config.HEX_SIZE,
                width: config.HEX_SIZE * 2,
                height: config.HEX_SIZE * 2,
                href: config.imagesPath + tile.image,
                'clip-path': 'url(#hexagon-clip)'
            });
            image.onerror = function() {
                console.warn(`Image not found: ${this.href.baseVal}. Using fallback color for ${tile.name}.`);
                this.setAttribute('display', 'none');
            };
            group.appendChild(image);
            
            config.svgBoardElement.appendChild(group);
            hexagonsData.push({
                tile,
                axial: axialCoord,
                pixelCenter: { x: svgCenterX, y: svgCenterY },
                element: group
            });
        });
        return hexagonsData;
    }
    
    /**/
    function getHexagonVerticesSVG(svgCenterPos) {
        // Calculates vertices based on the TRUE HEX_SIZE for accurate interactive points
        const vertices = [];
        for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 180 * (60 * i - 30);
            const x = svgCenterPos.x + config.HEX_SIZE * Math.cos(angle);
            const y = svgCenterPos.y + config.HEX_SIZE * Math.sin(angle);
            vertices.push({ x: parseFloat(x.toFixed(3)), y: parseFloat(y.toFixed(3)) });
        }
        return vertices;
    }

    /**/
    function createInteractiveElements(hexagonsData) {
        console.log("createInteractiveElements() called with", hexagonsData.length, "hexagon data entries.");
        const uniqueVertices = new Map();
        const uniqueEdges = new Map();

        hexagonsData.forEach(hexData => {
            const vertices = getHexagonVerticesSVG(hexData.pixelCenter);
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

        // Render Edges (Road spots) FIRST - so they are underneath points
        console.log(`Rendering ${uniqueEdges.size} unique edges.`);
        uniqueEdges.forEach(edge => {
            const lineEl = document.createElementNS(SVG_NS, 'line');
            setAttributes(lineEl, {
                x1: edge.v1.x,
                y1: edge.v1.y,
                x2: edge.v2.x,
                y2: edge.v2.y,
                class: 'svg-interactive-line',
                'stroke-width': config.LINE_THICKNESS
            });
            lineEl.addEventListener('click', () => console.log('Clicked SVG line between:', edge.v1, 'and', edge.v2));
            config.svgBoardElement.appendChild(lineEl);
        });

        // Render Vertices (Settlement spots) LAST - so they are on top
        console.log(`Rendering ${uniqueVertices.size} unique vertices.`);
        uniqueVertices.forEach(vertex => {
            const circleEl = document.createElementNS(SVG_NS, 'circle');
            setAttributes(circleEl, {
                cx: vertex.x,
                cy: vertex.y,
                r: config.POINT_RADIUS,
                class: 'svg-interactive-point'
            });
            circleEl.addEventListener('click', () => console.log('Clicked SVG point at:', vertex));
            config.svgBoardElement.appendChild(circleEl);
        });
    }

    /**/
    function generateTiles() {
        let tiles = [];
        for (const typeKey in config.tileTypes) {
            const type = config.tileTypes[typeKey];
            for (let i = 0; i < type.count; i++) {
                tiles.push({ ...type });
            }
        }
        return tiles;
    }

    /**/
    function shuffleTiles(tiles) {
        return R.sortBy(() => Math.random(), tiles);
    }

    /**/
    function initGame() {
        console.log("initGame() called.");
        const allTiles = generateTiles();
        if (allTiles.length !== config.axialCoordinates.length) {
            console.error("Tile count/coordinate mismatch.");
            alert('Error: Tile configuration mismatch. Check console.');
            return;
        }
        const shuffledTiles = shuffleTiles(allTiles);
        const hexagonsData = renderBoard(shuffledTiles);
        if (hexagonsData && hexagonsData.length > 0) {
            createInteractiveElements(hexagonsData);
        } else {
            console.error("Board rendering failed or produced no data, skipping interactive elements.");
        }
    }
    console.log("main.js loaded and DOMContentLoaded. Initializing Catan board script...");
    initGame();
});