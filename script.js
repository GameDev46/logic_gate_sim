const gateSelect = document.getElementById("gate");
const gateButton = document.getElementById("add-gate");

let gates = [];
let draggingNumber = null;

let scroll = {
	changeX: 0,
	changeY: 0,
	hasBeenDragged: false,
	dragging: false,
	x: 0,
	y: 0
}

let undoList = [];

let websiteAudio = {
	cachedDrop: new Audio("./sounds/drop.wav"),
	cachedDrop2: new Audio("./sounds/drop2.wav"),
	cachedConnect: new Audio("./sounds/connect2.wav"),
	cachedConnect2: new Audio("./sounds/connect.wav"),
	drop: function() {
		let tempAudio = this.cachedDrop;

		tempAudio.currentTime = 0;
		tempAudio.volume = 1;
		tempAudio.play();
	},
	pickup: function() {
		let tempAudio = this.cachedDrop2;

		tempAudio.currentTime = 0;
		tempAudio.volume = 1;
		tempAudio.play();
	},
	addText: function() {
		let tempAudio = this.cachedDrop;

		tempAudio.currentTime = 0;
		tempAudio.play();
	},
	connectDrag: function() {
		let tempAudio = this.cachedConnect;

		tempAudio.currentTime = 1000;
		tempAudio.play();
	},
	switch: function() {
		let tempAudio = this.cachedConnect2;

		tempAudio.currentTime = 0;
		tempAudio.play();
	}
}

const canvas = document.getElementById("background-canvas");
const ctx = canvas.getContext("2d");

