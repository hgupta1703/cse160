// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_Size;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_Size;\n' +
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

  function addActionsForHtmlUI() {
    // Clear Canvas Button
    document.getElementById('clearCanvas').onclick = function () {
      g_shapesList=[];
      renderAllShapes();
    };

    document.getElementById("createTree").onclick = createTree;
  
    // Drawing Mode Buttons
    document.getElementById('pointMode').onclick = function () {
      g_selectedType = POINT;
    };
    document.getElementById('triangleMode').onclick = function () {
      g_selectedType = TRIANGLE;
    };
    document.getElementById('circleMode').onclick = function () {
      g_selectedType = CIRCLE;
    };

    document.getElementById('redRange').addEventListener('mouseup', function () {
      g_selectedColor[0] = this.value / 100; 
    });
  
    document.getElementById('greenRange').addEventListener('mouseup', function () {
      g_selectedColor[1] = this.value / 100; 
    });
  
    document.getElementById('blueRange').addEventListener('mouseup', function () {
      g_selectedColor[2] = this.value / 100; 
    });

    document.getElementById('sizeRange').addEventListener('mouseup', function () {
      g_selectedSize = this.value;
    });
  
    document.getElementById('segmentRange').addEventListener('mouseup', function () {
      g_selectedSegmentCount = this.value; 
    });
  }

  let canvas;
  let gl;
  let a_Position;
  let u_FragColor;
  let u_Size;

  function setupWebGL(){
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    // gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }

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

    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }

 
 }

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI()



  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  // canvas.onmousemove = click;

  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev)}};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}


function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);

}

function renderAllShapes(){

  var startTime = performance.now()

  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();

  }

  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + "ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

}

function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }

  htmlElm.innerHTML = text;

}

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = [];


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

  renderAllShapes();

}

function createTree() {
  const baseColor = [0.13, 0.55, 0.13, 1.0]; // Green color for the tree
  const trunkColor = [0.54, 0.27, 0.07, 1.0]; // Brown color for the trunk

  // Create the trunk (multiple stacked triangles for thickness)
  for (let i = 0; i < 3; i++) {
    let trunk = new Triangle();
    trunk.position = [0.0, -0.9 + i * 0.05]; // Adjust the position to stack
    trunk.color = trunkColor.slice();
    trunk.size = 10; // Smaller size for the trunk
    g_shapesList.push(trunk);
  }

  // Create tree foliage
  const layers = 10; // Number of layers of triangles for the tree
  for (let i = 0; i < layers; i++) {
    let layerCount = layers - i; // Decrease the number of triangles per layer
    for (let j = 0; j < layerCount; j++) {
      let triangle = new Triangle();
      triangle.position = [
        -0.1 * (layerCount / 2) + j * 0.1, // Spread triangles horizontally
        -0.6 + i * 0.1,                   // Stack layers vertically
      ];
      triangle.color = [
        baseColor[0] * (0.8 + Math.random() * 0.2),
        baseColor[1] * (0.8 + Math.random() * 0.2),
        baseColor[2] * (0.8 + Math.random() * 0.2),
        1.0,
      ];
      triangle.size = 20 - i; // Decrease size for higher layers
      g_shapesList.push(triangle);
    }
  }

  renderAllShapes();
}
