export let gl; // глобальная переменная для контекста WebGL

function initWebGL(canvas) {
  gl = null;

  try {
    // Попытаться получить стандартный контекст. Если не получится, попробовать получить экспериментальный.
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  } catch (error) {}

  // Если мы не получили контекст GL, завершить работу
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    gl = null;
  }

  return gl;
}

export function startWebGL() {

  const canvas = document.getElementById("glcanvas");

  gl = initWebGL(canvas); // инициализация контекста GL
  console.log(gl.getParameter(gl.VENDOR));
  console.log(gl.getParameter(gl.VERSION));
  console.log(gl.getParameter(gl.RENDERER));

  // продолжать только если WebGL доступен и работает

  if (gl) {
    gl.canvas.width = gl.canvas.clientWidth;
    gl.canvas.height = gl.canvas.clientHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // установить в качестве цвета очистки буфера цвета чёрный, полная непрозрачность
    gl.enable(gl.DEPTH_TEST); // включает использование буфера глубины
    gl.depthFunc(gl.LEQUAL); // определяет работу буфера глубины: более ближние объекты перекрывают дальние
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // очистить буфер цвета и буфер глубины.

    window.addEventListener("resize", () => {
      gl.canvas.width = gl.canvas.clientWidth;
      gl.canvas.height = gl.canvas.clientHeight;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    })

    document.getElementById("fullscreen-button").addEventListener("click", () => {
      gl.canvas.requestFullscreen();
    })
    document.addEventListener("keydown", (event) => {
      if(event.code === "KeyF");
        gl.canvas.requestFullscreen();
    })
  }
}