gateButton.addEventListener("click", e => {

	let newGateHolder = document.createElement("div");
	newGateHolder.classList.add("logic-gate");
	
	let newGate = document.createElement("div");
	newGate.id = gates.length;

	let newGateH2 = document.createElement("h2");
	newGateH2.innerText = gateSelect.value;

	let newGateImage = document.createElement("img");
	newGateImage.src = "./images/" + gateSelect.value + ".svg";
	//if (gateSelect.value == "buffer") newGateImage.src = "images/" + gateSelect.value + ".png";
	newGateImage.alt = gateSelect.value + " gate";
	newGateImage.onerror = function() {
		this.style.opacity = 0;
		this.style.height = "27px";
	}

	let newGateDrag = document.createElement("span");
	newGateDrag.id = gates.length + "drag";

	newGateDrag.addEventListener("mousedown", e => {
		draggingNumber = Number(e.target.id.substring(0, e.target.id.length - 4));

		showAndHideDropAreas(true);

		websiteAudio.connectDrag();
	})

	newGateDrag.addEventListener("touchstart", e => {
		draggingNumber = Number(e.touches[0].target.id.substring(0, e.touches[0].target.id.length - 4));

		showAndHideDropAreas(true);

		websiteAudio.connectDrag();
	})

	newGate.appendChild(newGateImage);
	newGate.appendChild(newGateH2);
	newGateHolder.appendChild(newGate)
	newGateHolder.appendChild(newGateDrag);
	document.getElementById("logic-gate-holder").appendChild(newGateHolder);

	newGate.addEventListener("mouseup", e => {
		touchAndMouseConnectGates(newGate);
		showAndHideDropAreas(false);
	})

	let gateObject = {
		name: gateSelect.value,
		element: newGate,
		connections: [],
		connected: 0,
		dragged: false,
		inputs: [false, false, false],
		data: [false, false, 0],
		x: 10,
		y: 100,
		runConnections: function(offOrOn) {
			// Activate or deactivate all the connected gates

			this.data[1] = offOrOn;

			for (var i = 0; i < this.connections.length; i++) {
				let itemID = this.connections[i][0];

				gates[itemID].inputs[this.connections[i][1]] = offOrOn;						
				gates[itemID].run();
			}
		},
		run: function() {

			if (this.name == "input") {
				return false;
			}
			else if (this.name == "output") {
				let foundOn = false;
				
				for (var i = 0; i < this.inputs.length; i++) {
					if (this.inputs[i] == true) {
						foundOn = true;
					}
				}

				if (foundOn) {
					this.element.style.background = "linear-gradient(45deg, rgba(205,205,98,1) 0%, rgba(232,255,125,1) 51%, rgba(205,205,98,1) 100%)";
					this.element.style.boxShadow = "0 0 20px rgba(245, 245, 120, 0.7)";

					this.runConnections(true);
				}
				else {
					this.element.style.background = "var(--whiteColour)";		
					this.element.style.boxShadow = "none";

					this.runConnections(false);
				}
			}
			else if (this.name == "toggle") {
				this.data[2] += 1;

				if (this.data[2] == 1 || this.data[2] == 3) {
					if (!this.inputs[0]) {
						this.data[2] -= 1;
					}
				}

				if (this.data[2] == 1) {
					this.runConnections(true);

					this.data[0] = true;
					this.element.style.background = "rgb(255, 160, 130)";
				}
				else if (this.data[2] == 3) {
					this.runConnections(false);

					this.data[0] = false;					
					this.element.style.background = "var(--whiteColour)";
				}

				if (this.data[2] > 3) {
					this.data[2] = 0;
				}
			}
			else if (this.name == "buffer") {
				if (this.inputs[0]) {
					this.runConnections(true);
				}
				else {
					this.runConnections(false);
				}
			}
			else if (this.name == "and") {
				if (this.inputs[0] && this.inputs[1]) {
					this.runConnections(true);
				}
				else {
					this.runConnections(false);
				}
			}
			else if (this.name == "nand") {
				let holder = this.inputs[0] && this.inputs[1];
				if (!holder) {
					this.runConnections(true);
				}
				else {
					this.runConnections(false);
				}
			}
			else if (this.name == "not") {
				if (this.inputs[0]) {
					this.runConnections(false);
				}
				else {
					this.runConnections(true);
				}
			}
			else if (this.name == "or") {
				if (this.inputs[0] || this.inputs[1]) {
					this.runConnections(true);
				}
				else {
					this.runConnections(false);
				}
			}
			else if (this.name == "nor") {
				if (!this.inputs[0] && !this.inputs[1]) {
					this.runConnections(true);
				}
				else {
					this.runConnections(false);
				}
			}
			else if (this.name == "xor") {
				if (this.inputs[0] || this.inputs[1]) {
					if (this.inputs[0] != this.inputs[1]) {
						this.runConnections(true);
					}
					else {
						this.runConnections(false);
					}
				}
				else {
					this.runConnections(false);
				}
			}
			else if (this.name == "adder") {
				
				let possible1LightBools = [!this.inputs[0] && this.inputs[1] && this.inputs[2], this.inputs[0] && !this.inputs[1] && this.inputs[2], this.inputs[0] && this.inputs[1] && !this.inputs[2], !this.inputs[0] && !this.inputs[1] && this.inputs[2], !this.inputs[0] && this.inputs[1] && !this.inputs[2], this.inputs[0] && !this.inputs[1] && !this.inputs[2]];

				this.runConnections(false);
				
				if (this.inputs[0] && this.inputs[1] && this.inputs[2]) {
					// Activate or deactivate all the connected gates

					for (var i = 0; i < this.connections.length; i++) {
						if (i < 2) {
							let itemID = this.connections[i][0];

							gates[itemID].inputs[this.connections[i][1]] = true;						
							gates[itemID].run();
						}
					}
				}
				else if (possible1LightBools[0] || possible1LightBools[1] || possible1LightBools[2]) {
					// deactivate or deactivate all the connected gates

					if (this.connections.length > 0) {
						let i = 1;
						let itemID = this.connections[i][0];

						gates[itemID].inputs[this.connections[i][1]] = true;						
						gates[itemID].run();
					}
				}
				else if (possible1LightBools[3] || possible1LightBools[4] || possible1LightBools[5]) {
					// deactivate or deactivate all the connected gates

					if (this.connections.length > 0) {
						let i = 0;
						let itemID = this.connections[i][0];

						gates[itemID].inputs[this.connections[i][1]] = true;						
						gates[itemID].run();
					}
				}
				else if (!this.inputs[0] && !this.inputs[1] && !this.inputs[2]) {
					// deactivate or deactivate all the connected gates

					for (var i = 0; i < this.connections.length; i++) {
						if (i < 2) {
							let itemID = this.connections[i][0];

							gates[itemID].inputs[this.connections[i][1]] = false;						
							gates[itemID].run();
						}
					}
				}
				
			}
			else if (this.name == "clock") {
				return false;
			}
			
		}
	}
	
	gates.push(gateObject);

	// Event listeners

	newGate.addEventListener("touchstart", e => {
		gates[Number(e.target.id)].dragged = true;

		websiteAudio.pickup();

		// Send gate to front
		//e.touches[0].target.style.zIndex = "50";
	});

	newGate.addEventListener("mousedown", e => {
		if (e.button == 0) {
			gates[Number(e.target.id)].dragged = true;

			websiteAudio.pickup();

			// Send gate to front
			//e.target.style.zIndex = "50";
		}
	});

	newGate.addEventListener("mousemove", e => {
		if (gates[Number(e.target.id)].dragged) {
			e.target.style.left = (e.pageX - 25) + "px";
			e.target.style.top = (e.pageY - 25) + "px";

			document.getElementById(e.target.id + "drag").style.left = (e.pageX + 20) + "px";
			document.getElementById(e.target.id + "drag").style.top = (e.pageY + 5) + "px";

			drawWiresToScreen();
		}
	});
	
	newGate.addEventListener("mouseup", e => {
		userLiftUp(e);
		drawWiresToScreen();

		showAndHideDropAreas(false);
	});

newGate.addEventListener("touchmove", e => {
		if (gates[Number(e.target.id)].dragged) {
			e.target.style.left = (e.touches[0].pageX - 25) + "px";
			e.target.style.top = (e.touches[0].pageY - 25) + "px";

			document.getElementById(e.touches[0].target.id + "drag").style.left = (e.touches[0].pageX + 20) + "px";
			document.getElementById(e.touches[0].target.id + "drag").style.top = (e.touches[0].pageY + 5) + "px";

			drawWiresToScreen();
		}
	});

	newGate.addEventListener("touchend", e => {
		gates[Number(e.changedTouches[0].target.id)].x = -100;
		userLiftUp(e.changedTouches[0]);
		drawWiresToScreen();
		
		showAndHideDropAreas(false);
		touchAndMouseConnectGates(newGate);
	});
	
})

function showAndHideDropAreas(showHide) {
	for (var i = 0; i < gates.length; i++) {
		if (showHide && i != draggingNumber) {
			gates[i].element.style.outlineWidth = "2px";
			gates[i].element.style.outlineStyle = "dashed";
			gates[i].element.style.outlineColor = "rgb(255, 100, 100)";
		}
		else {
			gates[i].element.style.outline = "none";
		}
	}
}

