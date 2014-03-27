var loader = (function() {
	// Environmental variables
	var backContext;
	var img;
	var env;

///////////////////////////////////////////////////////////////////////////////
//
// Initialization & draw loading screen
//
///////////////////////////////////////////////////////////////////////////////

	function init(_env, _img, _backContext) {
		env = _env;
		img = _img;
		backContext = _backContext;
	}

	function draw(percentage) {
		// Clear background
		backContext.fillStyle = "#cedfe7";
		backContext.fillRect(0, 0, env.screenWidth, env.screenHeight);
		
		// Print percentage
		backContext.textBaseline = "bottom";	
		backContext.fillStyle = "#000000";
		backContext.font = "14px monospace";
		backContext.textAlign = "center";
		backContext.fillText(percentage + "%", env.screenWidth/2, 355);

		// Draw progress bar
		for(var i = 0; i < 5; i++) {
			if(percentage >= (i+1)*20) {
				backContext.drawImage(img.bar, 0, 0, 64, 64, 40+i*64, 268, 64, 64);
			} else {
				backContext.drawImage(img.bar, 64, 0, 64, 64, 40+i*64, 268, 64, 64);
			}
		}
	}

///////////////////////////////////////////////////////////////////////////////
//
// Draw intro animation
//
///////////////////////////////////////////////////////////////////////////////

	// Animation variables
	var introState;
	var introT;

	function resetIntro(_img) {
		img = _img;
		introState = 0;
		introT = 0;
	}

	function drawIntro() {
		// Clear background
		backContext.fillStyle = "#cedfe7";
		backContext.fillRect(0, 0, env.screenWidth, env.screenHeight);

		var i;
		switch(introState) {
		case 0:
			// Fade-out bananas
			backContext.globalAlpha = 1 - introT/40;
			for(i = 0; i < 5; i++) {
				backContext.drawImage(img.bar, 0, 0, 64, 64, 40+i*64, 268, 64, 64);
			}
			backContext.globalAlpha = 1;
			if(introT == 40) {
				introState = 1;
				introT = 0;
			}
			break;

		case 1:
			// Fade-in intro text
			if(introT <= 40) {
				backContext.globalAlpha = introT/40;
			} else if(introT <= 80) {
				backContext.globalAlpha = 1;
			} else {
				backContext.globalAlpha = 1 - (introT-80)/40;
			}
			backContext.textBaseline = "bottom";	
			backContext.fillStyle = "#000000";
			backContext.font = "18px 微軟正黑體";
			backContext.textAlign = "center";
			backContext.fillText("謹獻給", env.screenWidth/2, env.screenHeight/2-20);
			backContext.fillText("為民主挺身而出的勇士們", env.screenWidth/2, env.screenHeight/2+20);
			backContext.globalAlpha = 1;
			if(introT == 120) {
				introState = 2;
				introT = 0;
			}
			break;

		case 2:
			// Fade-in game interface
			backContext.globalAlpha = introT/40;
			backContext.drawImage(img.title, 0, 0);
			backContext.drawImage(img.buttons, 0, 390, 200, 130, 0, 470, 200, 130);
			backContext.drawImage(img.buttons, 0, 260, 200, 130, 200, 470, 200, 130);
			backContext.globalAlpha = 1;
			if(introT == 40) {
				introState = 3;
				introT = 0;
			}
			break;
		}
		introT++;

		if(introState == 3) {
			return env.mainStates.resetTitile;
		} else {
			return env.mainStates.unknown;
		}
	}

///////////////////////////////////////////////////////////////////////////////
//
// Setup public access
//
///////////////////////////////////////////////////////////////////////////////

	return {
		init : init,
		draw : draw,
		resetIntro : resetIntro,
		drawIntro : drawIntro
	};
})();


