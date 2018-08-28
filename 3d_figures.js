var projectionMatrix;

var shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute,
    shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

var duration = 5000; // ms

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
var vertexShaderSource =
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
var fragmentShaderSource =
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas)
{
    var gl = null;
    var msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try
    {
        gl = canvas.getContext("experimental-webgl");
    }
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;
 }

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas) {
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 32, canvas.width / canvas.height, 1, 10000);
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -40]);
}

function createPyramid(gl, translation, rotationAxis) {
  // Vertex Data
  var vertexBuffer;
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  var v1 = [0.0, -1.5, -1.0];
  var v2 = [-.95, -1.5, -.31];
  var v3 = [-.59, -1.5, .81];
  var v4 = [.59, -1.5, .81];
  var v5 = [.95, -1.5, -.31];
  var v6 = [0.0, 1.0, 0.0];

  var verts = [
     //Base
     ...v1, ...v2, ...v3, ...v4, ...v5,

     //Face 1
     ...v1, ...v2, ...v6,

     //Face 2
     ...v2, ...v3, ...v6,

     //Face 3
     ...v3, ...v4, ...v6,
     //Face 4
     ...v4, ...v5, ...v6,

     //Face 5
     ...v5, ...v1, ...v6,
     ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  // Color data
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  var faceColors = [
      [1.0, 1.0, 0.0, 1.0],
      [0.0, 1.0, 1.0, 1.0],
      [1.0, 0.0, 0.0, 1.0],
      [0.0, 1.0, 0.0, 1.0],
      [1.0, 0.0, 1.0, 1.0],
      [0.0, 0.0, 1.0, 1.0],
  ];

  var vertexColors = [];

  // Assign color
  var vertices = [5, 3, 3, 3, 3, 3]

  var j = 0;
  for (const color of faceColors) {
    for (var k=0; k < vertices[j]; k++)
      vertexColors = vertexColors.concat(color);
    j++
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

  // Defines the triangles to be drawn
  var pyramidIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);
  var pyramidIndices = [
      0, 1, 2,    0, 2, 3,    0, 3, 4, //base
      5, 6, 7,
      8, 9, 10,
      11, 12, 13,
      14, 15, 16,
      17, 18, 19
  ];

  // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
  // Uint16Array: Array of 16-bit unsigned integers.
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);

  var pyramid = {
    buffer:vertexBuffer, colorBuffer:colorBuffer, indices:pyramidIndexBuffer,
    vertSize:3, nVerts:20, colorSize:4, nColors: 20, nIndices:24,
    primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};
  mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);


  pyramid.update = function() {
    var now = Date.now();
    var deltat = now - this.currentTime;
    this.currentTime = now;
    var fract = deltat / duration;
    var angle = Math.PI * 2 * fract;
    var goUp = false;
    mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
  };

  return pyramid;
}

