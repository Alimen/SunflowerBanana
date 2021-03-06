var gameLogic = (function() {
	// Environmental variables
	var backContext;
	var snd;
	var img;
	var env;

	// Button status
	var bananaMouse, flowerMouse;
	var bananaKey, flowerKey;

	// Game variables
	var mode;  // normal == 0, Chiu Yi == 1
	var countdown;
	var score;
	var answere;  // flower == 0, banana == 1
	var imgId;
	var markerT;

	// Result text handles
	var results = new Array(3);
	var gameResult;

	// Game states
	const gameStates = {
		unknown		: -1,
		slideIn		: 0,
		gameplay	: 1,
		slideOut	: 2,
		result		: 3,
		backToTitle	: 4
	}
	var state;

///////////////////////////////////////////////////////////////////////////////
//
// Initialization
//
///////////////////////////////////////////////////////////////////////////////

	function init(_env, _img, _snd, _backContext) {
		env = _env;
		img = _img;
		snd = _snd;
		backContext = _backContext;

		results[0] = document.getElementById("result0");
		results[1] = document.getElementById("result1");
		results[2] = document.getElementById("result2");
	}

	function reset(_mode) {
		bananaMouse = 0;
		flowerMouse = 0;
		bananaKey = 0;
		flowerKey = 0;

		mode = _mode;
		countdown = 30.0;
		score = 0;
		markerT = 0;
		gameResult = 0;
		nextImg();

		resetSlide(1);
		state = gameStates.slideIn;
	}

///////////////////////////////////////////////////////////////////////////////
//
// Event handler
//
///////////////////////////////////////////////////////////////////////////////

	function eventMouseMove(x, y) {
		// Check if mouse on the "start" button
		if(x >= 10 && x < 200 && y > 470 && y < 590) {
			bananaMouse = 1;
		} else {
			bananaMouse = 0;
		}
		
		// Check if mouse on the "more info" button
		if(x >= 200 && x < 390 && y > 470 && y < 590) {
			flowerMouse = 1;
		} else {
			flowerMouse = 0;
		}
	}

	function eventMouseClick(e) {
		if(state == gameStates.result) {
			if(flowerMouse == 1) {
				gameResult = 2;
				hideResult();
			} else if(bananaMouse == 1) {
				gameResult = 1;
				hideResult();
			}
		} else {
			if(flowerMouse == 1) {
				checkAnswere(0);
			} else if(bananaMouse == 1) {
				checkAnswere(1);
			}
		}
	}

	function eventKeyUp(e) {
		if(state == gameStates.result) {
			if(e.keyCode == 37) {
				gameResult = 1;
				bananaKey = 0;
				hideResult();
			}
			if(e.keyCode == 39) {
				gameResult = 2;
				flowerKey = 0;
				hideResult();
			}
		} else {
			if(e.keyCode == 37) {
				checkAnswere(1);
				bananaKey = 0;
			}
			if(e.keyCode == 39) {
				checkAnswere(0);
				flowerKey = 0;
			}
		}
	}

	function eventKeyDown(e) {
		if(e.keyCode == 37) {
			bananaKey = 1;
		}
		if(e.keyCode == 39) {
			flowerKey = 1;
		}
	}

///////////////////////////////////////////////////////////////////////////////
//
// Slide-in / slide-out animations
//
///////////////////////////////////////////////////////////////////////////////

	// Variables
	var slideY;
	var slideDirection;

	function resetSlide(dir) {
		slideDirection = dir;
		if(dir < 0) {
			slideY = 0;
		} else {
			slideY = -470;
		}
	}

	function pushSlide() {
		const speed = 25;
		slideY += speed * slideDirection;

		if(slideDirection < 0 && slideY < -470) {
			slideY = -470;
			showResult();
			state = gameStates.result;
		} else if(slideDirection > 0 && slideY > 0) {
			slideY = 0;
			state = gameStates.gameplay;
		}
	}

///////////////////////////////////////////////////////////////////////////////
//
// Game
//
///////////////////////////////////////////////////////////////////////////////

	function checkAnswere(input) {
		if(state != gameStates.gameplay || markerT != 0) {
			return;
		}

		if(mode == 1) {
			if(input == 0) {
				input = 1;
			} else {
				input = 0;
			}
		}

		if(input == answere) {
			score += Math.floor(countdown)*10;
			countdown += 0.3;
			if(countdown > 30.0) {
				countdown = 30.0;
			}
			snd.correct.currentTime = 0;
			snd.correct.play();
			markerT = 8;
		} else {
			countdown -= 1.0;
			snd.wrong.currentTime = 0;
			snd.wrong.play();
			markerT = -8;
		}
	}

	function nextImg() {
		if(Math.random() < 0.5) {
			answere = 0;
		} else {
			answere = 1;
		}
		imgId = Math.floor(Math.random()*15);
	}

///////////////////////////////////////////////////////////////////////////////
//
// Draw
//
///////////////////////////////////////////////////////////////////////////////
	
	// Timer
	var backT;

	function push() {
		switch(state) {
		case gameStates.slideIn:
			pushSlide();
			break;
		case gameStates.gameplay:
			countdown -= (1/30);
			if(countdown < 0) {
				countdown = 0;
				resetSlide(-1);
				state = gameStates.slideOut;
			}
			break;
		case gameStates.slideOut:
			pushSlide();
			break;
		case gameStates.backToTitle:
			backT++;
			break;
		}
	}

	function draw() {
		push();

		// Clear background
		backContext.fillStyle = "#cedfe7";
		backContext.fillRect(0, 0, env.screenWidth, env.screenHeight);

		// Fade-out to title
		if(state == gameStates.backToTitle) {
			var res = drawTitle();
			return res;
		}

		// Draw title
		if(state == gameStates.slideIn) {
			backContext.drawImage(img.title, 0, 40);
		}

		// Draw final score
		backContext.textBaseline = "bottom";	
		backContext.fillStyle = "#000000";
		backContext.font = "bold 64px Arial";
		if(state == gameStates.result) {
			backContext.textAlign = "center";
			backContext.fillText(score, 200, 180);
		}

		// Draw image
		if(answere == 0) {
			backContext.drawImage(img.flowers[imgId], 5, slideY+5);
		} else {
			backContext.drawImage(img.bananas[imgId], 5, slideY+5);
		}

		// Draw frame
		backContext.drawImage(img.frame, 0, slideY);

		// Draw marker
		if(markerT > 0) {
			backContext.drawImage(img.answere, 0, 0, 350, 350, 25, 70, 350, 350);
			markerT--;
			if(markerT == 0) {
				nextImg();
			}
		}
		if(markerT < 0) {
			backContext.drawImage(img.answere, 350, 0, 350, 350, 25, 70, 350, 350);
			markerT++;
			if(markerT == 0) {
				nextImg();
			}
		}

		// Draw buttons
		if(state == gameStates.result) {
			drawResultButtons();
		} else {
			drawButtons();
		}

		// Draw mode
		if(mode == 1) {
			backContext.drawImage(img.mode, 0, 0, 80, 80, 235, slideY, 60, 60);
		}

		// Draw timer & score
		backContext.font = "bold 24px Arial";
		backContext.textAlign = "right";
		backContext.fillText(padLeft(score, 6), 380, 28+slideY);
		if(countdown < 5) {
			backContext.fillStyle = "#ff0000";
		}
		backContext.font = "bold 62px Arial";
		backContext.textAlign = "left";
		backContext.fillText(countdown.toFixed(1), 20, 65+slideY);

		return 0;
	}

	function drawButtons() {
		if(bananaMouse == 0 && bananaKey == 0) {
			backContext.drawImage(img.buttons, 0, 0, 200, 130, 0, 470, 200, 130);
		} else {
			backContext.drawImage(img.buttons, 200, 0, 200, 130, 0, 470, 200, 130);
		}
		if(flowerMouse == 0 && flowerKey == 0) {
			backContext.drawImage(img.buttons, 0, 130, 200, 130, 200, 470, 200, 130);
		} else {
			backContext.drawImage(img.buttons, 200, 130, 200, 130, 200, 470, 200, 130);
		}
	}

	function drawResultButtons() {
		if(bananaMouse == 0 && bananaKey == 0) {
			backContext.drawImage(img.buttons, 0, 520, 200, 130, 0, 470, 200, 130);
		} else {
			backContext.drawImage(img.buttons, 200, 520, 200, 130, 0, 470, 200, 130);
		}
		if(flowerMouse == 0 && flowerKey == 0) {
			backContext.drawImage(img.buttons, 0, 650, 200, 130, 200, 470, 200, 130);
		} else {
			backContext.drawImage(img.buttons, 200, 650, 200, 130, 200, 470, 200, 130);
		}
	}

	function padLeft(str, len) {
		if(str.length >= len) {
			return str;
		} else {
			return padLeft("0"+str, len);
		}
	}

	function showResult() {
		if(score <= 2000) {
			results[0].style.visibility="";
		} else if(score <= 4000) {
			results[1].style.visibility="";
		} else {
			results[2].style.visibility="";
		}
	}

	function hideResult() {
		results[0].style.visibility="hidden";
		results[1].style.visibility="hidden";
		results[2].style.visibility="hidden";
		backT = 0;
		state = gameStates.backToTitle;
	}

	function drawTitle() {
		backContext.globalAlpha = backT/40;
		backContext.drawImage(img.title, 0, 40);
		backContext.drawImage(img.buttons, 0, 390, 200, 130, 0, 470, 200, 130);
		backContext.drawImage(img.buttons, 0, 260, 200, 130, 200, 470, 200, 130);
		backContext.globalAlpha = 1;

		if(backT == 40) {
			return gameResult;
		} else {
			return 0;
		}
	}

///////////////////////////////////////////////////////////////////////////////
//
// Setup public access
//
///////////////////////////////////////////////////////////////////////////////

	return {
		init : init,
		reset : reset,
		draw : draw,

		eventMouseMove : eventMouseMove,
		eventMouseClick : eventMouseClick,
		eventKeyUp : eventKeyUp,
		eventKeyDown : eventKeyDown
	};
})();
