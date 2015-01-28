var START_BTN = $("#start_btn");
var RESTART_BTN = $("#restart_btn");
var GAME_OVER_IMG = $(".you_lose");
var INCREASED_SPEED = $(".increased_speed");

/** 
 * Restart button listener and visual effect.
 */
RESTART_BTN.button();
RESTART_BTN.click(function () {
  RESTART_BTN.hide("bounce", 1000);
  GAME_OVER_IMG.hide("bounce", 1000);
  beginGame(true);
});


/** 
 * Start button listener and visual effect.
 */
START_BTN.button();
START_BTN.click(function () {
  START_BTN.hide("bounce", 1000);
  beginGame(false);
});


/** 
 * Creates multiple letters and places the on the game screen.
 */
var createManyLetters = function() {
  /** 
   * Helper function which prevents letters
   * from appearing on screen in one straigh vertical line.
   * @param {Integer} tnum Tunnel number on which to display character
   */
  function randomizeDisplay(tNum) {
      setTimeout(function () {
        createLetter(tNum);
      }, Math.floor(Math.random() * 500))
  }
  clearInterval(START_CREATION);
  if (!GAME_OVER) {
    for(var i = 0; i < NUM_TUNNELS; i++) { 
      randomizeDisplay(i);
    }
    START_CREATION = setInterval(createManyLetters, CREATION_INTERVAL);
  }
};

/** 
 * Keeps count of correct letter hits.
 */
var NUM_HITS;

/** 
 * Time interval (in miliseconds) at which new letters 
 * are spawned. This decreases as more letters are hit.
 */
var CREATION_INTERVAL;

/** 
 * JQuery reference to score display div.
 */
var SCORE_DISPLAY;

/** 
 * Stores current game score.
 */
var CURRENT_SCORE;

/** 
 * Indicates whether a game has terminated.
 */
var GAME_OVER;

/**
 * Maps a character to all its jquery instances currently on display
 * ordered by most recent occurance is last.
 *
 * Example: 'a' --> [JQ_instance1, JQ_instance2, JQ_instance3,...]
 */
var LETTER_DICT;

/** 
 * Number of letter tunnels. Needs to match
 * the number of corresponding divs in the html.
 */
var NUM_TUNNELS;

/** 
 * Array of next available letter id number per tunnel.
 */
var LNUMS;

/** 
 * Time interval object for letter animation.
 */
var START_ANIMATION;

/** 
 * Time interval object for letter creation.
 */
var START_CREATION;


/** 
 * Starts timers and resets the initial settings in
 * order to begin a new game.
 * @param {Boolean} restart Indicates whether a game is being restarted
 *                          which is needed to determine whether to bind listeners.
 */
function beginGame(restart) {
  initializeSettings();
  START_ANIMATION = setInterval(animateLetters, 100);
  START_CREATION = setInterval(createManyLetters, CREATION_INTERVAL);
  if(!restart) {
    setupListener();
  }
}


/** 
 * Ends game by turning off timers and displayes game over screen.
 */
function endGame() {
  GAME_OVER_IMG.show("bounce", 1000, function () {
   GAME_OVER_IMG.animate({bottom: '30'}, 100);
   RESTART_BTN.show("bounce", 1000);
  });
  clearInterval(START_ANIMATION);
  clearInterval(START_CREATION);
  GAME_OVER = true;
}


/** 
 * Initializes state and variables.
 */
function initializeSettings() {
  $(".letter").remove();
  INCREASED_SPEED.hide();
  NUM_HITS = 0;
  CREATION_INTERVAL = 1000;
  SCORE_DISPLAY = $("#score");
  SCORE_DISPLAY.css("color", "black");
  CURRENT_SCORE = 0;
  GAME_OVER = false;
  NUM_TUNNELS = 4;
  LETTER_DICT = null;
  LETTER_DICT = {}
  //initialize letter dictionary
  for(var i = 0; i < 26; i++) {
    LETTER_DICT[String.fromCharCode(97 + i)]=null;
    LETTER_DICT[String.fromCharCode(97 + i)]=[];
  }
  LNUMS = [];
  for(var i = 0; i < NUM_TUNNELS; i++) {
    LNUMS.push(0);
  }
  updateScore();
}


/** 
 * Sets up keyboard listener.
 */
function setupListener() {
  $(document).ready(function(){
    $(document).bind("keyup", function(e){
      if(!GAME_OVER) {
        var code = e.keyCode;
        var curLet = String.fromCharCode(code).toLowerCase();
        
        if(code >= 65 && code <= 90 && LETTER_DICT[curLet].length > 0){
          NUM_HITS += 1;

          //decrease creation interval
          if (NUM_HITS % 20 == 0 && CREATION_INTERVAL > 100) {
            CREATION_INTERVAL -= 100;
            showIncreaseMessage();
          }

          //remove instance from dictionary
          removeLetter(curLet);

          SCORE_DISPLAY.css("color", "black");
          CURRENT_SCORE += 1;
        } else if (code == 27){
          endGame();
        } else {
          SCORE_DISPLAY.css("color", "red");
          CURRENT_SCORE -= 1;
        }
        updateScore();
      }
    });
  });
}


/** 
 * Displays message when letter creation speed increases.
 */
function showIncreaseMessage() {
  INCREASED_SPEED.toggle("blind");
  INCREASED_SPEED.effect("shake");
  setTimeout(function () {
    INCREASED_SPEED.toggle("blind");
  }, 3000);
}


/** 
 * Updates score board.
 */
function updateScore() {
  SCORE_DISPLAY.html("SCORE: "+CURRENT_SCORE);
}


/** 
 * Removes letter from dictionary and animates the removal.
 * @param {String} let Letter which olest occurance is to be removed
 */
function removeLetter(let) {
  // remove letter from the dictionary
  var done = LETTER_DICT[let].splice(0,1);
  var letter = done[0];

  //imitate little explosion using a gif
  letter.html("");
  letter.attr("class", "letter_gone");
  setTimeout(function () {
    letter.remove();
  }, 300);
}


/** 
 * Animates movement of letters on screen.
 */
function animateLetters() {
  var animationRate = 0;
  var lets = $(".letter");

  // animate by 10 pixels
  lets.animate({left: '+=10'}, animationRate);
  lets.css({
    left: function(index,value) {
      value = parseInt(value);
      if(value >= 990) {
        GAME_OVER = true;
        endGame();
        clearInterval(START_ANIMATION);
      }
    }
  });
}


/** 
 * Creates a letter div and places it in the corresponding tunnel.
 * @param {Integer} tunnelNum Number of tunnel on which to create a new letter
 */
function createLetter(tunnelNum) {
  var tun = $("#tunnel"+tunnelNum);
  var letterLabel = "t"+tunnelNum+"_l"+LNUMS[tunnelNum];

  //increase next available letter id
  LNUMS[tunnelNum] += 1;

  var newLetter = getRandomLetter();
  var divContent= "<div id=\""+letterLabel+"\" class=\"letter\"> "+newLetter+" </div>";
  tun.append(divContent);
  //push jquery access to letter dictionary
  var letterAccess = $("#"+letterLabel);
  LETTER_DICT[newLetter].push(letterAccess);

}


/** 
 * Generates a random letter.
 */
function getRandomLetter() {
  return String.fromCharCode(97 + Math.floor(Math.random() * 26));
}