// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_GlobalRotateMatrix;\n' +
    'void main() {\n' +
    ' gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

  const POINT = 0;
  const TRIANGLE = 1;
  const CIRCLE = 2;

  let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
  let g_selectedSize = 5
  let g_selectedType = POINT;
  let g_selectedSegmentCount = 10;
  let g_globalAngle = 180;
  let g_yellowAngle = 0;
  let g_rightWingAngle = 30;
  let g_leftWingAngle = -30;
  let animationOn = false;
  let g_rightLegAngle = 30;
  let g_leftLegAngle = 30;
  let g_headAngle = 0;
  
  
  function addActionsForHtmlUI() {
    // Clear Canvas Button
    document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderScene();});

    document.getElementById('rightWingRange').addEventListener('mousemove', function() { 
      g_rightWingAngle = this.value; 
      renderScene();
    });

    document.getElementById('leftWingRange').addEventListener('mousemove', function() { 
      g_leftWingAngle = this.value; 
      renderScene();
    });

    document.getElementById('toggleAnimationButton').addEventListener('click', function () {
      animationOn = !animationOn; 
      if (animationOn) {
          console.log("Animation started");
      } else {
          console.log("Animation paused");
      }
    });

    document.getElementById('rightLegRange').addEventListener('mousemove', function() { 
      g_rightLegAngle = this.value; 
      renderScene();
    });
    
    document.getElementById('leftLegRange').addEventListener('mousemove', function() { 
        g_leftLegAngle = this.value; 
        renderScene();
    });

    document.getElementById('headAngleRange').addEventListener('input', function() { 
      g_headAngle = this.value; 
      renderScene();
  });
  }

let isPoked = false;
let pokeStartTime = 0;



 function updateAnimationAngles() {

    if (isPoked) {
      const elapsedTime = performance.now() - pokeStartTime;
      const pokeFactor = Math.sin(elapsedTime * 0.01); // Faster oscillation

      g_headAngle = pokeFactor * 20; // Head nods up and down

      if (elapsedTime > 3000){ // Poke effect lasts 1 second
          isPoked = false;
          g_headAngle = 0; // Reset head position
      }
    }
    if (animationOn) {

        const oscillationFactor = Math.sin(performance.now() * 0.005); 

        // Right arm oscillates between 30 and 60 degrees
        g_rightWingAngle = 45 + oscillationFactor * 15; 

        // Left arm oscillates between -30 and -60 degrees
        g_leftWingAngle = -45 + oscillationFactor * -15; // -45 ± 15 degrees

        g_rightLegAngle = oscillationFactor * 15;  
        g_leftLegAngle = -oscillationFactor * 15; 
        
        g_headAngle = g_headAngle = oscillationFactor * 10; 
    }
}



  let canvas;
  let gl;
  let a_Position;
  let u_FragColor;
  let u_Size;
  let u_ModelMatrix;
  let u_GlobalRotateMatrix;
  let isDragging = false;
let lastX = 0, lastY = 0;
let g_globalAngleY = 0; // 

  function setupWebGL(){
    canvas = document.getElementById('webgl');

    canvas.addEventListener("click", function (event) {
      if (event.shiftKey) {
          isPoked = true;
          pokeStartTime = performance.now();
      }
    });

    canvas.addEventListener("mousedown", function (event) {
      isDragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
    });
    
    canvas.addEventListener("mousemove", function (event) {
      if (isDragging) {
        let deltaX = event.clientX - lastX;
        let deltaY = event.clientY - lastY;
    
        g_globalAngle += deltaX * 0.5;  // Horizontal rotation
        g_globalAngleY += deltaY * 0.5; // Vertical rotation
    
        lastX = event.clientX;
        lastY = event.clientY;
    
        renderScene();
      }
    });
    
    canvas.addEventListener("mouseup", function () {
      isDragging = false;
    });
    // Get the rendering context for WebGL
    // gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }

    gl.enable(gl.DEPTH_TEST);

  }


  function connectVariablesToGLSL(){
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }
 
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
 
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get u_ModelMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get u_GlobalRotateMatrix');
        return;
    }

    // u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    // if (!u_Size) {
    //     console.log('Failed to get the storage location of u_Size');
    //     return;
    // }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

 
 }






function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  





  // // Register function (event handler) to be called on a mouse press
  // canvas.onmousedown = click;
  // // canvas.onmousemove = click;

  // canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev)}};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  requestAnimationFrame(tick);
}


var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;


function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  console.log(g_seconds);
  // enableMouseRotation(canvas, angles);
  updateAnimationAngles();
  renderScene();
  requestAnimationFrame(tick);
}




function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);

}

