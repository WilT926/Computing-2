// File: web-app/modules/catanconfig.js

export const configBase = {
    HEX_SIZE: 35,
    HEX_VISUAL_OFFSET: 2,
    get HEX_WIDTH() { return Math.sqrt(3) * this.HEX_SIZE; },
    get HEX_HEIGHT() { return 2 * this.HEX_SIZE; },
    imagesPath: './assets/', // Relative to index.html for the browser app
    tileTypes: {
        DESERT: { name: 'Desert', image: 'desert.png', count: 1, color: '#ebd8a2' },
        GRAIN:  { name: 'Grain',  image: 'grain.png',  count: 4, color: '#f0e085' },
        LUMBER: { name: 'Lumber', image: 'lumber.png', count: 4, color: '#5a823b' },
        WOOL:   { name: 'Wool',   image: 'wool.png',   count: 4, color: '#a2d161' },
        ORE:    { name: 'Ore',    image: 'ore.png',    count: 3, color: '#9ca0a8' },
        BRICK:  { name: 'Brick',  image: 'brick.png',  count: 3, color: '#b86a3d' },
    },
    numberTokenSequence: [5, 2, 6, 3, 8, 10, 9, 12, 11, 4, 8, 10, 9, 4, 5, 6, 3, 11],
    axialCoordinates: [ // Count    er-clockwise spiral
        {q:0,r:-2}, {q:-1,r:-1}, {q:-2,r:0}, {q:-2,r:1}, {q:-2,r:2}, {q:-1,r:2}, {q:0,r:2},
        {q:1,r:1}, {q:2,r:0}, {q:2,r:-1}, {q:2,r:-2}, {q:1,r:-2}, {q:0,r:-1}, {q:-1,r:0},
        {q:-1,r:1}, {q:0,r:1}, {q:1,r:0}, {q:1,r:-1}, {q:0,r:0}
    ],
    POINT_RADIUS: 8,
    LINE_THICKNESS: 5,
    VIEWBOX_WIDTH: 500, // Default, can be overridden by dynamic reading
    VIEWBOX_HEIGHT: 500 // Default
};

export const SVG_NS = 'http://www.w3.org/2000/svg';