function userLiftUp(e) {
	gates[Number(e.target.id)].dragged = false;

	e.target.style.zIndex = "0";

		if (gates[Number(e.target.id)].x == e.target.style.left && gates[Number(e.target.id)].y == e.target.style.top) {
			if (gates[Number(e.target.id)].name == "input") {
				websiteAudio.switch();
				
				if (gates[Number(e.target.id)].data[0]) {
					gates[Number(e.target.id)].data[0] = false;

					e.target.style.background = "var(--whiteColour)";

					// Deactivate all the connected gates

					for (var i = 0; i < gates[Number(e.target.id)].connections.length; i++) {
						let itemID = gates[Number(e.target.id)].connections[i][0];

						gates[itemID].inputs[gates[Number(e.target.id)].connections[i][1]] = false;		
						gates[itemID].run();
					}
				}
				else {
					gates[Number(e.target.id)].data[0] = true;

					e.target.style.background = "linear-gradient(90deg, rgb(80, 110, 200), rgb(130, 160, 250), rgb(80, 110, 200))";

					// Activate all the connected gates

					for (var i = 0; i < gates[Number(e.target.id)].connections.length; i++) {
						let itemID = gates[Number(e.target.id)].connections[i][0];
			
						gates[itemID].inputs[gates[Number(e.target.id)].connections[i][1]] = true;
						gates[itemID].run();
					}
					
				}
			}
		}
		else {
			gates[Number(e.target.id)].x = e.target.style.left;
			gates[Number(e.target.id)].y = e.target.style.top;

			console.log(gates[Number(e.target.id)])

			websiteAudio.drop();
		}
}

document.addEventListener("mouseup", e => {
	draggingNumber = null;
	drawWiresToScreen();
	
	showAndHideDropAreas(false);
})

document.addEventListener("touchend", e => {
	draggingNumber = null;
	drawWiresToScreen();
	
	showAndHideDropAreas(false);
})

function touchAndMouseConnectGates(newGate) {
	if (draggingNumber != null) {
		for (var i = 0; i < gates[draggingNumber].connections.length; i++) {
			if (gates[draggingNumber].connections[i][0] == Number(newGate.id)) {
				return;
			}
		}

		if (draggingNumber == Number(newGate.id)) {
			return;
		}
			
		gates[draggingNumber].connections.push([Number(newGate.id), gates[Number(newGate.id)].connected]);
		gates[Number(newGate.id)].connected += 1;

		undoList.push([draggingNumber, Number(newGate.id)]);
		
		draggingNumber = null;
	}

	drawWiresToScreen();
}

// Canvas and wires

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", e => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	drawWiresToScreen();
})

let lineWidth = 4;
let strokeColour = '#82A0FA';
let activeColour = "#dd4859";
let wirePower = 10;

let backingColour = "#FFFFFF";

function drawWiresToScreen() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	drawGridToBackground();
	
	ctx.lineCap = 'round';
	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = strokeColour;

	let wirePower = 10;
	
	for (var i = 0; i < gates.length; i++) {
		let isActive = gates[i].data[1] || gates[i].data[0];
		
		for (var x = 0; x < gates[i].connections.length; x++) {
			let connectObject = gates[gates[i].connections[x][0]];

			let obj1 = {
				x: Number(connectObject.element.style.left.substring(0, connectObject.element.style.left.length - 2)) + 30,
				y: Number(connectObject.element.style.top.substring(0, connectObject.element.style.top.length - 2)) + 30
			}

			let obj2 = {
				x: Number(gates[i].element.style.left.substring(0, gates[i].element.style.left.length - 2)) + 30,
				y: Number(gates[i].element.style.top.substring(0, gates[i].element.style.top.length - 2)) + 30
			}

			// Calculate x half

			let xHalf = obj2.x + ((obj1.x - obj2.x) / 2);
			if ((obj1.x - obj2.x) / 2 < 0) {
				xHalf = {
					x1: xHalf + (xHalf / wirePower),
					x2: xHalf - (xHalf / wirePower)
				}
			}
			else {
				xHalf = {
					x1: xHalf - (xHalf / wirePower),
					x2: xHalf + (xHalf / wirePower)
				}
			}
		
			let yHalf = obj2.y + ((obj1.y - obj2.y) / 2);
			if ((obj1.y - obj2.y) / 2 < 0) {
				yHalf = {
					y1: yHalf + (yHalf / wirePower),
					y2: yHalf - (yHalf / wirePower)
				}
			}
			else {
				yHalf = {
					y1: yHalf - (yHalf / wirePower),
					y2: yHalf + (yHalf / wirePower)
				}
			}

			let ySmallerX = Math.abs((obj1.y - obj2.y) / 2) < Math.abs((obj1.x - obj2.x) / 2);

			ctx.lineWidth = lineWidth + 4;
			ctx.strokeStyle = backingColour;

			ctx.beginPath();
  		ctx.moveTo(obj2.x, obj2.y);
  		if (ySmallerX) {
				ctx.lineTo(xHalf.x1, obj2.y);
				ctx.lineTo(xHalf.x2, obj1.y);
			}
			else {
				ctx.lineTo(obj2.x, yHalf.y1);
				ctx.lineTo(obj1.x, yHalf.y2);
			}
			ctx.lineTo(obj1.x, obj1.y);
  		ctx.stroke();

			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = strokeColour;

			if (isActive) {
				ctx.strokeStyle = activeColour;
			}
			
			ctx.beginPath();
  		ctx.moveTo(obj2.x, obj2.y);
			if (ySmallerX) {
				ctx.lineTo(xHalf.x1, obj2.y);
				ctx.lineTo(xHalf.x2, obj1.y);
			}
			else {
				ctx.lineTo(obj2.x, yHalf.y1);
				ctx.lineTo(obj1.x, yHalf.y2);
			}
			ctx.lineTo(obj1.x, obj1.y);
  		ctx.stroke();
		}
	}
}

