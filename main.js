import { createWebGlContext, createShader, createProgram } from "./Engine/initWebGlContext.js";
import { frameRender, webGlCamera } from "./Engine/initWebGlObject.js";
import { spacePlanetObject} from "./SP_Source/initSPObject.js";

(async function main() {
    const gl = createWebGlContext();
    const vertexShader = await createShader(gl, gl.VERTEX_SHADER, "Engine/Shaders/standartVertexShader.vert");
    const fragmentShader = await createShader(gl, gl.FRAGMENT_SHADER, "Engine/Shaders/standartFragmentShader.frag");
    const program = createProgram(gl, vertexShader, fragmentShader);

    const camera = webGlCamera.create(gl, program);
    webGlCamera.setActiveCamera(camera);

    const sun0 = await spacePlanetObject.create(gl, program, "./Models/sun.obj", "./Textures/sun.jpg", 100);
    sun0.setAngularSpeedRotation(0.01, 0);

    const sun1 = await spacePlanetObject.create(gl, program, "./Models/sun.obj", "./Textures/sun.jpg", 25);
    sun1.setPareentPlanet(sun0, 1200);
    sun1.setAngularSpeedRotation(0.01, 0.01);

    const sun2 = await spacePlanetObject.create(gl, program, "./Models/sun.obj", "./Textures/sun.jpg", 25);
    sun2.setPareentPlanet(sun0, 2400);
    sun2.setAngularSpeedRotation(0.1, 0.005);

    const sun3 = await spacePlanetObject.create(gl, program, "./Models/sun.obj", "./Textures/sun.jpg", 15);
    sun3.setPareentPlanet(sun1, 200);
    sun3.setAngularSpeedRotation(0.1, 0.02);

    const sun4 = await spacePlanetObject.create(gl, program, "./Models/sun.obj", "./Textures/sun.jpg", 15);
    sun4.setPareentPlanet(sun1, 100);
    sun4.setAngularSpeedRotation(0.1, 0.004);

    requestAnimationFrame(timeNow => frameRender(gl, timeNow));
})()