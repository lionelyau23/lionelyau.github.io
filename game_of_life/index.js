const unitLength = 30;
let boxColor = "#0000ff";
const strokeColor = "grey";
let fr = 24;
const IDLE_FR = 24;
let start = false;

let columns; /* To be determined by window width */
let rows; /* To be determined by window height */
let currentBoard;
let nextBoard;

let birthRule = [3];
let surviveRule = [2,3];

const STABILITY = 3;
const TOTAL_RANDOM_COLORS = 5;

let organism = "single-cell";
let highlightColor = null

let mouseControl = false
let cursorX = 0
let cursorY = 0

const keyTimeoutEventIDs = {
  w: null,
  a: null,
  s: null,
  d: null
};

const keyIntervalEventIDs = {
  w: null,
  a: null,
  s: null,
  d: null
};

const stat = {
  // total: 0,
  // totalColors: 0,
  colors: {}
}

class Cell {
  constructor(life = 0, color = null, stable = 0) {
    this.life = life;
    this.color = color;
    this.stable = stable;
  }
}

function setup() {
  const canvas = createCanvas(windowWidth - 50, windowHeight - 100);
  canvas.parent(document.querySelector("#canvas"));
  canvas.mouseMoved(mouseMovedOnCanvas)

  /* Calculate the number of columns and rows */
  columns = floor(width / unitLength);
  rows = floor(height / unitLength);

  /* Making both currentBoard and nextBoard 2-dimensional matrix that has (columns * rows) boxes. */
  currentBoard = [];
  nextBoard = [];
  for (let i = 0; i < columns; i++) {
    currentBoard[i] = [];
    nextBoard[i] = [];
  }

  // Now both currentBoard and nextBoard are array of array of undefined values.
  init(); // Set the initial values of the currentBoard and nextBoard
  frameRate(IDLE_FR);
}

function init() {
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      currentBoard[i][j] = new Cell();
      nextBoard[i][j] = new Cell();
    }
  }
}

function randomInit() {
  // create the needed randomized colors depending on TOTAL_RANDOM_COLORS
  const colors = [];
  for (let i = 0; i < TOTAL_RANDOM_COLORS; i++) {
    let color = "#";
    color = color.concat(
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, "0")
    );
    color = color.concat(
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, "0")
    );
    color = color.concat(
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, "0")
    );

    colors.push(color);
  }

  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      const newLife = Math.random() > 0.8 ? 1 : 0;
      const newColor =
        newLife == 1
          ? colors[Math.floor(Math.random() * TOTAL_RANDOM_COLORS)]
          : null;

      currentBoard[i][j] = new Cell(newLife, newColor)
      nextBoard[i][j] = new Cell()
    }
  }
}

function drawBoard() {
  background(255);
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      const { life, color, stable } = currentBoard[i][j];

      // if there is life, fill with cell color
      if (life == 1) {
        // if the cell is stable, darken the cell color
        if (stable > STABILITY) {
          fill(darkenRGB(color));
        } else {
          fill(color);
        }
      } else {
        fill(255);
      }

      // draw the cell
      stroke(strokeColor);
      rect(i * unitLength, j * unitLength, unitLength, unitLength);

      // highlight the cell if needed
      if (highlightColor != null) {
        if (color === highlightColor) {
          fill(highlightRGB(color))
          circle((i + 0.5) * unitLength, (j + 0.5) * unitLength, unitLength / 2);  
        }
      }
    }
  }
}

function generateOrganism(locX, locY) {
  const picture = organismBase[organism].trim().split('\n');
  // console.log(picture)

  // wrap locX, locY never let the picture goes over the border
  locX = locX + picture[0].length > columns 
    ? columns - picture[0].length 
    : locX;

  locY = locY + picture.length > rows 
    ? rows - picture.length 
    : locY;

  for (let i = 0; i < picture.length; i++) {
    for (let j = 0; j < picture[i].length; j++) {
      if (picture[i][j] == '*') {
        // console.log(locX + i, locY + j)
        currentBoard[locX + j][locY + i].life = 1;
        currentBoard[locX + j][locY + i].color = boxColor;
        currentBoard[locX + j][locY + i].stable = 0;

      }
    }
  }
}

function drawOrganism(drawLocX, drawLocY) {
  stroke(strokeColor);
  fill(boxColor);

  const picture = organismBase[organism].trim().split('\n');

  drawLocX =
    drawLocX + picture[0].length > columns
      ? columns - picture[0].length
      : drawLocX;

  drawLocY =
    drawLocY + picture.length > rows 
      ? rows - picture.length 
      : drawLocY;

  for (let i = 0; i < picture.length; i++) {
    for (let j = 0; j < picture[i].length; j++) {
      if (picture[i][j] == '*') {
        // console.log(drawLocX + i, drawLocY + j)
        rect(
          (drawLocX + j) * unitLength,
          (drawLocY + i) * unitLength,
          unitLength,
          unitLength
        );
      }
    }
  }
}