function drawGridToBackground() {
	// Draw grid to background

	let squareColour = "#FFFFFF07";

	if (mode == "light") {
		squareColour = "#00000011";
	}
	else {
		squareColour = "#FFFFFF07";
	}

	ctx.lineCap = 'round';
	ctx.lineWidth = 2;
	ctx.strokeStyle = squareColour;

	let squareSize = 25;

	ctx.beginPath();
	
	for (var x = scroll.x; x < canvas.width; x += squareSize) {
		for (var z = scroll.y; z < canvas.height; z += squareSize) {			
  		ctx.moveTo(0, z);
			ctx.lineTo(canvas.width, z);
		}
		
  	ctx.moveTo(x, 0);
		ctx.lineTo(x, canvas.height);
	}

	ctx.stroke();

	if (scroll.x > squareSize || scroll.x < -squareSize) {
		scroll.x = 0;
	}

	if (scroll.y > squareSize || scroll.y < -squareSize) {
		scroll.y = 0;
	}
}

// Connection wire animation

window.addEventListener("mousemove", e => {
	if (draggingNumber != null) {
		drawWiresAndDragMarker(e);

		document.body.style.cursor = "grabbing";
		canvas.style.cursor = "grabbing";
	}
	else {
		document.body.style.cursor = "default";
		canvas.style.cursor = "default";
	}
})

window.addEventListener("touchmove", e => {
	if (draggingNumber != null) {
		drawWiresAndDragMarker(e.touches[0]);
	}
})

function drawWiresAndDragMarker(e) {
	drawWiresToScreen();

	
	ctx.lineCap = 'round';
	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = strokeColour;

	let connectObject = gates[draggingNumber];

	let obj1 = {
		x: Number(connectObject.element.style.left.substring(0, connectObject.element.style.left.length - 2)) + 30,
		y: Number(connectObject.element.style.top.substring(0, connectObject.element.style.top.length - 2)) + 30
	}

	let obj2 = {
		x: e.pageX - 5,
		y: e.pageY - 5
	}

	// Calculate x half

	let xHalf = obj2.x + ((obj1.x - obj2.x) / 2);
	if ((obj1.x - obj2.x) / 2 < 0) {
		xHalf = {
			x1: xHalf + (xHalf / wirePower),
			x2: xHalf - (xHalf / wirePower)
		}
	}
	else {
		xHalf = {
			x1: xHalf - (xHalf / wirePower),
			x2: xHalf + (xHalf / wirePower)
		}
	}
		
	let yHalf = obj2.y + ((obj1.y - obj2.y) / 2);
	if ((obj1.y - obj2.y) / 2 < 0) {
		yHalf = {
			y1: yHalf + (yHalf / wirePower),
			y2: yHalf - (yHalf / wirePower)
		}
	}
	else {
		yHalf = {
			y1: yHalf - (yHalf / wirePower),
			y2: yHalf + (yHalf / wirePower)
		}
	}

	let ySmallerX = Math.abs((obj1.y - obj2.y) / 2) < Math.abs((obj1.x - obj2.x) / 2);

	ctx.lineWidth = lineWidth + 4;
	ctx.strokeStyle = backingColour;

	ctx.beginPath();
  ctx.moveTo(obj2.x, obj2.y);
  if (ySmallerX) {
		ctx.lineTo(xHalf.x1, obj2.y);
		ctx.lineTo(xHalf.x2, obj1.y);
	}
	else {
		ctx.lineTo(obj2.x, yHalf.y1);
		ctx.lineTo(obj1.x, yHalf.y2);
	}
	ctx.lineTo(obj1.x, obj1.y);
  ctx.stroke();

	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = strokeColour;
	ctx.fillStyle = "#aa2533";
			
	ctx.beginPath();
  ctx.moveTo(obj2.x, obj2.y);
	if (ySmallerX) {
		ctx.lineTo(xHalf.x1, obj2.y);
		ctx.lineTo(xHalf.x2, obj1.y);
	}
	else {
		ctx.lineTo(obj2.x, yHalf.y1);
		ctx.lineTo(obj1.x, yHalf.y2);
	}
	ctx.lineTo(obj1.x, obj1.y);
  ctx.stroke();

	ctx.beginPath();
	ctx.arc(obj2.x, obj2.y, 7, 0, 2 * Math.PI);
	ctx.fill();
}

// Light dark mode toggle

let mode = "light";
updateMode();

document.getElementById("mode-toggle").addEventListener("click", e => {
	updateMode();
})

function updateMode() {
	if (mode == "dark") {
		mode = "light";

		document.body.style.setProperty("--whiteColour", "rgb(250, 250, 250)");
		document.body.style.setProperty("--lightGreyColour", "rgb(240, 240, 240)");
		document.body.style.setProperty("--blackColour", "rgb(13, 13, 13)");
		document.body.style.setProperty("--imageFilter", "0%");
		document.body.style.setProperty("--buttonColour", "rgba(0, 0, 0, 0.4)");

		document.getElementById("mode-toggle").innerHTML = '<i data-feather="sun"></i>';

		backingColour = "#FFFFFF";
	}
	else {
		mode = "dark";

		document.body.style.setProperty("--whiteColour", "rgb(20, 20, 25)");
		document.body.style.setProperty("--lightGreyColour", "rgb(15, 15, 20)");
		document.body.style.setProperty("--blackColour", "rgb(255, 255, 255)");
		document.body.style.setProperty("--imageFilter", "100%");
		document.body.style.setProperty("--buttonColour", "rgba(255, 255, 255, 0.1)");

		document.getElementById("mode-toggle").innerHTML = '<i data-feather="moon"></i>';

		backingColour = "#1b1b1b";
	}

	feather.replace();

	drawWiresToScreen();
}

