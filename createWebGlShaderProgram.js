import {gl, startWebGL} from "./initWebGlContext.js";
import {positions, colors} from "./initObjectsWebGLScene.js";

let program;
let positionAttributeLocation;
let positionBuffer;
let colorsAttributeLocation;;
let colorsBuffer;

startWebGL(); // запуск функции создания контекста

function createShader(gl, type, source) {

  const shader = gl.createShader(type);   // создание шейдера
  gl.shaderSource(shader, source);      // устанавливаем шейдеру его программный код
  gl.compileShader(shader);             // компилируем шейдер
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {                        // если компиляция прошла успешно - возвращаем шейдер
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

const mat4 = {
  translation: function(tx, ty, tz) {
    return [
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      tx, ty, tz, 1.0
    ];
  },

  rotationX: function(angleX) {
    let c = Math.cos(angleX);
    let s = Math.sin(angleX);
    return [
      1.0, 0.0, 0.0, 0.0,
      0.0, c, s, 0.0,
      0.0, -s, c, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]
  },

  rotationY: function(angleY) {
    let c = Math.cos(angleY);
    let s = Math.sin(angleY);
    return [
      c, 0.0, -s, 0.0,
      0.0, 1.0, 0.0, 0.0,
      s, 0.0, c, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]
  },

  rotationZ: function(angleZ) {
    let c = Math.cos(angleZ);
    let s = Math.sin(angleZ);
    return [
      c, s, 0.0, 0.0,
      -s, c, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]
  },

  scale: function(sx, sy, sz) {
    return [
      sx, 0.0, 0.0, 0.0,
      0.0, sy, 0.0, 0.0,
      0.0, 0.0, sz, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]
  },

  /*perspective: function(fieldOfViewInRadians, aspect, near, far) {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
    const rangeInv = 1.0 / (near - far);
 
    return [
      f / aspect, 0.0, 0.0, 0.0,
      0.0, f, 0.0, 0.0,
      0.0, 0.0, (near + far) * rangeInv, 1.0,
      0.0, 0.0, near * far * rangeInv * 2, 0.0
    ];
  }*/

  perspective: function() {
    let aspect = gl.canvas.width / gl.canvas.height;
    return [
      1/aspect, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 1.0,
      0.0, 0.0, 0.0, 1.0
      ];
  }
}



let x_Rotating = 0;
let y_Rotating = 0;
let z_Rotating = 0;
let offset = 0.020;

function drawCube() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(program);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(colorsAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);

  gl.vertexAttribPointer(colorsAttributeLocation, 4, gl.FLOAT, false, 0, 0);

  const u_Scale_Matrix_Location = gl.getUniformLocation(program, "u_Scale_Matrix");

  const u_RotationX_Matrix_Location = gl.getUniformLocation(program, "u_RotationX_Matrix");
  const u_RotationY_Matrix_Location = gl.getUniformLocation(program, "u_RotationY_Matrix");
  const u_RotationZ_Matrix_Location = gl.getUniformLocation(program, "u_RotationZ_Matrix");


  const u_Translation_Matrix_Location =  gl.getUniformLocation(program, "u_Translation_Matrix");

  const u_Perspective_Matrix_Location = gl.getUniformLocation(program, "u_Perspective_Matrix");

  gl.uniformMatrix4fv(u_Scale_Matrix_Location, false, mat4.scale(1.0, 1.0, 1.0));

  gl.uniformMatrix4fv(u_RotationX_Matrix_Location, false, mat4.rotationX(x_Rotating));
  gl.uniformMatrix4fv(u_RotationY_Matrix_Location, false, mat4.rotationY(y_Rotating));
  gl.uniformMatrix4fv(u_RotationZ_Matrix_Location, false, mat4.rotationZ(z_Rotating));

  gl.uniformMatrix4fv(u_Translation_Matrix_Location, false, mat4.translation(0.0, 0.0, 0.5));

  gl.uniformMatrix4fv(u_Perspective_Matrix_Location, false, mat4.perspective());

  gl.drawArrays(gl.TRIANGLES, 0, 36);
  requestAnimationFrame(drawCube);
  x_Rotating += offset;
  y_Rotating += offset;
}

async function loadShader() {
  const vertexShaderSource = await fetch("default3dVertexShader.vert")
  .then(response => response.text())
  .then(response => response);
  const fragmentShaderSource = await fetch("default3dFragmentShader.frag")
  .then(response => response.text())
  .then(response => response);

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  program = createProgram(gl, vertexShader, fragmentShader);
  positionAttributeLocation = gl.getAttribLocation(program, "vertex_Position");
  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  colorsAttributeLocation = gl.getAttribLocation(program, "a_Colors");
  colorsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

  requestAnimationFrame(drawCube);
}

loadShader();