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
	var imgMode = new Image();
	var imgAnswere = new Image();
	var imgLoadingBar = new Image();
	
	// Sound components
	var sndYes, sndNo;

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
		resetGame	: 8,
		game		: 9
	};
	var state = mainStates.initial;
	var mode;

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
			res = title.draw();
			flip();
			if(res != mainStates.unknown) {
				state = mainStates.resetGame;
			}
			break;
		case mainStates.resetGame:
			gameLogic.reset(mode);
			state = mainStates.game;
			break;
		case mainStates.game:
			res = gameLogic.draw();
			flip();
			if(res == 1) {
				mode = 0;
				state = mainStates.resetTitle;
			} else if(res == 2) {
				mode = 1;
				state = mainStates.resetTitle;
			}
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
		case mainStates.game:
			gameLogic.eventMouseMove(mouseX, mouseY);
			break;
		}
	}

	function eventMouseClick(e) {
		switch(state) {
		case mainStates.title:
			title.eventMouseClick(e);
			break;
		case mainStates.game:
			gameLogic.eventMouseClick(e);
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
		case mainStates.game:
			gameLogic.eventKeyUp(e);
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
		case mainStates.game:
			gameLogic.eventKeyDown(e);
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

	function init() {
		// Hide result texts
		document.getElementById("result0").style.visibility = "hidden";
		document.getElementById("result1").style.visibility = "hidden";
		document.getElementById("result2").style.visibility = "hidden";

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
	var itemsToLoad = 35;
	var loadCount = 0;

	function initLoader() {
		// Setup image loader events
		imgTitle.src = "image/Title.png";
		imgTitle.onload = eventItemLoaded;
		imgButtons.src = "image/Buttons.png";
		imgButtons.onload = eventItemLoaded;
		imgFrame.src = "image/Frame.png";
		imgFrame.onload = eventItemLoaded;
		imgMode.src = "image/Mode.png";
		imgMode.onload = eventItemLoaded;
		imgAnswere.src = "image/Answere.png";
		imgAnswere.onload = eventItemLoaded;

		// Setup sound loader events
		audioLoaderSetup();

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

		gameLogic.init(env, {
			buttons : imgButtons,
			title : imgTitle,
			frame : imgFrame,
			mode : imgMode,
			answere : imgAnswere,
			bananas : imgBananas,
			flowers : imgFlowers
		}, {
			correct : sndYes,
			wrong : sndNo
		},backContext);
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
// Audio utilities
//
///////////////////////////////////////////////////////////////////////////////

	function audioLoaderSetup() {
		var audioType;

		sndYes = document.createElement("audio");
		document.body.appendChild(sndYes);
		audioType = audioSupportedFormat(sndYes);
		sndYes.setAttribute("src", "sound/Correct" + audioType);
		sndYes.addEventListener("canplaythrough", eventItemLoaded, false);

		sndNo = document.createElement("audio");
		document.body.appendChild(sndNo);
		sndNo.setAttribute("src", "sound/Wrong" + audioType);
		sndNo.addEventListener("canplaythrough", eventItemLoaded, false);
	}

	function audioLoadComplete() {
		soundResult0.removeEventListener("canplaythrough", eventItemLoaded, false);
		soundResult1.removeEventListener("canplaythrough", eventItemLoaded, false);
	}

	function audioSupportedFormat(audio) {
		var returnExtension = "";
		if (audio.canPlayType("audio/ogg") =="probably" || audio.canPlayType("audio/ogg") == "maybe") {
			returnExtension = ".ogg";
		} else if(audio.canPlayType("audio/mp3") == "probably" || audio.canPlayType("audio/mp3") == "maybe") {	
			returnExtension = ".mp3";
		}
		return returnExtension;
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