// Text boxes

let textBoxes = [];

window.addEventListener("contextmenu", e => {
	e.preventDefault();
})

canvas.addEventListener("mousedown", e => {
	addTextBox(e.button, e);
})

canvas.addEventListener("touchend", e => {
	if (!scroll.hasBeenDragged) {
		if (confirm("Would you like to create a text box?")) {
			addTextBox(2, e.changedTouches[0]);
		}
	}
	else {
		scroll.hasBeenDragged = false;
	}
})

function addTextBox(buttonEntered, e) {
	if (draggingNumber == null && buttonEntered == 2) {
		// Add textbox

		websiteAudio.addText();

		let textBox = document.createElement("div");
		textBox.classList.add("textBox");

		let textBoxDrag = document.createElement("span");
		textBoxDrag.id = textBoxes.length + "text";

		let textBoxHolder = document.createElement("h2");
		textBoxHolder.innerText = "Click to edit";
		textBoxHolder.contentEditable = true;

		textBox.style.left = e.pageX + "px";
		textBox.style.top = e.pageY + "px";

		textBox.appendChild(textBoxDrag);
		textBox.appendChild(textBoxHolder);
		
		document.body.appendChild(textBox);

		let textBoxObject = {
			element: textBox,
			dragging: false
		}

		textBoxes.push(textBoxObject);
		

		textBoxDrag.addEventListener("mousedown", e => {
			let textItem = textBoxes[Number(e.target.id.substring(0, e.target.id.length - 4))];

			textItem.dragging = true;

			websiteAudio.pickup();
		})

		textBoxDrag.addEventListener("mousemove", e => {
			let textItem = textBoxes[Number(e.target.id.substring(0, e.target.id.length - 4))];

			if (textItem.dragging) {
				textItem.element.style.left = (e.pageX - 15) + "px";
				textItem.element.style.top = (e.pageY - 15) + "px";
			}
		})

		textBoxDrag.addEventListener("mouseup", e => {
			let textItem = textBoxes[Number(e.target.id.substring(0, e.target.id.length - 4))];

			textItem.dragging = false;

			websiteAudio.drop();
		})

		// Mobile

		textBoxDrag.addEventListener("touchstart", e => {
			let textItem = textBoxes[Number(e.target.id.substring(0, e.touches[0].target.id.length - 4))];

			textItem.dragging = true;

			websiteAudio.pickup();
		})

		textBoxDrag.addEventListener("touchmove", e => {
			let textItem = textBoxes[Number(e.target.id.substring(0, e.touches[0].target.id.length - 4))];

			if (textItem.dragging) {
				textItem.element.style.left = (e.touches[0].pageX - 10) + "px";
				textItem.element.style.top = (e.touches[0].pageY - 10) + "px";
			}
		})

		textBoxDrag.addEventListener("touchend", e => {
			let textItem = textBoxes[Number(e.target.id.substring(0, e.changedTouches[0].target.id.length - 4))];

			textItem.dragging = false;

			websiteAudio.drop();
		})
	}
}

// Scroll with mouse

canvas.addEventListener("mousedown", e => {
	scroll.changeX = e.pageX;
	scroll.changeY = e.pageY;

	scroll.dragging = true;
})

canvas.addEventListener("mousemove", e => {
	if (scroll.dragging) {
		moveEditorByDragging(e);

		canvas.style.cursor = "grabbing";
	}
})

window.addEventListener("mouseup", e => {
	scroll.dragging = false;

	canvas.style.cursor = "default";
})

canvas.addEventListener("touchstart", e => {
	scroll.changeX = e.touches[0].pageX;
	scroll.changeY = e.touches[0].pageY;
})

canvas.addEventListener("touchmove", e => {
	moveEditorByDragging(e.touches[0]);
})

function moveEditorByDragging(e) {
	scroll.changeX = scroll.changeX - e.pageX;
	scroll.changeY = scroll.changeY - e.pageY;

	scroll.changeX *= -1;
	scroll.changeY *= -1;

	scroll.x += scroll.changeX * 1.06;
	scroll.y += scroll.changeY * 1.06;

	for (var i = 0; i < gates.length; i++) {
		let item = gates[i];

		item.element.style.left = (Number(item.element.style.left.substring(0, item.element.style.left.length - 2)) + scroll.changeX) + "px";
		
		item.element.style.top = (Number(item.element.style.top.substring(0, item.element.style.top.length - 2)) + scroll.changeY) + "px";

		item.x = item.element.style.left;
		item.y = item.element.style.top;

		document.getElementById(item.element.id + "drag").style.left = (Number(item.element.style.left.substring(0, item.element.style.left.length - 2)) + 45) + "px";
		document.getElementById(item.element.id + "drag").style.top = (Number(item.element.style.top.substring(0, item.element.style.top.length - 2)) + 30) + "px";
	}

	for (var i = 0; i < textBoxes.length; i++) {
		let item = textBoxes[i];

		item.element.style.left = (Number(item.element.style.left.substring(0, item.element.style.left.length - 2)) + scroll.changeX) + "px";
		
		item.element.style.top = (Number(item.element.style.top.substring(0, item.element.style.top.length - 2)) + scroll.changeY) + "px";
	}

	scroll.hasBeenDragged = true;

	scroll.changeX = e.pageX;
	scroll.changeY = e.pageY;

	drawWiresToScreen();
}

// Before unload ask user

window.addEventListener("beforeunload", e => {
	e.returnValue = true;
});

