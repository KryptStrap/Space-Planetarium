function initWebGL(canvas) {
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

export function createWebGlContext() {

  const canvas = document.getElementById("glcanvas");

  const gl = initWebGL(canvas);
  console.log(gl.getParameter(gl.VENDOR));
  console.log(gl.getParameter(gl.VERSION));
  console.log(gl.getParameter(gl.RENDERER));

  if (gl) {
    gl.canvas.width = gl.canvas.clientWidth;
    gl.canvas.height = gl.canvas.clientHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.25, 0.25, 0.25, 1.0); // установить в качестве цвета очистки буфера цвета чёрный, полная непрозрачность
    gl.enable(gl.DEPTH_TEST); // включает использование буфера глубины
    gl.depthFunc(gl.LEQUAL); // определяет работу буфера глубины: более ближние объекты перекрывают дальние
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // очистить буфер цвета и буфер глубины.

    document.getElementById("fullscreen-button").addEventListener("click", () => {
      document.body.requestFullscreen();
    });
  }

  return gl;
}

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

export async function loadShaderProgram(gl, vertexShaderFile, fragmentShaderFile) {
  const vertexShaderSource = await fetch(vertexShaderFile)
  .then(response => response.text())
  .then(response => response);
  const fragmentShaderSource = await fetch(fragmentShaderFile)
  .then(response => response.text())
  .then(response => response);

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  return createProgram(gl, vertexShader, fragmentShader);
}