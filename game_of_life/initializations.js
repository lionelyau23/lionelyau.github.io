function startGame() {
  start = true;
  document.querySelector(".game-status").innerText = "Playing";
  frameRate(fr);
}

function endGame() {
  start = false;
  document.querySelector(".game-status").innerText = "Stopped";
  frameRate(IDLE_FR);
}

// game state controls
document.querySelector("#start-game").addEventListener("click", () => {
  startGame();
});

document.querySelector("#end-game").addEventListener("click", () => {
  endGame();
});

document.querySelector("#next-frame").addEventListener("click", () => {
  if (start) {
    return;
  }
  generate();
  drawBoard();
});

document.querySelector("#reset-game").addEventListener("click", () => {
  endGame();
  init();
});

document.querySelector("#randomize-game").addEventListener("click", () => {
  endGame();
  randomInit();
});

// rule string display
const ruleStringDisplay = document.querySelector('#ruleString-display')

function createRuleString(births=birthRule, survives=surviveRule) {
  return`B${birthRule.join('')}/S${surviveRule.join('')}`
}
ruleStringDisplay.innerText = createRuleString()

// birth buttons addEventListener
const birthRuleSelectors = document.querySelectorAll(".birth-selector");
const birthRuleDisplayValue = document.querySelector(".loneliness-value");

// birthRuleDisplayValue.innerText = birthRule.join(', ')

// initialize the birth buttons to show the preset birth rule
birthRule.forEach(b => {
  birthRuleSelectors.forEach(button => {
    if (parseInt(button.value) === b) {
      button.classList.toggle('active')
    }
  })
})

birthRuleSelectors.forEach(b => b.addEventListener("click", ({ target }) => {
  const active = target.classList.toggle('active')
  const value = parseInt(target.value)

  if (active) {
    birthRule = birthRule.concat(value).sort((a,b) => a - b)
  } else {
    birthRule = birthRule.filter(i => i != value)
  }
  // birthRuleDisplayValue.innerText = birthRule.join(', ')
  ruleStringDisplay.innerText = createRuleString()
}));

// survive buttons addEventListener
const surviveRuleSelectors = document.querySelectorAll(".survive-selector");
const surviveRuleDisplayValue = document.querySelector(".overpopulation-value");

// surviveRuleDisplayValue.innerText = surviveRule.join(', ')

// initialize the survive buttons to show the preset survive rule
surviveRule.forEach(b => {
  surviveRuleSelectors.forEach(button => {
    if (parseInt(button.value) === b) {
      button.classList.toggle('active')
    }
  })
})

surviveRuleSelectors.forEach(b => b.addEventListener("click", ({ target }) => {
  const active = target.classList.toggle('active')
  const value = parseInt(target.value)

  if (active) {
    surviveRule = surviveRule.concat(value).sort((a,b) => a - b)
  } else {
    surviveRule = surviveRule.filter(i => i != value)
  }
  // surviveRuleDisplayValue.innerText = surviveRule.join(', ')
  ruleStringDisplay.innerText = createRuleString()
}));

// framerate slider addEventListener
const framerateSlider = document.querySelector(".framerate-slider");
const framerateDisplayValue = document.querySelector(".framerate");

framerateSlider.value = fr;
framerateDisplayValue.innerText = fr;

framerateSlider.addEventListener("input", ({ target: { value } }) => {
  fr = parseInt(value);
  framerateDisplayValue.innerText = fr;
  if (start) {
    frameRate(fr);
  }
});

// colorPicker addEventListener
const colorPicker = document.querySelector(".color-picker");
const colorDisplayValue = document.querySelector('.color-value');

colorPicker.value = boxColor;
colorDisplayValue.innerText = boxColor

colorPicker.addEventListener("input", ({ target: { value } }) => {
  boxColor = value;
  colorDisplayValue.innerText = boxColor
});

// organism selector
function setOrganismPreviewImg() {
  organismPreviewImageDiv.replaceChildren();
  const newImage = document.createElement("img");
  newImage.src = imgBase[organism];
  organismPreviewImageDiv.appendChild(newImage);
}

const organismSelector = document.querySelector('select[name="organism"]');
organismSelector.value = organism;

const organismPreviewImageDiv = document.querySelector(
  ".preview-image-container"
);

setOrganismPreviewImg();

organismSelector.addEventListener("input", ({ target: { value } }) => {
  organism = value;
  setOrganismPreviewImg();
});

// statistics
const totalPopulationDisplay = document.querySelector('#total-population')
const totalColorsDisplay = document.querySelector('#total-colors')
const totalStableDisplay = document.querySelector('#total-stable')
const colorsDisplayContainer = document.querySelector('#colors-stat-display')
