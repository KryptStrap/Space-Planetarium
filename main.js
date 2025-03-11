import { createWebGlContext, createShader, createProgram } from "./Engine/initWebGlContext.js";
import { frameRender, webGlCamera, webGlObject } from "./Engine/initWebGlObject.js";
import { spacePlanetObject } from "./SP_Source/initSPObject.js";

(async function main() {
    const gl = createWebGlContext();
    const standartVertexShader = await createShader(gl, gl.VERTEX_SHADER, "Engine/Shaders/standartVertexShader.vert");
    const skyboxVertexShader = await createShader(gl, gl.VERTEX_SHADER, "Engine/Shaders/skyboxVertexShader.vert");

    const standartFragmentShader = await createShader(gl, gl.FRAGMENT_SHADER, "Engine/Shaders/standartFragmentShader.frag");
    const skyboxFragmentShader = await createShader(gl, gl.FRAGMENT_SHADER, "Engine/Shaders/skyboxFragmentShader.frag");

    const standartProgram = createProgram(gl, standartVertexShader, standartFragmentShader);
    const skyboxProgram = createProgram(gl, skyboxVertexShader, skyboxFragmentShader);

    const camera = webGlCamera.create(gl, standartProgram, skyboxProgram, 8000);
    webGlCamera.setActiveCamera(camera);

    const skybox = await webGlObject.create(gl, skyboxProgram, "./Models/skybox.obj", "./Textures/skybox.png");
    skybox.setScale([4000, 4000, 4000]);

    const sun0 = await spacePlanetObject.create(gl, standartProgram, "./Models/sun.obj", "./Textures/sun.jpg");
    sun0.setScale([100, 100, 100]);
    sun0.setAngularSpeedRotation(0.01);
    sun0.setTranslation([0.0, 0.0, -1000.0]);

    const sun1 = await spacePlanetObject.create(gl, standartProgram, "./Models/sun.obj", "./Textures/sun.jpg");
    sun1.setScale([25, 25, 25]);
    sun1.setPareentPlanet(sun0, 1200);
    sun1.setAngularSpeedRotation(0.01, 0.01);

    const sun2 = await spacePlanetObject.create(gl, standartProgram, "./Models/sun.obj", "./Textures/sun.jpg");
    sun2.setScale([25, 25, 25]);
    sun2.setPareentPlanet(sun0, 2400);
    sun2.setAngularSpeedRotation(0.1, 0.005);

    const sun3 = await spacePlanetObject.create(gl, standartProgram, "./Models/sun.obj", "./Textures/sun.jpg");
    sun3.setScale([15, 15, 15])
    sun3.setPareentPlanet(sun1, 200);
    sun3.setAngularSpeedRotation(0.1, 0.02);

    const sun4 = await spacePlanetObject.create(gl, standartProgram, "./Models/sun.obj", "./Textures/sun.jpg");
    sun4.setScale([15, 15, 15])
    sun4.setPareentPlanet(sun1, 100);
    sun4.setAngularSpeedRotation(0.1, 0.004);

    requestAnimationFrame(timeNow => frameRender(gl, timeNow, spacePlanetObject.runRotation));
})()