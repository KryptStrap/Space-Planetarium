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
  translation: function(translationArray) {
    return [
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      translationArray[0], translationArray[1], translationArray[2], 1.0
    ];
  },

  rotation: function(rotationArray) {
    const cX = Math.cos(rotationArray[0]);
    const sX = Math.sin(rotationArray[0]);

    const cY = Math.cos(rotationArray[1]);
    const sY = Math.sin(rotationArray[1]);

    const cZ = Math.cos(rotationArray[2]);
    const sZ = Math.sin(rotationArray[2]);

    const rotationX = [
      1.0, 0.0, 0.0, 0.0,
      0.0, cX, sX, 0.0,
      0.0, -sX, cX, 0.0,
      0.0, 0.0, 0.0, 1.0
    ];

    const rotationY = [
      cY, 0.0, -sY, 0.0,
      0.0, 1.0, 0.0, 0.0,
      sY, 0.0, cY, 0.0,
      0.0, 0.0, 0.0, 1.0
    ];

    const rotationZ = [
      cZ, sZ, 0.0, 0.0,
      -sZ, cZ, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ];

    return [rotationX, rotationY, rotationZ];
  
  },

  scale: function(scaleArray) {
    return [
      scaleArray[0], 0.0, 0.0, 0.0,
      0.0, scaleArray[1], 0.0, 0.0,
      0.0, 0.0, scaleArray[2], 0.0,
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

  object1 = new webglObjectScene(gl, program, positions, colors, "triangles");
  object2 = new webglObjectScene(gl, program, positions, colors, "triangles");
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
    console.log(1 / (timeNow - timeThen));
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

  #translationArray;
  #rotationMatrixArray;
  #scaleArray;

  #u_Scale_Matrix_Location;
  #u_Rotation_Matrix_Location;
  #u_Translation_Matrix_Location;
  #u_Perspective_Matrix_Location

  #primitives;

  constructor(gl, program, positions, colors, primitives) {
    this.#gl = gl;
    this.#program = program;
    switch(primitives) {
      case "triangles":
      this.#primitives = this.#gl.TRIANGLES;
      break;
      case "lines":
        this.#primitives = this.#gl.LINES;
        break;
      case "points":
        this.#primitives = this.#gl.POINTS;
    }

    this.#initBuffers(positions, colors);
  }

  #initBuffers(positions, colors) {
    this.#positionAttributeLocation = this.#gl.getAttribLocation(this.#program, "a_Position");
    this.#positionBuffer = this.#gl.createBuffer();
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#positionBuffer);
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(positions), this.#gl.STATIC_DRAW);

    this.#colorsAttributeLocation = this.#gl.getAttribLocation(this.#program, "a_Colors");
    this.#colorsBuffer = this.#gl.createBuffer();
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#colorsBuffer);
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(colors), this.#gl.STATIC_DRAW);

    this.#u_Scale_Matrix_Location = gl.getUniformLocation(program, "u_Scale_Matrix");

    this.#u_Rotation_Matrix_Location = gl.getUniformLocation(program, "u_Rotation_Matrix");

    this.#u_Translation_Matrix_Location =  gl.getUniformLocation(program, "u_Translation_Matrix");

    this.#u_Perspective_Matrix_Location = gl.getUniformLocation(program, "u_Perspective_Matrix");
  }

  setTranslation(translationArray) {
    this.#translationArray = mat4.translation(translationArray);
  }

  setRotation(rotationArray) {
    this.#rotationMatrixArray = mat4.rotation(rotationArray).flat();
  }

  setScale(scaleArray) {
    this.#scaleArray = mat4.scale(scaleArray);
  }

  drawObject() {
    this.#gl.useProgram(this.#program);
    this.#gl.enableVertexAttribArray(this.#positionAttributeLocation);
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#positionBuffer);
    this.#gl.vertexAttribPointer(this.#positionAttributeLocation, 3, this.#gl.FLOAT, false, 0, 0);
    this.#gl.enableVertexAttribArray(this.#colorsAttributeLocation);
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#colorsBuffer);
    this.#gl.vertexAttribPointer(this.#colorsAttributeLocation, 4, this.#gl.FLOAT, false, 0, 0);

    this.#gl.uniformMatrix4fv(this.#u_Scale_Matrix_Location, false, new Float32Array(this.#scaleArray));
    this.#gl.uniformMatrix4fv(this.#u_Rotation_Matrix_Location, false, new Float32Array(this.#rotationMatrixArray));

    this.#gl.uniformMatrix4fv(this.#u_Translation_Matrix_Location, false, new Float32Array(this.#translationArray));
    this.#gl.uniformMatrix4fv(this.#u_Perspective_Matrix_Location, false, mat4.perspective(45, this.#gl.canvas.width / this.#gl.canvas.height, 0.1, 2000));

    this.#gl.drawArrays(this.#primitives, 0, positions.length / 3);
  }
}
