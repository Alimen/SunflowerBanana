var resume = (function() {
	if(!canvasSupport) {
		return;
	}
	
///////////////////////////////////////////////////////////////////////////////
//
// Variable declearations
//
///////////////////////////////////////////////////////////////////////////////

	// Canvas
	var theCanvas;
	var context;
	var backCanvas;
	var backContext;

	// Environmental variables
	const screenWidth = 400;
	const screenHeight = 600;

	// Image resources
	var imgBananas = new Array(15);
	var imgFlowers = new Array(15);
	var imgTitle = new Image();
	var imgButtons = new Image();
	var imgFrame = new Image();
	var imgLoadingBar = new Image();

///////////////////////////////////////////////////////////////////////////////
//
// Main state machine
//
///////////////////////////////////////////////////////////////////////////////

	// State enumeration
	const mainStates = {
		preloading	: 1, 
		initLoader	: 2,
		loading		: 3,
		loadComplete: 4,
		intro		: 5,
		resetTitle	: 6,
		title		: 7,
		tutorial	: 8,
		game		: 9
	};
	var state = mainStates.initial;

	function timerTick() {
		var res;

		switch(state) {
		case mainStates.initial:
			init();
			break;
		case mainStates.preloading:
			drawPreload();
			break;
		case mainStates.initLoader:
			initLoader();
			break;
		case mainStates.loading:
			loader.draw(Math.ceil(loadCount * 100 / itemsToLoad));
			flip();
			break;
		case mainStates.loadComplete:
			loadComplete();
			loader.resetIntro({
				bar : imgLoadingBar,
				buttons : imgButtons,
				title : imgTitle
			});
			state = mainStates.intro;
			break;
		case mainStates.intro:
			res = loader.drawIntro();
			flip();
			if(res != mainStates.unknown) {
				state = mainStates.resetTitle;
			}
			break;
		case mainStates.resetTitle:
			title.reset();
			state = mainStates.title;
			break;
		case mainStates.title:
			title.draw();
			flip();
			break;
		case mainStates.game:
			//drawBoard();
			break;
		}
	}

///////////////////////////////////////////////////////////////////////////////
//
// Event functions
//
///////////////////////////////////////////////////////////////////////////////

	// Mouse position variables
	var mouseX, mouseY;

	function eventMouseMove(e) {			
		if(e.offsetX || e.offsetX == 0) {
			mouseX = e.offsetX;
			mouseY = e.offsetY;
		} else if(e.layerX || e.layerX == 0) {
			mouseX = e.layerX - theCanvas.offsetLeft;
			mouseY = e.layerY - theCanvas.offsetTop;
		}

		switch(state) {
		case mainStates.title:
			title.eventMouseMove(mouseX, mouseY);
			break;
		}
	}

	function eventMouseClick(e) {
		switch(state) {
		case mainStates.title:
			title.eventMouseClick(e);
			break;
		}
	}

	function eventKeyUp(e) {
		if(e.keyCode != 37 && e.keyCode != 39) {
			return;
		}

		switch(state) {
		case mainStates.title:
			title.eventKeyUp(e);
			break;
		}
	}

	function eventKeyDown(e) {
		if(e.keyCode != 37 && e.keyCode != 39) {
			return;
		}

		switch(state) {
		case mainStates.title:
			title.eventKeyDown(e);
			break;
		}
	}

///////////////////////////////////////////////////////////////////////////////
//
// Pre-loader subroutines & initialization
//
///////////////////////////////////////////////////////////////////////////////

	// Pre-loader counters
	var itemsToPreload = 1;
	var preloadCount = 0;

	// Prepare global variables
	var env = {
		mainStates : mainStates,
		screenWidth : screenWidth,
		screenHeight : screenHeight
	};

	// Go to tutorial if the player is first time play the game.
	var tutorialStart;

	function init() {
		// Setup image loader events
		imgLoadingBar.src = "image/BananaLoader.png";
		imgLoadingBar.onload = eventItemPreLoaded;

		// Setup canvas
		theCanvas = document.getElementById("canvas");
		theCanvas.width = screenWidth;
		theCanvas.height = screenHeight;
		context = theCanvas.getContext("2d");
		backCanvas  = document.createElement("canvas");
		backCanvas.width = screenWidth;
		backCanvas.height = screenHeight;
		backContext = backCanvas.getContext("2d");

		// Setup events
		theCanvas.addEventListener("mousemove", eventMouseMove, true);
		theCanvas.addEventListener("click", eventMouseClick, true);
		document.addEventListener("keyup", eventKeyUp, true);
		document.addEventListener("keydown", eventKeyDown, true);

		// Switch to next state
		state = mainStates.preloading;
	}

	function drawPreload() {
		// Clear Background
		context.fillStyle = "#ffffff";
		context.fillRect(0, 0, screenWidth, screenHeight);

		// Print percentage
		context.textBaseline = "bottom";	
		context.fillStyle = "#000000";
		context.font = "14px monospace";
		context.textAlign = "center";
		context.fillText("Preparing ...", screenWidth/2, screenHeight/2);
	}

	function eventItemPreLoaded(e) {
		preloadCount++;
		if(preloadCount == itemsToPreload) {
			state = mainStates.initLoader;
		}
	}

///////////////////////////////////////////////////////////////////////////////
//
// Loader subroutines
//
///////////////////////////////////////////////////////////////////////////////

	// Loader counters
	var itemsToLoad = 33;
	var loadCount = 0;

	function initLoader() {
		// Setup image loader events
		imgTitle.src = "image/Title.png";
		imgTitle.onload = eventItemLoaded;
		imgButtons.src = "image/Buttons.png";
		imgButtons.onload = eventItemLoaded;
		imgFrame.src = "image/Frame.png";
		imgFrame.onload = eventItemLoaded;

		// Load banana & sunflower images
		for(var i = 1; i <= 15; i++) {
			imgBananas[i-1] = new Image();
			imgBananas[i-1].src = "image/Banana/" + i + ".jpg";
			imgBananas[i-1].onload = eventItemLoaded;
			imgFlowers[i-1] = new Image();
			imgFlowers[i-1].src = "image/Sunflower/" + i + ".jpg";
			imgFlowers[i-1].onload = eventItemLoaded;
		}

		// Pass resources to loader
		loader.init(env, {
			bar : imgLoadingBar
		},
		backContext);

		// Switch to next state
		state = mainStates.loading;
	}

	function eventItemLoaded(e) {
		loadCount++;
		if(loadCount == itemsToLoad) {
			state = mainStates.loadComplete;
		}
	}

	function loadComplete() {
		// Initialize sub modules
		title.init(env, {
			buttons : imgButtons,
			title : imgTitle
		}, backContext);
	}

///////////////////////////////////////////////////////////////////////////////
//
// General utilities
//
///////////////////////////////////////////////////////////////////////////////

	function flip() {
		context.drawImage(backCanvas, 0, 0);
	}

///////////////////////////////////////////////////////////////////////////////
//
// Public Access
//
///////////////////////////////////////////////////////////////////////////////

	function startMessageLoop() {
		const FPS = 30;
		var intervalTime = 1000 / FPS;
		setInterval(timerTick, intervalTime);
	}

	return {
		startMessageLoop : startMessageLoop
	};
})();

function canvasSupport() {
	return !!document.createElement('testcanvas').getContext;
}

function eventWindowLoaded() {
	resume.startMessageLoop();
}
window.addEventListener('load', eventWindowLoaded, false);

