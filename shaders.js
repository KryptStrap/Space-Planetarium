import {gl, startWebGL} from "./initWebGlContext.js";
import {positions} from "./initObjectsWebGLScene.js";

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

  const vertexShaderSource = document.querySelector("#vertexShader").text;
  const fragmentShaderSource = document.querySelector("#fragmentShader").text;

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

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

const program = createProgram(gl, vertexShader, fragmentShader);
const positionAttributeLocation = gl.getAttribLocation(program, "a_Position");
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

const mat4 = {
  translation: function(tx, ty, tz) {
    return [
      1.0, 0.0, 0.0, tx,
      0.0, 1.0, 0.0, ty,
      0.0, 0.0, 1.0, tz,
      0.0, 0.0, 0.0, 1.0
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
  }

}

function drawCube () {
  gl.useProgram(program);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Указываем атрибуту, как получать данные от positionBuffer (ARRAY_BUFFER)
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
  // 2 компоненты на итерацию
  // наши данные - 32-битные числа с плавающей точкой
  // не нормализовать данные
  // 0 = перемещаться на size * sizeof(type) каждую итерацию для получения следующего положения
  // начинать с начала буфера

  const u_ScaleMatrixLocation = gl.getUniformLocation(program, "u_ScaleMatrix");

  const u_RotationX_MatrixLocation = gl.getUniformLocation(program, "u_RotationX_Matrix");
  const u_RotationY_MatrixLocation = gl.getUniformLocation(program, "u_RotationY_Matrix");
  const u_RotationZ_MatrixLocation = gl.getUniformLocation(program, "u_RotationZ_Matrix");

  const u_TranslationMatrixLocation =  gl.getUniformLocation(program, "u_TranslationMatrix");

  gl.uniformMatrix4fv(u_ScaleMatrixLocation, false, mat4.scale(1.0, 1.0, 1.0));

  gl.uniformMatrix4fv(u_RotationX_MatrixLocation, false, mat4.rotationX(0.785));
  gl.uniformMatrix4fv(u_RotationY_MatrixLocation, false, mat4.rotationY(0.785));
  gl.uniformMatrix4fv(u_RotationZ_MatrixLocation, false, mat4.rotationZ(0.785));

  gl.uniformMatrix4fv(u_TranslationMatrixLocation, false, mat4.translation(0.0, 0.0, 0.0));

  gl.drawArrays(gl.TRIANGLES, 0, 36);
  // Рисовать примитив - треугольник
  // Смещение позиции буфера
  // Количество вершин в position
}

drawCube();
