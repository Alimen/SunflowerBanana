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
			backContext.drawImage(img.title, 0, 40);
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
			return env.mainStates.resetTitle;
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

var title = (function() {
	// Environmental variables
	var backContext;
	var img;
	var env;

	// Button status
	var gameStartMouse, moreInfoMouse;
	var gameStartKey, moreInfoKey;
	var starting;

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
		starting = 0;
	}

///////////////////////////////////////////////////////////////////////////////
//
// Event handler
//
///////////////////////////////////////////////////////////////////////////////

	function eventMouseMove(x, y) {
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
		if(gameStartMouse == 1) {
			starting = 1;
		}
	}

	function eventKeyUp(e) {
		if(e.keyCode == 37) {
			moreInfoKey = 0;
			var info = window.open();
			info.location = "MoreInfo.html";
		}
		if(e.keyCode == 39) {
			gameStartKey = 0;
			starting = 1;
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

		if(starting == 1) {
			return env.mainStates.resetGame;
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
		reset : reset,
		draw : draw,

		eventMouseMove : eventMouseMove,
		eventMouseClick : eventMouseClick,
		eventKeyUp : eventKeyUp,
		eventKeyDown : eventKeyDown
	};
})();
