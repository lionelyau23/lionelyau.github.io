const singleCell = `*`;

const glider = `
...*
.*.*
..**
`;

const lightweightSpaceship = `
..****
.*...*
.....*
.*..*.
`

const gosperGliderGun = `
..........................*..........
.......................****....*.....
..............*.......****.....*.....
.............*.*......*..*.........**
............*...**....****.........**
.**.........*...**.....****..........
.**.........*...**........*..........
.............*.*.....................
..............*......................
`

// a dictionary to lookup the corresponding bitmap array
const organismBase = {
  "single-cell": singleCell,
  glider: glider,
  "lightweight-spaceship": lightweightSpaceship,
  "gosper-glider-gun": gosperGliderGun,
};

// a dictionary to lookup the image links
const imgBase = {
  "single-cell": "./public/single-cell.png",
  "glider": "./public/Glider.gif",
  "lightweight-spaceship": "./public/Lwss.gif",
  "gosper-glider-gun": "./public/Gosperglidergun.gif",
};

// return the complementary RGB value of the input
function complementaryRGB(rgbValue) {
  let r = Math.floor(255 - parseInt(rgbValue.slice(1, 3), 16))
    .toString(16)
    .padStart(2, "0");
  let g = Math.floor(255 - parseInt(rgbValue.slice(3, 5), 16))
    .toString(16)
    .padStart(2, "0");
  let b = Math.floor(255 - parseInt(rgbValue.slice(5), 16))
    .toString(16)
    .padStart(2, "0");
  return `#${r}${g}${b}`;
}

function highlightRGB(rgbValue) {
  const HIGHLIGHT_FACTOR = 1.3
  return changeBrightnessRGB(complementaryRGB(rgbValue), HIGHLIGHT_FACTOR)
}

function changeBrightnessRGB(rgbValue, factor) {
  let r = Math.floor(Math.min(parseInt(rgbValue.slice(1, 3), 16) * factor, 255))
    .toString(16)
    .padStart(2, "0");
  let g = Math.floor(Math.min(parseInt(rgbValue.slice(3, 5), 16) * factor, 255))
    .toString(16)
    .padStart(2, "0");
  let b = Math.floor(Math.min(parseInt(rgbValue.slice(5), 16) * factor, 255))
    .toString(16)
    .padStart(2, "0");
  
  return `#${r}${g}${b}`;
}

// return the darkened RGB value by the preset factor
function darkenRGB(rgbValue) {
  const DARKEN_FACTOR = 0.7;
  return changeBrightnessRGB(rgbValue, DARKEN_FACTOR);
}

// store the movement functions for each key press
const moveCursorFunctions = {
  w: () => {
    cursorY = cursorY <= 0 ? 0 : cursorY - 1;
  },
  a: () => {
    cursorX = cursorX <= 0 ? 0 : cursorX - 1;
  },
  s: () => {
    cursorY = cursorY >= rows - 1 ? rows - 1 : cursorY + 1;
  },
  d: () => {
    cursorX = cursorX >= columns - 1 ? columns - 1 : cursorX + 1;
  },
}

// store the opposite key for each key press
const oppositeKey = {
  w: 's',
  a: 'd',
  s: 'w',
  d: 'a'
}