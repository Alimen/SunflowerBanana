var title = (function() {
	// Environmental variables
	var backContext;
	var img;
	var env;
	var mouseX, mouseY;

	// Button status
	var gameStartMouse, moreInfoMouse;
	var gameStartKey, moreInfoKey;

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
		gameStartMouse = 0;
		moreInfoMouse = 0;
		gameStartKey = 0;
		moreInfoKey = 0;
	}

///////////////////////////////////////////////////////////////////////////////
//
// Event handler
//
///////////////////////////////////////////////////////////////////////////////

	function eventMouseMove(x, y) {
		mouseX = x;
		mouseY = y;
		
		// Check if mouse on the "start" button
		if(x >= 10 && x < 200 && y > 470 && y < 590) {
			moreInfoMouse = 1;
		} else {
			moreInfoMouse = 0;
		}
		
		// Check if mouse on the "more info" button
		if(x >= 200 && x < 390 && y > 470 && y < 590) {
			gameStartMouse = 1;
		} else {
			gameStartMouse = 0;
		}
	}

	function eventMouseClick(e) {
		if(moreInfoMouse == 1) {
			var info = window.open();
			info.location = "MoreInfo.html";
		}
	}

	function eventKeyUp(e) {
		if(e.keyCode == 37) {
			moreInfoKey = 0;
		}
		if(e.keyCode == 39) {
			gameStartKey = 0;
		}
	}

	function eventKeyDown(e) {
		if(e.keyCode == 37) {
			moreInfoKey = 1;
		}
		if(e.keyCode == 39) {
			gameStartKey = 1;
		}
	}

///////////////////////////////////////////////////////////////////////////////
//
// Draw title
//
///////////////////////////////////////////////////////////////////////////////

	function draw() {
		// Clear background
		backContext.fillStyle = "#cedfe7";
		backContext.fillRect(0, 0, env.screenWidth, env.screenHeight);

		// Draw title
		backContext.drawImage(img.title, 0, 40);

		// Draw Buttons
		if(gameStartMouse == 0 && gameStartKey == 0) {
			backContext.drawImage(img.buttons, 0, 260, 200, 130, 200, 470, 200, 130);
		} else {
			backContext.drawImage(img.buttons, 200, 260, 200, 130, 200, 470, 200, 130);
		}
		if(moreInfoMouse == 0 && moreInfoKey == 0) {
			backContext.drawImage(img.buttons, 0, 390, 200, 130, 0, 470, 200, 130);
		} else {
			backContext.drawImage(img.buttons, 200, 390, 200, 130, 0, 470, 200, 130);
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