window.addEventListener("keydown", e => {
	if (e.key.toUpperCase() == "Z" && e.ctrlKey) {

		e.preventDefault();

		if (undoList.length < 1) {
			return;
		}
		
		let undoDragNumber = undoList[undoList.length - 1][0];
		let gateConnected = undoList[undoList.length - 1][1];

		let gatesInputNum = gates[undoDragNumber].connections[gates[undoDragNumber].connections.length - 1][1];

		gates[undoDragNumber].connections.splice(gates[undoDragNumber].connections.length - 1, 1);
		gates[gateConnected].connected -= 1;

		gates[gateConnected].inputs[gatesInputNum] = false;						
		gates[gateConnected].run();

		drawWiresToScreen();

		undoList.splice(undoList.length - 1, 1);
	}
})

// Load saved layouts

function loadGatesAndAddGateToScene() {
	const urlParams = new URLSearchParams(window.location.search);
	const layoutData = urlParams.get('layout');

	if (layoutData == null) {
		return;
	}

	layoutData = layoutData.split("||")
}

loadGatesAndAddGateToScene();

// Clocks

function updateAllClocks() {
	for (var i = 0; i < gates.length; i++) {
		if (gates[i].name == "clock") {
			websiteAudio.switch();

			gates[i].data[0] = !gates[i].data[0];
				
			if (!gates[i].data[0]) {

				gates[i].element.style.background = "var(--whiteColour)";

				// Deactivate all the connected gates

				for (var z = 0; z < gates[i].connections.length; z++) {
					let itemID = gates[i].connections[z][0];

					gates[itemID].inputs[gates[i].connections[z][1]] = false;
					gates[itemID].run();
				}
				
			}
			else {

				gates[i].element.style.background = "linear-gradient(90deg, rgba(240,84,234,1) 0%, rgba(227,140,225,1) 50%, rgba(240,84,234,1) 100%)";

				// Activate all the connected gates

				for (var z = 0; z < gates[i].connections.length; z++) {
					let itemID = gates[i].connections[z][0];
			
					gates[itemID].inputs[gates[i].connections[z][1]] = true;
					gates[itemID].run();
				}
					
			}
		}
		
	}

	drawWiresToScreen();
}

let clockInterval = setInterval(updateAllClocks, 700);

// Save and load layouts

let saveToggle = false;

document.getElementById("save-drogic").addEventListener("click", e => {
	let saveString = "https://gamedev46.github.io/logic_gate_sim/" + "?code=";
	for (var i = 0; i < gates.length; i++) {
		tempConnects = "";
		
		for (var x = 0; x < gates[i].connections.length; x++) {
			tempConnects = tempConnects + gates[i].connections[x][0] + "__" + gates[i].connections[x][1] + "||";
		}
		
		saveString = saveString + gates[i].name + "," + gates[i].element.style.left + "," + gates[i].element.style.top + "," + gates[i].x + "," + gates[i].y + "," + tempConnects + "," + gates[i].connected + ",";
		
	}

	saveString = saveString.substring(0, saveString.length - 1);

	// Save comments

	saveString = saveString + "&textBox=";

	for (var i = 0; i < textBoxes.length; i++) {
		
		saveString = saveString + textBoxes[i].element.children[1].innerText + "," + textBoxes[i].element.style.left + "," + textBoxes[i].element.style.top + ",";
		
	}

	saveString = saveString.substring(0, saveString.length - 1);

	// Toggle saving box

	saveToggle = !saveToggle;

	if (saveToggle) {
		document.getElementById("save-drogic-url").style.transform = "translate(-50%, 50px) scale(1)";
	}
	else {
		document.getElementById("save-drogic-url").style.transform = "translate(-50%, 50px) scale(0)";
	}
	
	document.getElementById("save-drogic-url-display").value = saveString;
})

// Load gates

let urlParams = new URLSearchParams(window.location.search);
let gateCode = urlParams.get('code');
let textBoxCode = urlParams.get('textBox');

if (gateCode != null) {

	gateCode = gateCode.split(",");

	gates = [];
	
	for (var i = 0; i < gateCode.length; i += 7) {
		let connectionHolder = gateCode[i + 5];
		connectionHolder = connectionHolder.split("||");
		connectionHolder.pop();

		finalOutput = [];
		for (var x = 0; x < connectionHolder.length; x++) {
			smallArray = connectionHolder[x].split("__");
			finalOutput.push([Number(smallArray[0]), Number(smallArray[1])]);
		}
		
		loadInGates(gateCode[i], [gateCode[i + 1], gateCode[i + 2], gateCode[i + 3], gateCode[i + 4]], finalOutput, Number(gateCode[i + 6]));
	}

	drawWiresToScreen();

	gateCode = null;

	if (textBoxCode != "" && textBoxCode != null) {
		textBoxCode = textBoxCode.split(",");
	}
	else {
		textBoxCode = [];
	}
	
	textBoxes = [];

	for (var i = 0; i < textBoxCode.length; i += 3) {
		
		loadInComments(textBoxCode[i], [textBoxCode[i + 1], textBoxCode[i + 2]]);
		
	}
}

