var title = (function() {
	// Environmental variables
	var backContext;
	var img;
	var env;
	var mouseX, mouseY;

	// Button status
	var gameStart;
	var moreInfo;

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
		gameStart = 0;
		moreInfo = 0;
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
		if(x >= 0 && x < 200 && y > 470 && y < 600) {
			gameStart = 1;
		} else {
			gameStart = 0;
		}
		
		// Check if mouse on the "more info" button
		if(x >= 200 && x < 400 && y > 470 && y < 600) {
			moreInfo = 1;
		} else {
			moreInfo = 0;
		}
	}

	function eventMouseClick(e) {
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
		if(gameStart == 0) {
			backContext.drawImage(img.buttons, 0, 390, 200, 130, 0, 470, 200, 130);
		} else {
			backContext.drawImage(img.buttons, 200, 390, 200, 130, 0, 470, 200, 130);
		}
		if(moreInfo == 0) {
			backContext.drawImage(img.buttons, 0, 260, 200, 130, 200, 470, 200, 130);
		} else {
			backContext.drawImage(img.buttons, 200, 260, 200, 130, 200, 470, 200, 130);
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

		eventMouseMove : eventMouseMove
	};
})();
