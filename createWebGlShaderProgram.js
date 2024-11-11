import {gl, startWebGL} from "./initWebGlContext.js";
import {positions, colors} from "./initObjectsWebGLScene.js";

let program;

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

  rotationX: function(angleDeg) {
    const angleRadian = angleDeg * Math.PI / 180;
    const c = Math.cos(angleRadian);
    const s = Math.sin(angleRadian);
    return [
      1.0, 0.0, 0.0, 0.0,
      0.0, c, s, 0.0,
      0.0, -s, c, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]
  },

  rotationY: function(angleDeg) {
    const angleRadian = angleDeg * Math.PI / 180;
    const c = Math.cos(angleRadian);
    const s = Math.sin(angleRadian);
    return [
      c, 0.0, -s, 0.0,
      0.0, 1.0, 0.0, 0.0,
      s, 0.0, c, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]
  },

  rotationZ: function(angleDeg) {
    const angleRadian = angleDeg * Math.PI / 180;
    const c = Math.cos(angleRadian);
    const s = Math.sin(angleRadian);
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

  perspective: function(fieldOfView, aspect, near, far) {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfView * Math.PI / 180);
    const rangeInv = 1.0 / (near - far);
    return [
      f / aspect, 0.0, 0.0, 0.0,
      0.0, f, 0.0, 0.0,
      0.0, 0.0, (near + far) * rangeInv, -1.0,
      0.0, 0.0, near * far * rangeInv * 2, 0.0
    ];
  }
}

let timeThen = 0;

let object1;
let object2;

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

  object1 = new webglObjectScene(gl, program, positions, colors);
  object2 = new webglObjectScene(gl, program, positions, colors);
  function drawCube(timeNow) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    object1.setTranslation([-1.0, 0.0, -3.0]);
    object1.setRotation([45, 45, 0]);
    object1.setScale([1.0, 1.0, 1.0]);
    object1.drawObject();

    object2.setTranslation([1.0, 0.0, -3.0]);
    object2.setRotation([45, 45, 0]);
    object2.setScale([1.0, 1.0, 1.0]);
    object2.drawObject();

    timeNow *= 0.001;
    //console.log(1 / (timeNow - timeThen));
    timeThen = timeNow;

    requestAnimationFrame(drawCube)
  }
  requestAnimationFrame(drawCube)
}

startWebGL(); // запуск функции создания контекста
loadShader(); // Загрузка шейдеров

class webglObjectScene {
  #gl;
  #program;
  #positionAttributeLocation;
  #positionBuffer;
  #colorsAttributeLocation;
  #colorsBuffer;

  #u_Scale_Matrix_Location;
  #u_RotationX_Matrix_Location;
  #u_RotationY_Matrix_Location;
  #u_RotationZ_Matrix_Location;
  #u_Translation_Matrix_Location;
  #u_Perspective_Matrix_Location

  #xTranslate;
  #yTranslate;
  #zTranslate;

  #xRotate;
  #yRotate;
  #zRotate;

  #xScale;
  #yScale;
  #zScale;

  constructor(gl, program, positions, colors) {
    this.#gl = gl;
    this.#program = program;

    this.#initBuffers(positions, colors);
  }

  #initBuffers(positions, colors) {
    this.#positionAttributeLocation = this.#gl.getAttribLocation(this.#program, "a_Position");
    this.#positionBuffer = this.#gl.createBuffer();
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#positionBuffer);
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, positions, this.#gl.STATIC_DRAW);

    this.#colorsAttributeLocation = this.#gl.getAttribLocation(this.#program, "a_Colors");
    this.#colorsBuffer = this.#gl.createBuffer();
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#colorsBuffer);
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, colors, this.#gl.STATIC_DRAW);

    this.#u_Scale_Matrix_Location = gl.getUniformLocation(program, "u_Scale_Matrix");

    this.#u_RotationX_Matrix_Location = gl.getUniformLocation(program, "u_RotationX_Matrix");
    this.#u_RotationY_Matrix_Location = gl.getUniformLocation(program, "u_RotationY_Matrix");
    this.#u_RotationZ_Matrix_Location = gl.getUniformLocation(program, "u_RotationZ_Matrix");

    this.#u_Translation_Matrix_Location =  gl.getUniformLocation(program, "u_Translation_Matrix");

    this.#u_Perspective_Matrix_Location = gl.getUniformLocation(program, "u_Perspective_Matrix");
  }

  setTranslation(arrayTranslate) {
    this.#xTranslate = arrayTranslate[0];
    this.#yTranslate = arrayTranslate[1];
    this.#zTranslate = arrayTranslate[2];
  }

  setRotation(arrayRotate) {
    this.#xRotate = arrayRotate[0];
    this.#yRotate = arrayRotate[1];
    this.#zRotate = arrayRotate[2];
  }

  setScale(arrayScale) {
    this.#xScale = arrayScale[0];
    this.#yScale = arrayScale[1];
    this.#zScale = arrayScale[2];
  }

  drawObject() {
    this.#gl.useProgram(this.#program);
    this.#gl.enableVertexAttribArray(this.#positionAttributeLocation);
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#positionBuffer);
    this.#gl.vertexAttribPointer(this.#positionAttributeLocation, 3, this.#gl.FLOAT, false, 0, 0);
    this.#gl.enableVertexAttribArray(this.#colorsAttributeLocation);
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#colorsBuffer);
    this.#gl.vertexAttribPointer(this.#colorsAttributeLocation, 4, this.#gl.FLOAT, false, 0, 0);

    this.#gl.uniformMatrix4fv(this.#u_Scale_Matrix_Location, false, mat4.scale(this.#xScale, this.#yScale, this.#zScale));
    this.#gl.uniformMatrix4fv(this.#u_RotationX_Matrix_Location, false, mat4.rotationX(this.#xRotate));
    this.#gl.uniformMatrix4fv(this.#u_RotationY_Matrix_Location, false, mat4.rotationY(this.#yRotate));
    this.#gl.uniformMatrix4fv(this.#u_RotationZ_Matrix_Location, false, mat4.rotationZ(this.#zRotate));

    this.#gl.uniformMatrix4fv(this.#u_Translation_Matrix_Location, false, mat4.translation(this.#xTranslate, this.#yTranslate, this.#zTranslate));
    this.#gl.uniformMatrix4fv(this.#u_Perspective_Matrix_Location, false, mat4.perspective(45, gl.canvas.width / gl.canvas.height, 0.1, 2000));

    this.#gl.drawArrays(this.#gl.TRIANGLES, 0, 36)
  }
}