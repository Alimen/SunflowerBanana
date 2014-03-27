var loader = (function() {
	// Environmental variables
	var backContext;
	var img;
	var env;

///////////////////////////////////////////////////////////////////////////////
//
// Public functions
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
// Setup public access
//
///////////////////////////////////////////////////////////////////////////////

	return {
		init : init,
		draw : draw
	};
})();