function createOctahedron(gl, translation, rotationAxis, translationAxis, altTranslation) {
  // Vertex Data
  var vertexBuffer2;
  vertexBuffer2 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer2);

  var v1 = [0.0, -.75, 0.0];
  var v2 = [-.75, 0.0, 0.0];
  var v3 = [0.0, 0.0, .75];
  var v4 = [.75, 0.0, 0.0];
  var v5 = [0.0, 0.0, -.75];
  var v6 = [0.0, .75, 0.0];


  var verts = [
     //Face 1 Bottom
     ...v1, ...v2, ...v3,
     //Face 2 Bottom
     ...v1, ...v3, ...v4,
     //Face 3 Bottom
     ...v1, ...v4, ...v5,
     //Face 4 Bottom
     ...v1, ...v5, ...v2,

     //Face 1 Top
     ...v6, ...v2, ...v3,
     //Face 2 Top
     ...v6, ...v3, ...v4,
     //Face 3 Top
     ...v6, ...v4, ...v5,
     //Face 4 Top
     ...v6, ...v5, ...v2
     ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  // Color data
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  var faceColors = [
      [0.0, 0.0, 1.0, 1.0],
      [1.0, 1.0, 0.0, 1.0],
      [0.4, 0.6, 0.2, 1.0],
      [1.0, 0.0, 1.0, 1.0],
      [0.0, 1.0, 0.0, 1.0],
      [1.0, 0.0, 0.0, 1.0],
      [1.0, 0.6, 0.4, 1.0],
      [0.0, 1.0, 1.0, 1.0],
  ];

  var vertexColors = [];
  for (const color of faceColors)
    for (var j=0; j < 3; j++)
        vertexColors = vertexColors.concat(color);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

  // Defines the triangles to be drawn
  var octahedronIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octahedronIndexBuffer);
  var octahedronIndices = [
      0, 1, 2,
      3, 4, 5,
      6, 7, 8,
      9, 10, 11,
      12, 13, 14,
      15, 16, 17,
      18, 19, 20,
      21, 22, 23
  ];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octahedronIndices), gl.STATIC_DRAW);

  var octahedron = {
    buffer:vertexBuffer2, colorBuffer:colorBuffer, indices:octahedronIndexBuffer,
    vertSize:3, nVerts:24, colorSize:4, nColors: 24, nIndices:24,
    primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};
  mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, translation);

  var runtime = 0;
  var goUp = true;

  // Move shape up and down
  octahedron.update = function() {
    var now = Date.now();
    var deltat = now - this.currentTime;
    this.currentTime = now;
    var fract = deltat / duration;
    var angle = Math.PI * 2 * fract;

    //Determine direction of movement (up/down) every 4.5 seconds
    runtime += deltat;
    mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);

    if (goUp) {
      mat4.translate(this.modelViewMatrix, this.modelViewMatrix, translationAxis);
    } else {
      mat4.translate(this.modelViewMatrix, this.modelViewMatrix, altTranslation);
    }

    if(runtime >= 3000) {
      goUp = !goUp;
      runtime = 0;
    }
  };

  return octahedron;
}

