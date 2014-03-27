var gameLogic = (function() {
	// Environmental variables
	var backContext;
	var img;
	var env;

	// Button status
	var bananaMouse, flowerMouse;
	var bananaKey, flowerKey;

	// Game variables
	var countdown;
	var score;
	var answere;  // flower == 0, banana == 1
	var imgId;

	// Game states
	const gameStates = {
		unknown		: -1,
		slideIn		: 0,
		gameplay	: 1,
		slideOut	: 2,
		result		: 3
	}
	var state;

///////////////////////////////////////////////////////////////////////////////
//
// Initialization
//
///////////////////////////////////////////////////////////////////////////////

	function init(_env, _img, _backContext) {
		env = _env;
		img = _img;
		backContext = _backContext;
	}

	function reset() {
		bananaMouse = 0;
		flowerMouse = 0;
		bananaKey = 0;
		flowerKey = 0;

		countdown = 30.0;
		score = 0;
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
	}

	function eventKeyUp(e) {
		if(e.keyCode == 37) {
			checkAnswere(1);
			bananaKey = 0;
		}
		if(e.keyCode == 39) {
			checkAnswere(0);
			flowerKey = 0;
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
		if(input == answere) {
			score += Math.floor(countdown)*10;
			countdown += 0.3;
			if(countdown > 30.0) {
				countdown = 30.0;
			}
		} else {
			countdown -= 0.1;
		}
		nextImg();
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
	
	function push() {
		switch(state) {
		case gameStates.slideIn:
			pushSlide();
			break;
		case gameStates.gameplay:
			countdown -= (1/30);
			if(countdown < 0) {
				resetSlide(-1);
				state = gameStates.slideOut;
			}
			break;
		case gameStates.slideOut:
			pushSlide();
			break;
		}
	}

	function draw() {
		push();

		// Clear background
		backContext.fillStyle = "#cedfe7";
		backContext.fillRect(0, 0, env.screenWidth, env.screenHeight);

		// Draw title
		backContext.drawImage(img.title, 0, 40);

		// Draw image
		if(answere == 0) {
			backContext.drawImage(img.flowers[imgId], 5, slideY+5);
		} else {
			backContext.drawImage(img.bananas[imgId], 5, slideY+5);
		}

		// Draw frame
		backContext.drawImage(img.frame, 0, slideY);

		// Draw Buttons
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

		// Draw timer & score
		backContext.textBaseline = "bottom";	
		backContext.fillStyle = "#000000";
		backContext.font = "bold 24px Arial";
		backContext.textAlign = "right";
		backContext.fillText(padLeft(score, 6), 380, 28+slideY);
		if(countdown < 5) {
			backContext.fillStyle = "#ff0000";
		}
		backContext.font = "bold 62px Arial";
		backContext.textAlign = "left";
		backContext.fillText(countdown.toFixed(1), 20, 65+slideY);
	}

	function padLeft(str, len) {
		if(str.length >= len) {
			return str;
		} else {
			return padLeft("0"+str, len);
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