function loadInComments(dataText, textBoxPos) {
	// Add textbox

		let textBox = document.createElement("div");
		textBox.classList.add("textBox");

		let textBoxDrag = document.createElement("span");
		textBoxDrag.id = textBoxes.length + "text";

		let textBoxHolder = document.createElement("h2");
		textBoxHolder.innerText = dataText;
		textBoxHolder.contentEditable = true;

		textBox.style.left = textBoxPos[0];
		textBox.style.top = textBoxPos[1];

		textBox.appendChild(textBoxDrag);
		textBox.appendChild(textBoxHolder);
		
		document.body.appendChild(textBox);

		let textBoxObject = {
			element: textBox,
			dragging: false
		}

		textBoxes.push(textBoxObject);
		

		textBoxDrag.addEventListener("mousedown", e => {
			let textItem = textBoxes[Number(e.target.id.substring(0, e.target.id.length - 4))];

			textItem.dragging = true;

			websiteAudio.pickup();
		})

		textBoxDrag.addEventListener("mousemove", e => {
			let textItem = textBoxes[Number(e.target.id.substring(0, e.target.id.length - 4))];

			if (textItem.dragging) {
				textItem.element.style.left = (e.pageX - 15) + "px";
				textItem.element.style.top = (e.pageY - 15) + "px";
			}
		})

		textBoxDrag.addEventListener("mouseup", e => {
			let textItem = textBoxes[Number(e.target.id.substring(0, e.target.id.length - 4))];

			textItem.dragging = false;

			websiteAudio.drop();
		})

		// Mobile

		textBoxDrag.addEventListener("touchstart", e => {
			let textItem = textBoxes[Number(e.target.id.substring(0, e.touches[0].target.id.length - 4))];

			textItem.dragging = true;

			websiteAudio.pickup();
		})

		textBoxDrag.addEventListener("touchmove", e => {
			let textItem = textBoxes[Number(e.target.id.substring(0, e.touches[0].target.id.length - 4))];

			if (textItem.dragging) {
				textItem.element.style.left = (e.touches[0].pageX - 10) + "px";
				textItem.element.style.top = (e.touches[0].pageY - 10) + "px";
			}
		})

		textBoxDrag.addEventListener("touchend", e => {
			let textItem = textBoxes[Number(e.target.id.substring(0, e.changedTouches[0].target.id.length - 4))];

			textItem.dragging = false;

			websiteAudio.drop();
		})
}

