`use strict`;

class Stage {

  constructor(row, col, levelTotal) {
    this.row = row;
    this.col = col;
    this.levelTotal = levelTotal || 5;
    this.liElements = [];
    this.score = new Score();
    this.level = 1;
    this.MESSAGE = `CONGRATULATIONS`;
    this.TOTAL = 100*this.levelTotal;

    const slider = document.querySelector(`#level`);
    slider.max = this.levelTotal;
    slider.addEventListener(`change`, ()=> {
      this.level = slider.valueAsNumber;
      document.querySelector(`#range-value`).textContent = slider.value;
      this.render();
    });
  }

  // DOM
  prepstage() {
    this.ground = document.querySelector(`#game`);
    this.pause = document.querySelector(`#pause`);
    this.play = document.querySelector(`#play`);
    var span = document.createElement(`span`);
    var li = document.createElement(`li`);

    // create the grid
    for (var i = 0; i < (this.row * this.col); i++) {
      var cloneLi = li.cloneNode(false),
          cloneSpan = span.cloneNode(false);

      cloneLi.appendChild(cloneSpan);
      this.ground.appendChild(cloneLi);
      this.liElements.push(cloneLi);
    }
  }

  start() {

    this.prepstage();

    // set Interval in creating moles
    this.render();

    // bind interface events
    this.addEvents();
  }

  render() {
    //make sure timer is cleared whenever this function is called
    this.timer && this.timer.clear();

    this.timer = new Timer(this.level);

    const mole = new Mole(this.level);

    // caching the list elements for each level
    let prevMole = {};
    // caching
    this.timer.setTimer(() => {

      const moles = mole.create(this.row*this.col);

      // reset the state of moles we missed
      for(var prop in prevMole) {
        if(prevMole[prop] !== undefined) {
          prevMole[prop].querySelector('span').classList.remove(mole.className);
          prevMole[prop].querySelector('span').classList.remove('backdown');
        }
      }
      // populate new moles in DOM
      for(const el in moles) {
        prevMole[el] = this.liElements[el];
        prevMole[el].querySelector('span').classList.add(mole.className);
      }
    });
  }

  addEvents() {
    const scoreDOM = document.querySelector(`#score`);
    const sliderDOM = document.querySelector(`#level`);
    const rangeDOM = document.querySelector(`#range-value`);

    this.pause.addEventListener(`click`, (e) => {
      this.timer.clear();
    });

    this.play.addEventListener(`click`, (e) => {
      this.render();
    });

    this.ground.addEventListener(`click`, (e) => {
      if (
        !e.target
        || e.target.nodeName.toLowerCase() !== `span`
        || !e.target.classList.contains('popup')
      ) {
        return;
      }
      // when clicked on a mole, increase score, update score in DOM, update mole class to play the down animation
      this.score.add();
      scoreDOM.innerHTML = this.score.total;
      e.target.classList.remove(`popup`);
      e.target.classList.add(`backdown`);

      // stop running the logic below when score is not enough to level up
      if (this.score.total % 100 !== 0) {
        return;
      }
      // it's time to level up or game over
      // reset the timer
      this.timer.clear();

      // Game over
      if (this.score.total === this.TOTAL) {
          scoreDOM.parentNode.innerHTML = this.MESSAGE;
          // game over reset all the moles
          this.liElements.forEach( (el) =>{
            el.childNodes[0].classList.remove(`popup`);
          })
         return;
      }

      // max level is set in the slider input
      if(this.level < this.levelTotal) {
        this.level++;
      }

      // populate the moles
      this.render();
      sliderDOM.value = this.level;
      rangeDOM.textContent = this.level;
    }, false);
  }
};

// Game design:
// speed increase by 100ms when level up
class Timer {
  constructor(level) {
    this.level = level || 1;
    this.timer = (this.level < 4) ? (3000 - 100*this.level) : (3000 - 200*this.level);
  }

  setTimer(func) {
    // use recursive setTimeout instead of setInterval to make sure func() always runs in syncronous
    const intervalFunc = ()=> {
      func();

      this.interval = setTimeout(intervalFunc, this.timer);
    };
    this.interval = setTimeout(intervalFunc, this.timer);

  }

  clear() {
    clearTimeout(this.interval);
  }
};

class Score {
  constructor() {
    this.score = 0
  }

  add() {
    this.score += 10;
  }

  get total() {
    return this.score;
  }

};

// Game design:
// when level up, increase instances of Mole
// when level is greater than 3, only increase speed of mole disappearing
class Mole {
  constructor(level) {
    this.level = (level < 4) ? level : 3;
    this.className = `popup`;
  }

  // use hash map to store the mole active state
  // {index: speed}
  // Math.floor((Math.random() * grid): range of number is 1 - (grid-1)
  create (grid) {
    var obj = {};
    for(var i=0; i < this.level; i ++) {
      const index = Math.floor((Math.random() * grid)+1) - 1;
      obj[index] = true;
    }
    return obj;
  }
};

// put together
const app = function() {

  function initialize () {
    var stage1 = new Stage(2, 3, 10);
    stage1.start();
  }

  return {
    init: initialize
  }
}();

app.init();
