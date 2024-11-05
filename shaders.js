import {gl, startWebGL} from "./initWebGL.js";

startWebGL(); // запуск функции создания контекста

let positions = new Float32Array([
  -0.05, 0.5,
  -0.05, -0.5,
  0.05, -0.5,

  0.05, -0.5,
  -0.05, 0.5,
  0.05, 0.5,

  0.05, 0.5,
  0.5, 0.5,
  0.5, 0.40,

  0.5, 0.40,
  0.05, 0.40,
  0.05, 0.5,

  0.05, 0.05,
  0.3, 0.05,
  0.3, -0.05,

  0.3, -0.05,
  0.05, -0.05,
  0.05, 0.05
]);

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

const m3 = {
  translation: function(tx, ty) {
    return [
      1.0, 0.0, tx,
      0.0, 1.0, ty,
      0.0, 0.0, 1.0
    ];
  },

  rotation: function(angle) {
    return [
      Math.cos(angle), -Math.sin(angle), 0.0,
      Math.sin(angle), Math.cos(angle), 0.0,
      0.0, 0.0, 1.0
    ]
  },

  scale: function(sx, sy) {
    return [
      sx, 0.0, 0.0,
      0.0, sy, 0.0,
      0.0, 0.0, 1.0
    ]
  }

}

function drawF () {
  gl.useProgram(program);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Указываем атрибуту, как получать данные от positionBuffer (ARRAY_BUFFER)
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
  // 2 компоненты на итерацию
  // наши данные - 32-битные числа с плавающей точкой
  // не нормализовать данные
  // 0 = перемещаться на size * sizeof(type) каждую итерацию для получения следующего положения
  // начинать с начала буфера

  const u_ScaleMatrixLocation = gl.getUniformLocation(program, "u_ScaleMatrix");
  const u_RotationMatrixLocation = gl.getUniformLocation(program, "u_RotationMatrix");
  const u_TranslationMatrixLocation =  gl.getUniformLocation(program, "u_TranslationMatrix");

  gl.uniformMatrix3fv(u_ScaleMatrixLocation, false, m3.scale(2.0, 1.0));
  gl.uniformMatrix3fv(u_RotationMatrixLocation, false, m3.rotation(0.7));
  gl.uniformMatrix3fv(u_TranslationMatrixLocation, false, m3.translation(0.0, 0.0));

  gl.drawArrays(gl.TRIANGLES, 0, 18);
  // Рисовать примитив - треугольник
  // Смещение позиции буфера
  // Количество вершин в position
}

drawF();