function loadInGates(gateName, gatePositions, gateConnections, gateConnected) {
	
	let newGateHolder = document.createElement("div");
	newGateHolder.classList.add("logic-gate");
	
	let newGate = document.createElement("div");
	newGate.id = gates.length;

	let newGateH2 = document.createElement("h2");
	newGateH2.innerText = gateName;

	let newGateImage = document.createElement("img");
	newGateImage.src = "images/" + gateName + ".svg";
	
	//if (gateSelect.value == "buffer") newGateImage.src = "images/" + gateSelect.value + ".png";
	newGateImage.alt = gateName + " gate";
	newGateImage.onerror = function() {
		this.style.opacity = 0;
		this.style.height = "27px";
	}

	let newGateDrag = document.createElement("span");
	newGateDrag.id = gates.length + "drag";

	newGateDrag.addEventListener("mousedown", e => {
		draggingNumber = Number(e.target.id.substring(0, e.target.id.length - 4));

		showAndHideDropAreas(true);

		websiteAudio.connectDrag();
	})

	newGateDrag.addEventListener("touchstart", e => {
		draggingNumber = Number(e.touches[0].target.id.substring(0, e.touches[0].target.id.length - 4));

		showAndHideDropAreas(true);

		websiteAudio.connectDrag();
	})

	newGate.appendChild(newGateImage);
	newGate.appendChild(newGateH2);
	newGateHolder.appendChild(newGate)
	newGateHolder.appendChild(newGateDrag);
	document.getElementById("logic-gate-holder").appendChild(newGateHolder);

	newGate.addEventListener("mouseup", e => {
		touchAndMouseConnectGates(newGate);
		showAndHideDropAreas(false);
	})

	let gateObject = {
		name: gateName,
		element: newGate,
		connections: gateConnections,
		connected: gateConnected,
		dragged: false,
		inputs: [false, false, false],
		data: [false, false, 0],
		x: gatePositions[2],
		y: gatePositions[3],
		runConnections: function(offOrOn) {
			// Activate or deactivate all the connected gates

			this.data[1] = offOrOn;

			for (var i = 0; i < this.connections.length; i++) {
				let itemID = this.connections[i][0];

				gates[itemID].inputs[this.connections[i][1]] = offOrOn;						
				gates[itemID].run();
			}
		},
		run: function() {

			if (this.name == "input") {
				return false;
			}
			else if (this.name == "output") {
				let foundOn = false;
				
				for (var i = 0; i < this.inputs.length; i++) {
					if (this.inputs[i] == true) {
						foundOn = true;
					}
				}

				if (foundOn) {
					this.element.style.background = "linear-gradient(45deg, rgba(205,205,98,1) 0%, rgba(232,255,125,1) 51%, rgba(205,205,98,1) 100%)";
					this.element.style.boxShadow = "0 0 20px rgba(245, 245, 120, 0.7)";

					this.runConnections(true);
				}
				else {
					this.element.style.background = "var(--whiteColour)";		
					this.element.style.boxShadow = "none";

					this.runConnections(false);
				}
			}
			else if (this.name == "toggle") {
				this.data[2] += 1;

				if (this.data[2] == 1 || this.data[2] == 3) {
					if (!this.inputs[0]) {
						this.data[2] -= 1;
					}
				}

				if (this.data[2] == 1) {
					this.runConnections(true);

					this.data[0] = true;
					this.element.style.background = "rgb(255, 160, 130)";
				}
				else if (this.data[2] == 3) {
					this.runConnections(false);

					this.data[0] = false;					
					this.element.style.background = "var(--whiteColour)";
				}

				if (this.data[2] > 3) {
					this.data[2] = 0;
				}
			}
			else if (this.name == "buffer") {
				if (this.inputs[0]) {
					this.runConnections(true);
				}
				else {
					this.runConnections(false);
				}
			}
			else if (this.name == "and") {
				if (this.inputs[0] && this.inputs[1]) {
					this.runConnections(true);
				}
				else {
					this.runConnections(false);
				}
			}
			else if (this.name == "nand") {
				let holder = this.inputs[0] && this.inputs[1];
				if (!holder) {
					this.runConnections(true);
				}
				else {
					this.runConnections(false);
				}
			}
			else if (this.name == "not") {
				if (this.inputs[0]) {
					this.runConnections(false);
				}
				else {
					this.runConnections(true);
				}
			}
			else if (this.name == "or") {
				if (this.inputs[0] || this.inputs[1]) {
					this.runConnections(true);
				}
				else {
					this.runConnections(false);
				}
			}
			else if (this.name == "nor") {
				if (!this.inputs[0] && !this.inputs[1]) {
					this.runConnections(true);
				}
				else {
					this.runConnections(false);
				}
			}
			else if (this.name == "xor") {
				if (this.inputs[0] || this.inputs[1]) {
					if (this.inputs[0] != this.inputs[1]) {
						this.runConnections(true);
					}
					else {
						this.runConnections(false);
					}
				}
				else {
					this.runConnections(false);
				}
			}
			else if (this.name == "adder") {
				
				let possible1LightBools = [!this.inputs[0] && this.inputs[1] && this.inputs[2], this.inputs[0] && !this.inputs[1] && this.inputs[2], this.inputs[0] && this.inputs[1] && !this.inputs[2], !this.inputs[0] && !this.inputs[1] && this.inputs[2], !this.inputs[0] && this.inputs[1] && !this.inputs[2], this.inputs[0] && !this.inputs[1] && !this.inputs[2]];

				this.runConnections(false);
				
				if (this.inputs[0] && this.inputs[1] && this.inputs[2]) {
					// Activate or deactivate all the connected gates

					for (var i = 0; i < this.connections.length; i++) {
						if (i < 2) {
							let itemID = this.connections[i][0];

							gates[itemID].inputs[this.connections[i][1]] = true;						
							gates[itemID].run();
						}
					}
				}
				else if (possible1LightBools[0] || possible1LightBools[1] || possible1LightBools[2]) {
					// deactivate or deactivate all the connected gates

					if (this.connections.length > 0) {
						let i = 1;
						let itemID = this.connections[i][0];

						gates[itemID].inputs[this.connections[i][1]] = true;						
						gates[itemID].run();
					}
				}
				else if (possible1LightBools[3] || possible1LightBools[4] || possible1LightBools[5]) {
					// deactivate or deactivate all the connected gates

					if (this.connections.length > 0) {
						let i = 0;
						let itemID = this.connections[i][0];

						gates[itemID].inputs[this.connections[i][1]] = true;						
						gates[itemID].run();
					}
				}
				else if (!this.inputs[0] && !this.inputs[1] && !this.inputs[2]) {
					// deactivate or deactivate all the connected gates

					for (var i = 0; i < this.connections.length; i++) {
						if (i < 2) {
							let itemID = this.connections[i][0];

							gates[itemID].inputs[this.connections[i][1]] = false;						
							gates[itemID].run();
						}
					}
				}
				
			}
			else if (this.name == "clock") {
				return false;
			}
			
		}
	}

	gates.push(gateObject);

	newGate.style.left = gatePositions[0];
	newGate.style.top = gatePositions[1];

	newGateDrag.style.left = (Number(gatePositions[0].substring(0, gatePositions[0].length - 2)) + 45) + "px";
	newGateDrag.style.top = (Number(gatePositions[1].substring(0, gatePositions[0].length - 2)) + 30) + "px";

		// Event listeners

	newGate.addEventListener("touchstart", e => {
		gates[Number(e.target.id)].dragged = true;

		websiteAudio.pickup();

		// Send gate to front
		//e.touches[0].target.style.zIndex = "50";
	});

	newGate.addEventListener("mousedown", e => {
		if (e.button == 0) {
			gates[Number(e.target.id)].dragged = true;

			websiteAudio.pickup();

			// Send gate to front
			//e.target.style.zIndex = "50";
		}
	});

	newGate.addEventListener("mousemove", e => {
		if (gates[Number(e.target.id)].dragged) {
			e.target.style.left = (e.pageX - 25) + "px";
			e.target.style.top = (e.pageY - 25) + "px";

			document.getElementById(e.target.id + "drag").style.left = (e.pageX + 20) + "px";
			document.getElementById(e.target.id + "drag").style.top = (e.pageY + 5) + "px";

			drawWiresToScreen();
		}
	});
	
	newGate.addEventListener("mouseup", e => {
		userLiftUp(e);
		drawWiresToScreen();

		showAndHideDropAreas(false);
	});

	newGate.addEventListener("touchmove", e => {
		if (gates[Number(e.target.id)].dragged) {
			e.target.style.left = (e.touches[0].pageX - 25) + "px";
			e.target.style.top = (e.touches[0].pageY - 25) + "px";

			document.getElementById(e.touches[0].target.id + "drag").style.left = (e.touches[0].pageX + 20) + "px";
			document.getElementById(e.touches[0].target.id + "drag").style.top = (e.touches[0].pageY + 5) + "px";

			drawWiresToScreen();
		}
	});

	newGate.addEventListener("touchend", e => {
		gates[Number(e.changedTouches[0].target.id)].x = -100;
		userLiftUp(e.changedTouches[0]);
		drawWiresToScreen();
		
		showAndHideDropAreas(false);
		touchAndMouseConnectGates(newGate);
	});
}