function cancelCursorEvent(direction) {
  if (keyTimeoutEventIDs[direction] != null) {
    clearTimeout(keyTimeoutEventIDs[direction])
    keyTimeoutEventIDs[direction] = null
  }

  if (keyIntervalEventIDs[direction] != null) {
    clearTimeout(keyIntervalEventIDs[direction])
    keyIntervalEventIDs[direction] = null
  } 
}

function keyReleased() {
  const controlKeys = new Set(['w', 'a', 's','d'])

  if (!(controlKeys.has(key))) {
    return
  }

  cancelCursorEvent(key)
}

function moveCursorByKey(direction) {
  // if the cursor is moving already, do nothing
  if (keyTimeoutEventIDs[direction] != null) {
    return
  }

  if (keyTimeoutEventIDs[oppositeKey[key]] != null) {
    cancelCursorEvent(oppositeKey[key])
  }

  moveCursorFunctions[direction]()

  const cursorTimeoutEvent = setTimeout(() => {
    const cursorIntervalEvent = setInterval(() => {
      moveCursorFunctions[direction]()
    }, 30)
    keyIntervalEventIDs[direction] = cursorIntervalEvent
  }, 250)

  keyTimeoutEventIDs[direction] = cursorTimeoutEvent
}

function keyTyped() {
  const controlKeys = new Set(['w', 'a', 's','d', ' '])

  if (!(controlKeys.has(key))) {
    return
  }

  // if any control keys are pressed, use key to control cursor
  mouseControl = false

  // press spacebar to generate organism at the cursor location
  if (key === ' ') {
    generateOrganism(cursorX, cursorY)
    return
  }
  
  moveCursorByKey(key)
}

function mouseMovedOnCanvas() {
  // every time mouse moves on the canvas, use mouse to control cursor
  mouseControl = true
  cursorX = Math.floor(mouseX / unitLength);
  cursorY = Math.floor(mouseY / unitLength);
}

function drawCursorLoc() {
  // if using mouse as control and mouse is out of bound, dont show cursor
  if (
    mouseControl && 
    (mouseX > unitLength * columns ||
    mouseY > unitLength * rows ||
    mouseX < 0 ||
    mouseY < 0)
  ) {
    return;
  }

  // paint the selected organism at the cursor location to preview placement location
  drawOrganism(cursorX, cursorY)

  // paint the cursor location as a circle with complementary RGB value
  stroke(strokeColor)
  fill(highlightRGB(boxColor))
  circle((cursorX + 0.5) * unitLength, (cursorY + 0.5) * unitLength, unitLength / 2);
}

function draw() {
  if (start) {
    generate();
  }
  drawBoard();
  drawCursorLoc();
  updateStat()
}

function updateUIStats(totalLife, totalStable, colors) {
  // update html DOM to reflect the changes
  totalPopulationDisplay.innerText = totalLife
  totalColorsDisplay.innerText = Object.keys(colors).length
  totalStableDisplay.innerText = totalStable

  for (const c in colors) {
    const colorCode = `color-${c.toString().slice(1)}`

    // if the color is shown already, modify existing value
    if (c in stat.colors) {
      const colorStable = document.querySelector(`#${colorCode}-stables`)
      colorStable.innerText = colors[c].stables

      const colorTotal = document.querySelector(`#${colorCode}-total`)
      colorTotal.innerText = colors[c].total

    } else {
      /**
       * example:
       * <tr id="color-d4f544"> // newRow
       *  <td>D4F544</td> // colorValue
       *  <td style="background-color: rgb(212, 245, 68); width: 100%; height: 1rem;"></td> // coloredBlock
       *  <td id="color-d4f544-stables">0</td> // colorStable
       *  <td id="color-d4f544-total">78</td> // colorTotal
       * </tr>
       */

      // if a new color is added, add them to the dom
      const newRow = document.createElement('tr')
      newRow.id = colorCode

      const colorValue = document.createElement('td')
      colorValue.innerText = c.toString().slice(1).toLocaleUpperCase()
      newRow.appendChild(colorValue)

      const coloredBlock = document.createElement('td')
      coloredBlock.style.backgroundColor = c
      coloredBlock.style.width = '100%'
      coloredBlock.style.height = '1rem'
      newRow.appendChild(coloredBlock)

      const colorStable = document.createElement('td')
      colorStable.id = `${colorCode}-stables`
      colorStable.innerText = colors[c].stables
      newRow.appendChild(colorStable)

      const colorTotal = document.createElement('td')
      colorTotal.id = `${colorCode}-total`
      colorTotal.innerText = colors[c].total
      newRow.appendChild(colorTotal)

      newRow.addEventListener('mouseenter', ({target}) => {
        highlightColor = `#${target.id.slice(6)}`
      })

      newRow.addEventListener('mouseleave', ({target}) => {
        highlightColor = null
      })

      colorsDisplayContainer.appendChild(newRow)
    }
  }

  // find and delete dead color population in DOM
  for (const c in stat.colors) {
    if (!(c in colors)) {
      const deadColor = document.querySelector(`#color-${c.toString().slice(1)}`)
      colorsDisplayContainer.removeChild(deadColor)
    }
  }
}

