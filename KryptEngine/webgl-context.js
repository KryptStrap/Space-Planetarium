import { fileReader } from "./file-loader.js";

export const initContext = canvas => {
  let gl = null;
  
  try {
    gl = canvas.getContext("webgl2");
  } catch (error) {}

  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    gl = null;
  }

  return gl;
}

export const initGL = () => {
  const canvas = document.querySelector("canvas");

  const gl = initContext(canvas);

  console.log(gl.getParameter(gl.RENDERER));
  console.log(gl.getParameter(gl.VENDOR));
  console.log(gl.getParameter(gl.VERSION));

  gl.canvas.width = gl.canvas.clientWidth;
  gl.canvas.height = gl.canvas.clientHeight;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.0, 0.0, 0.2, 1.0); // установить в качестве цвета очистки буфера цвета чёрный, полная непрозрачность
  gl.enable(gl.DEPTH_TEST); // включает использование буфера глубины
  gl.depthFunc(gl.LEQUAL); // определяет работу буфера глубины: более ближние объекты перекрывают дальние
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // очистить буфер цвета и буфер глубины.

  return gl;
}

export const createShader = async (gl, type, shaderSource) => {

  const shader = gl.createShader(type);   // создание шейдера
  const shaderData = await fileReader(shaderSource);
  
  gl.shaderSource(shader, shaderData);      // устанавливаем шейдеру его программный код
  gl.compileShader(shader);             // компилируем шейдер

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {                        // если компиляция прошла успешно - возвращаем шейдер
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

export const createProgram = (gl, vertexShader, fragmentShader) => {

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