function createScutoid(gl, translation, rotationAxis) {
  // Vertex Data
  let vertexBuffer;
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  let pentagonVerts = [
    [Math.cos((-126*Math.PI)/180), -2.0,  (-1*Math.sin((-126*Math.PI)/180))],
    [Math.cos((-54*Math.PI)/180), -2.0,  (-1*Math.sin((-54*Math.PI)/180))],
    [Math.cos((18*Math.PI)/180), -2.0,  (-1*Math.sin((18*Math.PI)/180))],
    [0.0, -2.0, -1.0], // 3
    [Math.cos((162*Math.PI)/180), -2.0,  (-1*Math.sin((162*Math.PI)/180))]
  ]
  let pointVertex = [0.0,  0.0,  -1.0];
  let hexagonVerts = [
    [Math.cos((-120*Math.PI)/180), 2.0,  (-1*Math.sin((-120*Math.PI)/180))],
    [Math.cos((-60*Math.PI)/180), 2.0,  (-1*Math.sin((-60*Math.PI)/180))],
    [Math.cos((0*Math.PI)/180), 2.0,  (-1*Math.sin((0*Math.PI)/180))],
    [Math.cos((60*Math.PI)/180), 2.0,  (-1*Math.sin((60*Math.PI)/180))],
    [Math.cos((120*Math.PI)/180), 2.0,  (-1*Math.sin((120*Math.PI)/180))],
    [Math.cos((180*Math.PI)/180), 2.0,  (-1*Math.sin((180*Math.PI)/180))]
  ]
  let verts = [];
  verts = verts.concat(pentagonVerts[0]); // 0
  verts = verts.concat(pentagonVerts[1]); // 1
  verts = verts.concat(pentagonVerts[2]); // 2
  verts = verts.concat(pentagonVerts[3]); // 3
  verts = verts.concat(pentagonVerts[4]); // 4

  verts = verts.concat(pentagonVerts[0]); // 5
  verts = verts.concat(pentagonVerts[1]); // 6
  verts = verts.concat(hexagonVerts[1]); // 7
  verts = verts.concat(hexagonVerts[0]); // 8

  verts = verts.concat(pentagonVerts[1]); // 9
  verts = verts.concat(pentagonVerts[2]); // 10
  verts = verts.concat(hexagonVerts[2]); // 11
  verts = verts.concat(hexagonVerts[1]); // 12

  verts = verts.concat(pentagonVerts[2]); // 13
  verts = verts.concat(pentagonVerts[3]); // 14
  verts = verts.concat(pointVertex); // 15
  verts = verts.concat(hexagonVerts[3]); // 16
  verts = verts.concat(hexagonVerts[2]); // 17

  verts = verts.concat(pointVertex); // 18
  verts = verts.concat(hexagonVerts[4]); // 19
  verts = verts.concat(hexagonVerts[3]); // 20


  verts = verts.concat(pentagonVerts[3]); // 21
  verts = verts.concat(pentagonVerts[4]); // 22
  verts = verts.concat(hexagonVerts[5]); // 23
  verts = verts.concat(hexagonVerts[4]); // 24
  verts = verts.concat(pointVertex); // 25

  verts = verts.concat(pentagonVerts[4]); // 26
  verts = verts.concat(pentagonVerts[0]); // 27
  verts = verts.concat(hexagonVerts[0]); // 28
  verts = verts.concat(hexagonVerts[5]); // 29

  verts = verts.concat(hexagonVerts[0]); // 30
  verts = verts.concat(hexagonVerts[1]); // 31
  verts = verts.concat(hexagonVerts[2]); // 32
  verts = verts.concat(hexagonVerts[3]); // 33
  verts = verts.concat(hexagonVerts[4]); // 34
  verts = verts.concat(hexagonVerts[5]); // 35

  console.log("verts",verts);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  // Colors
  let colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  let faceColors = [
      [1.0, 0.0, 0.0, 1.0], // Top Base
      [0.0, 1.0, 0.0, 1.0],
      [0.0, 0.0, 1.0, 1.0],
      [1.0, 1.0, 0.0, 1.0],
      [1.0, 0.0, 1.0, 1.0],
      [0.0, 1.0, 1.0, 1.0],
      [1.0, 0.5, 1.0, 1.0],
      [0.5, 0.0, 0.5, 1.0], // Bottom Base
  ];

  var vertexColors = [];
  for(let i = 0; i<5;i++) // Pentagon
  vertexColors = vertexColors.concat(faceColors[0]);
  for(let i = 0; i<4;i++)
  vertexColors = vertexColors.concat(faceColors[1]);
  for(let i = 0; i<4;i++)
  vertexColors = vertexColors.concat(faceColors[2]);
  for(let i = 0; i<5;i++)
  vertexColors = vertexColors.concat(faceColors[3]);
  for(let i = 0; i<3;i++)
  vertexColors = vertexColors.concat(faceColors[4]);
  for(let i = 0; i<5;i++)
  vertexColors = vertexColors.concat(faceColors[5]);
  for(let i = 0; i<4;i++)
  vertexColors = vertexColors.concat(faceColors[6]);
  for(let i = 0; i<6;i++) // Hexagon
  vertexColors = vertexColors.concat(faceColors[7]);

  console.log("vertexColors scutoid",vertexColors.length,verts.length);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

  // Index data (defines the triangles to be drawn).
  let scutoidIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, scutoidIndexBuffer);
  let scutoidIndices = [
      0, 1, 2,   0, 2, 4,   4, 2, 3,
      5, 6, 8,   6, 8, 7,
      9, 10, 11,   11, 12, 9,
      13, 16, 17,   13, 14, 16,  14,  15, 16,
      18, 19, 20,
      21, 24, 25,   21, 22, 24,   22, 23, 24,
      26, 27, 28,   26, 28, 29,
      30, 31, 32,   30, 32, 35,   32, 35, 33,   33, 34, 35
  ];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(scutoidIndices), gl.STATIC_DRAW);

  var scutoid = {
      buffer:vertexBuffer, colorBuffer:colorBuffer, indices:scutoidIndexBuffer,
      vertSize:3, nVerts:36, colorSize:4, nColors: 36, nIndices: scutoidIndices.length,
      primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};
  mat4.translate(scutoid.modelViewMatrix, scutoid.modelViewMatrix, translation);

  scutoid.update = function() {
    var now = Date.now();
    var deltat = now - this.currentTime;
    this.currentTime = now;
    var fract = deltat / duration;
    var angle = Math.PI * 2 * fract;

    mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
  };

  return scutoid;
}

function createShader(gl, str, type)
{
    var shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl)
{
    // load and compile the fragment and vertex shader
    var fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    var vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);

    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function draw(gl, objs)
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for(i = 0; i<objs.length; i++)
    {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function run(gl, objs)
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function() { run(gl, objs); });
    draw(gl, objs);

    for(i = 0; i<objs.length; i++)
        objs[i].update();
}