function updateStat() {
  let totalLife = 0
  let totalStable = 0
  const colors = {}

  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      const { life, color, stable } = currentBoard[i][j];
      if (life == 1) {
        totalLife++

        if (!(color in colors)) {
          colors[color] = {
            total: 0,
            stables: 0
          }
        }
        colors[color].total++

        if (stable > STABILITY) {
          totalStable++
          colors[color].stables++
        }
      }
    }
  }

  updateUIStats(totalLife, totalStable, colors)
  stat.colors = colors
}

// update the board array
function generate() {
  //Loop over every single box on the board
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      // Count all living members in the Moore neighborhood(8 boxes surrounding)
      let neighbors = 0;

      // initialize a color object to store all colors of neighbors
      let colors = {};
      colors[null] = 1;

      for (let i of [-1, 0, 1]) {
        for (let j of [-1, 0, 1]) {
          if (i == 0 && j == 0) {
            // the cell itself is not its own neighbor
            continue;
          }
          // The modulo operator is crucial for wrapping on the edge
          const box =
            currentBoard[(x + i + columns) % columns][(y + j + rows) % rows];
          neighbors += box.life;

          if (box.life == 1) {
            if (!(box.color in colors)) {
              colors[box.color] = 0;
            }
            colors[box.color]++;
          }
        }
      }

      const { life, color, stable } = currentBoard[x][y];

      // find the color with highest frequency as the new color
      const newColor = Object.keys(colors).reduce((acc, cur) =>
        colors[acc] > colors[cur] ? acc : cur
      );

      // assume the new board is always unstable
      // nextBoard[x][y].stable = 0;

      // Rules of Life
      if (life == 0 && birthRule.includes(neighbors)) {
        // birth new life if no. of neighbors is in birthRule
        nextBoard[x][y].life = 1;
        nextBoard[x][y].color = newColor;
        nextBoard[x][y].stable = 0;
      } else if (life == 1 && surviveRule.includes(neighbors)) {
        // survives if no. of neighbors is in surviveRule
        nextBoard[x][y].life = 1;
        nextBoard[x][y].color = newColor;
        nextBoard[x][y].stable = stable + 1
      } else {
        // dies if no rules apply
        // console.log('dies') 
        nextBoard[x][y].life = 0;
        nextBoard[x][y].color = null;
        nextBoard[x][y].stable = 0;
      }

      /**
       * Traditional Rules and if clauses
       */
      // if (life == 1 && neighbors < birthRule) {
      //   // Die of Loneliness
      //   nextBoard[x][y].life = 0;
      //   nextBoard[x][y].color = null;
      // } else if (life == 1 && neighbors > surviveRule) {
      //   // Die of Overpopulation
      //   nextBoard[x][y].life = 0;
      //   nextBoard[x][y].color = null;
      // } else if (life == 0 && neighbors == surviveRule && surviveRule != 0) {
      //   // New life due to Reproduction
      //   nextBoard[x][y].life = 1;
      //   nextBoard[x][y].color = newColor;
      // } else {
      //   // Stasis
      //   nextBoard[x][y] = {
      //     life, color, stable: stable + 1
      //   }
      // }
    }
  }

  // Swap the nextBoard to be the current Board
  [currentBoard, nextBoard] = [nextBoard, currentBoard];
}

function mouseDragged() {
  /**
   * If the mouse coordinate is outside the board
   */
  if (
    mouseX > unitLength * columns ||
    mouseY > unitLength * rows ||
    mouseX < 0 ||
    mouseY < 0
  ) {
    return;
  }
  const x = Math.floor(mouseX / unitLength);
  const y = Math.floor(mouseY / unitLength);

  generateOrganism(x, y);
  drawBoard();
}

/**
 * When mouse is pressed
 */
function mousePressed() {
  noLoop();
  mouseDragged();
}

/**
 * When mouse is released
 */
function mouseReleased() {
  loop();
}

function windowResized() {
  resizeCanvas(windowWidth - 50, windowHeight - 100);

  newColumns = floor(width / unitLength);
  newRows = floor(height / unitLength);

  const newCurrentBoard = [];
  const newNextBoard = [];

  for (let i = 0; i < newColumns; i++) {
    newCurrentBoard[i] = [];
    newNextBoard[i] = [];
    for (let j = 0; j < newRows; j++) {
      if (i >= columns || j >= rows) {
        newCurrentBoard[i][j] = new Cell();
        newNextBoard[i][j] = new Cell();
      } else {
        newCurrentBoard[i][j] = currentBoard[i][j];
        newNextBoard[i][j] = nextBoard[i][j];
      }
    }
  }

  [columns, rows] = [newColumns, newRows];
  [currentBoard, nextBoard] = [newCurrentBoard, newNextBoard];
}