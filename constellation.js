
//Variables used for the canvases
var canvas;
var context;
var backCanvas;
var backContext;

//Canvas dimensions
var canvasWidth;
var canvasHeight;

//Global static variables
//used in script
var STAR_VELOCITY = 0.1;
var MAX_STAR_RADIUS = 5;
var NUMBER_OF_STARS = 80;
var MAX_LINE_DISTANCE = 130;

//Global color hex values
var MAIN_COLOR = "#99cc99";
var SECONDARY_COLOR = "#2c798e";
var TERTIARY_COLOR = "#0b608b";

//Global colors converted to RGB values
var MAIN_R = hexToRgb(MAIN_COLOR).r;
var MAIN_G = hexToRgb(MAIN_COLOR).g;
var MAIN_B = hexToRgb(MAIN_COLOR).b;

//The Star arrays
var stars = [];
var staticStars = [];
var backStars = [];

//Web animation requests
var requestAnimationFrame = window.requestAnimationFrame || 
                            window.mozRequestAnimationFrame || 
                            window.webkitRequestAnimationFrame || 
                            window.msRequestAnimationFrame;



/**
* ====================================
* STAR OBJECT
* ====================================
* The Star class to draw and place stars
* in their respective canvases.
* 
* @param {int}placement: For placing stars in 
*                        their respective fields 
*                        of depth.
*
* @param {bool}isFront:  To place in either the 
*                        front or back canvas.
*/
function Star(placement, isFront){
	this.x = Math.random() * canvas.width;
	this.y = Math.random() * canvas.height;

	this.vx = STAR_VELOCITY - (Math.random() * 0.3);
	this.vy = STAR_VELOCITY - (Math.random() * 0.3);

	this.radius = Math.random() * MAX_STAR_RADIUS;

	if (placement == 1){
		this.color = MAIN_COLOR;
	}
	else if (placement == 2){
		this.color = SECONDARY_COLOR;
	}
	else{
		this.color = TERTIARY_COLOR;
	}

	if (isFront){
		this.create = function(){
			context.beginPath();
			context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
			context.closePath();
			context.fillStyle = this.color;
			context.fill();
		}
	}
	else{
		this.create = function(){
			backContext.beginPath();
			backContext.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
			backContext.closePath();
			backContext.fillStyle = this.color;
			backContext.fill();
		}
	}

	this.animate = function(){
		if ((this.y < this.radius) || (this.y > canvasHeight - this.radius)){
			this.vy *= -1;
		}
		else if ((this.x < this.radius) || (this.x > canvasWidth - this.radius)){
			this.vx *= -1;
		}

		this.x += this.vx;
		this.y += this.vy;
	}
}


/** 
* ===================
* DRAWLINES
* ==================
*	
* Used to draw the lines between each star.
* Currently runs at O(n^2) complexity, though.
*/
function drawLines(){
	var iStar, jStar;

	for (var i = 0; i < stars.length; i++){
		for (var j = i; j < stars.length; j++){
			iStar = stars[i];
			jStar = stars[j];

			if (iStar == jStar){ continue; }

			var dist = (Math.abs(iStar.x - jStar.x) + Math.abs(iStar.y - jStar.y)) / 2;

			var opacity = Math.abs(((dist / MAX_LINE_DISTANCE) - 1));


			if ((iStar.x - jStar.x) < MAX_LINE_DISTANCE &&
				(iStar.y - jStar.y) < MAX_LINE_DISTANCE &&
				(iStar.x - jStar.x) > - MAX_LINE_DISTANCE &&
				(iStar.y - jStar.y) > - MAX_LINE_DISTANCE){

				context.beginPath();
				context.moveTo(iStar.x, iStar.y);
				context.lineTo(jStar.x, jStar.y);
				context.lineWidth = 1;
				context.strokeStyle = "rgba("+ MAIN_R +", " + MAIN_G +", " + MAIN_B + ", " + opacity +")";
				context.stroke();
				context.closePath();
			}
		}
	}
}

/**
* ====================
* HEXTORGB
* ====================
*
* Converts the given hex color-value into an RGB-value.
* Primarily used to make the stroke opacity function work.
*/
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}


/**
* ======================
* INITCANVAS
* ======================
* 
* Initializes canvases and constellation implementation.
*/
function initCanvas(){
	canvas = document.getElementById('myCanvas');
	backCanvas = document.getElementById('backCanvas');

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	backCanvas.width = window.innerWidth;
	backCanvas.height = window.innerHeight;

	if (canvas.width < 767 && backCanvas.width < 767){
		NUMBER_OF_STARS = 25;
	}

	if (canvas.getContext && backCanvas.getContext){
		context = canvas.getContext('2d');
		backContext = backCanvas.getContext('2d');
		canvasWidth = canvas.width;
		canvasHeight = canvas.height;

		for(var i = 0; i < NUMBER_OF_STARS; i++){
			newStar = new Star(1, true);
			newStaticStar = new Star(2, false);
			newBackStar = new Star(3, false);

			stars.push(newStar);
			staticStars.push(newStaticStar);
			backStars.push(newBackStar);
		}

		//Creates the background stars.
		//Placed in initCanvas function so it's just a one-time draw.
		backContext.clearRect(0, 0, canvas.width, canvas.height);
		for(var i = 0; i < stars.length; i++){
			staticStars[i].create();
			backStars[i].create();
		}

		renderCanvas();
	};
}

/**
* =======================
* RENDERCANVAS
* =======================
*
* The animation loop function for moving the stars.
* Animation loop separate from InitCanvas so backgroun
* stars won't be a part of the repainting.
*/
function renderCanvas(){
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	for(var i = 0; i < stars.length; i++){
		stars[i].create();
		stars[i].animate();
	}

	drawLines();

	requestAnimationFrame(renderCanvas);
}
