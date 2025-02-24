import { createWebGlContext, createShader, createProgram } from "./Engine/initWebGlContext.js";
import { camera, frameRender } from "./Engine/initWebGlObject.js";
import { createSpacePlanetObject } from "./SP_Source/initSPObject.js";

(async function main() {
    const gl = createWebGlContext();
    const vertexShader = await createShader(gl, gl.VERTEX_SHADER, "Engine/Shaders/standartVertexShader.vert");
    const fragmentShader = await createShader(gl, gl.FRAGMENT_SHADER, "Engine/Shaders/standartFragmentShader.frag");
    const program = createProgram(gl, vertexShader, fragmentShader);

    camera.create(gl, program, [0.0, 4000.0, 0.0], [-3.14, 0.0, 0.0]);

    const sun0 = await createSpacePlanetObject(gl, program, "./Models/sun.obj", "./Textures/sun.jpg", 100);

    const sun1 = await createSpacePlanetObject(gl, program, "./Models/sun.obj", "./Textures/sun.jpg", 25);
    sun1.setPareentPlanet(sun0, 1200);

    const sun2 = await createSpacePlanetObject(gl, program, "./Models/sun.obj", "./Textures/sun.jpg", 25);
    sun2.setPareentPlanet(sun0, 2400);

    const sun3 = await createSpacePlanetObject(gl, program, "./Models/sun.obj", "./Textures/sun.jpg", 15);
    sun3.setPareentPlanet(sun1, 200);

    const sun4 = await createSpacePlanetObject(gl, program, "./Models/sun.obj", "./Textures/sun.jpg", 15);
    sun4.setPareentPlanet(sun1, 100);

    requestAnimationFrame(timeNow => frameRender(gl, timeNow, [
        sun0,
        sun1,
        sun2,
        sun3,
        sun4
    ]));
})()