function renderScene(){
  var startTime = performance.now();

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // --- BODY ---
  var body = new Cube();
  body.color = [1.0, 1.0, 0.0, 1.0]; // Yellow
  body.matrix.translate(-0.2, -0.3, 0.0);
  body.matrix.scale(0.4, 0.3, 0.3);
  body.drawCube();

  // --- HEAD ---
  var head = new Cube();
  head.color = [1.0, 1.0, 0.0, 1.0]; // Yellow
  head.matrix.translate(-0.08, 0.01, 0.1);
  head.matrix.rotate(g_headAngle, 0, 1, 0);
  head.matrix.scale(0.2, 0.2, 0.2);
  var headMat = new Matrix4(head.matrix); // Copy head matrix
  head.drawCube();

  // var head = new Cube();
  // head.color = [1.0, 0.8, 0.6, 1.0]; // Light color for head
  // head.matrix.translate(-0.1, 0.2, 0); // Position head
  // head.matrix.translate(0.1, 0.1, 0);  // Move pivot to center
  // head.matrix.rotate(g_headAngle, 0, 1, 0); // Rotate head around Y-axis
  // head.matrix.translate(-0.1, -0.1, 0); // Move back after rotation
  // head.matrix.scale(0.2, 0.2, 0.2); // Scale head size
  // var headMat = new Matrix4(head.matrix);
  // head.render();

  // --- BEAK ---
  var beak = new Cube();
  beak.matrix = new Matrix4(headMat); // Copy head matrix
  beak.color = [1.0, 0.5, 0.0, 1.0]; // Orange
  beak.matrix.translate(0.0, 0.25, 1.2);
  beak.matrix.scale(0.5, 0.25, 0.5);
  beak.drawCube();

  // --- LEFT EYE ---
  var leftEye = new Cube();
  leftEye.matrix = new Matrix4(headMat); // Copy head matrix
  leftEye.color = [0.0, 0.0, 0.0, 1.0]; // Black
  leftEye.matrix.translate(0.6, 0.5, 0.9);
  leftEye.matrix.scale(0.25, 0.25, 0.25);
  leftEye.drawCube();

  // --- RIGHT EYE ---
  var rightEye = new Cube();
  rightEye.matrix = new Matrix4(headMat); // Copy head matrix
  rightEye.color = [0.0, 0.0, 0.0, 1.0]; // Black
  rightEye.matrix.translate(0.0, 0.5, 0.9);
  rightEye.matrix.scale(0.25, 0.25, 0.25);
  rightEye.drawCube();

  // --- LEFT WING (Angled Outward) ---
  var leftWing = new Cube();
  leftWing.color = [1.0, 1.0, 0.0, 1.0]; 
  leftWing.matrix.translate(-0.35, -0.32, 0.2); 
  leftWing.matrix.translate(0.25, 0.25, 0); 
  leftWing.matrix.rotate(g_leftWingAngle, 0, 0, 1); 
  leftWing.matrix.translate(-0.25, -0.25, 0); 
  leftWing.matrix.scale(0.12, 0.25, 0.1);
  leftWing.drawCube();

  // --- RIGHT WING (Angled Outward) ---
  var rightWing = new Cube();
  rightWing.color = [1.0, 1.0, 0.0, 1.0]; // Yellow
  rightWing.matrix.translate(0.2, -0.25, 0.2); 
  rightWing.matrix.translate(0, 0.25, 0); 
  rightWing.matrix.rotate(g_rightWingAngle, 0, 0, 1); 
  rightWing.matrix.translate(0, -0.25, 0); 
  rightWing.matrix.scale(0.12, 0.25, 0.1);
  rightWing.drawCube();


  // --- LEFT THIGH (Upper leg joint) ---
  var leftThigh = new Cube();
  leftThigh.color = [1.0, 0.5, 0.0, 1.0]; // Orange
  leftThigh.matrix.translate(-0.15, -0.35, 0.05);
  leftThigh.matrix.scale(0.1, 0.1, 0.1);
  leftThigh.drawCube();

  // --- RIGHT THIGH (Upper leg joint) ---
  var rightThigh = new Cube();
  rightThigh.color = [1.0, 0.5, 0.0, 1.0]; // Orange
  rightThigh.matrix.translate(0.05, -0.35, 0.05);
  rightThigh.matrix.scale(0.1, 0.1, 0.1);
  rightThigh.drawCube();

  // --- LEFT LEG (Lower leg) ---
  var leftLeg = new Cube();
  leftLeg.color = [1.0, 0.5, 0.0, 1.0]; // Orange
  leftLeg.matrix.translate(-0.145, -0.5, 0.07);
  leftLeg.matrix.translate(0.04, 0.08, 0); // Pivot at the top
  leftLeg.matrix.rotate(g_leftLegAngle, 1, 0, 0); // Rotate forward/backward
  leftLeg.matrix.translate(-0.04, -0.08, 0);
  leftLeg.matrix.scale(0.08, 0.15, 0.08);
  leftLeg.drawCube();

  // --- RIGHT LEG (Lower leg) ---
  var rightLeg = new Cube();
  rightLeg.color = [1.0, 0.5, 0.0, 1.0]; // Orange
  rightLeg.matrix.translate(0.055, -0.5, 0.07);
  rightLeg.matrix.translate(0.04, 0.08, 0); // Pivot at the top
  rightLeg.matrix.rotate(g_rightLegAngle, 1, 0, 0); // Rotate forward/backward
  rightLeg.matrix.translate(-0.04, -0.08, 0);
  rightLeg.matrix.scale(0.08, 0.15, 0.08);
  rightLeg.drawCube();

  var duration = performance.now() - startTime;
  sendTextToHTML(
    "numdot: " + Math.floor(duration) + "ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10,
    "numdot"
  );
}



function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }

  htmlElm.innerHTML = text;

}


var g_shapesList = [];

function click(ev) {

  let [x,y] = convertCoordinatesEventToGL(ev);
  let point;
  if (g_selectedType ==POINT){
    point = new Point();
  } else if (g_selectedType == TRIANGLE){
    point = new Triangle();
  } else{
    point = new Circle();
    point.segments = g_selectedSegmentCount;
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice()
  point.size = g_selectedSize;
  g_shapesList.push(point);


  // g_points.push([x, y]);
  // g_colors.push(g_selectedColor.slice())
  // g_sizes.push(g_selectedSize)
  // if (x >= 0.0 && y >= 0.0) {      
  //   g_colors.push([1.0, 0.0, 0.0, 1.0]);  
  // } else if (x < 0.0 && y < 0.0) { 
  //   g_colors.push([0.0, 1.0, 0.0, 1.0]); 
  // } else {                         
  //   g_colors.push([1.0, 1.0, 1.0, 1.0]);  
  // }

  renderScene();

}
