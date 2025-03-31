import { initGL, createShader, createProgram } from "./KryptEngine/webgl-context.js";
import { frameRender, GLCamera, GLModel } from "./KryptEngine/webgl-scene.js";
import { SpacePlanet } from "./scripts/PlanetGLRenderer.js";
import {FreeCamera, InputManager} from "./scripts/InputManager.js";

(async function main() {
    const gl = initGL();
    const standartVertexShader = await createShader(gl, gl.VERTEX_SHADER, "./KryptEngine/Shaders/standartVertexShader.vert");
    const skyboxVertexShader = await createShader(gl, gl.VERTEX_SHADER, "./KryptEngine/Shaders/skyboxVertexShader.vert");

    const standartFragmentShader = await createShader(gl, gl.FRAGMENT_SHADER, "./KryptEngine/Shaders/standartFragmentShader.frag");
    const skyboxFragmentShader = await createShader(gl, gl.FRAGMENT_SHADER, "./KryptEngine/Shaders/skyboxFragmentShader.frag");

    const standartProgram = createProgram(gl, standartVertexShader, standartFragmentShader);
    const skyboxProgram = createProgram(gl, skyboxVertexShader, skyboxFragmentShader);

    const camera0 = FreeCamera.create(gl, standartProgram, skyboxProgram);
    camera0.renderDistance = 100000;
    camera0.speedMove = 1000;
    camera0.speedRotation = 4;
    GLCamera.activeCamera = camera0;

    InputManager.init();

    const skybox = await GLModel.create(gl, skyboxProgram, "./assets/models/sphere.obj", "./assets/textures/Milky-Way-panorama_4000.jpg");

    const sun = await SpacePlanet.create(gl, standartProgram, "./assets/models/sphere.obj", "./assets/textures/sun.jpg");
    sun.scale = [100, 100, 100];
    sun.setAngularSpeedRotation(0.01, 0);
    sun.position = [0.0, 0.0, -1000.0];

    const mercury = await SpacePlanet.create(gl, standartProgram, "./assets/models/sphere.obj", "./assets/textures/mercury.jpg");
    mercury.scale = [25, 25, 25];
    mercury.setPareentPlanet(sun, 1200);
    mercury.setAngularSpeedRotation(0.01, 0.01);

    const venus = await SpacePlanet.create(gl, standartProgram, "./assets/models/sphere.obj", "./assets/textures/venus.jpg")
    venus.scale = [25, 25, 25];
    venus.setPareentPlanet(sun, 2400);
    venus.setAngularSpeedRotation(0.01, 0.005);

    const earth = await SpacePlanet.create(gl, standartProgram, "./assets/models/sphere.obj", "./assets/textures/Earth Map.jpg")
    earth.scale = [25, 25, 25];
    earth.setPareentPlanet(sun, 2800);
    earth.setAngularSpeedRotation(0.01, 0.0025);

    const earthClouds = await SpacePlanet.create(gl, standartProgram, "./assets/models/sphere.obj", "./assets/textures/Earth-Clouds2700.jpg");
    earthClouds.scale = [26, 26, 26];
    earthClouds.setPareentPlanet(earth, 0);
    earthClouds.setAngularSpeedRotation(0.02, 0);
    earthClouds.color = [1.0, 1.0, 1.0, 0.4];

    const moon = await SpacePlanet.create(gl, standartProgram, "./assets/models/sphere.obj", "./assets/textures/moon_map_002.jpg");
    moon.scale = [10, 10, 10];
    moon.setPareentPlanet(earth, 200);
    moon.setAngularSpeedRotation(0.01, 0.01);

    const mars = await SpacePlanet.create(gl, standartProgram, "./assets/models/sphere.obj", "./assets/textures/mars.jpg")
    mars.scale = [15, 15, 15];
    mars.setPareentPlanet(sun, 3200);
    mars.setAngularSpeedRotation(0.01, 0.00125);

    const jupiter = await SpacePlanet.create(gl, standartProgram, "./assets/models/sphere.obj", "./assets/textures/jupiter.jpg")
    jupiter.scale = [50, 50, 50];
    jupiter.setPareentPlanet(sun, 4000);
    jupiter.setAngularSpeedRotation(0.01, 0.000675);

    const saturn = await SpacePlanet.create(gl, standartProgram, "./assets/models/sphere.obj", "./assets/textures/saturn.jpg")
    saturn.scale = [45, 45, 45];
    saturn.setPareentPlanet(sun, 5000);
    saturn.setAngularSpeedRotation(0.01, 0.000300);

    const uranus = await SpacePlanet.create(gl, standartProgram, "./assets/models/sphere.obj", "./assets/textures/uranus.jpg")
    uranus.scale = [35, 35, 35];
    uranus.setPareentPlanet(sun, 6000);
    uranus.setAngularSpeedRotation(0.01, 0.000150);

    const neptune = await SpacePlanet.create(gl, standartProgram, "./assets/models/sphere.obj", "./assets/textures/neptune.jpg")
    neptune.scale = [40, 40, 40];
    neptune.setPareentPlanet(sun, 7000);
    neptune.setAngularSpeedRotation(0.01, 0.000075);

    const pluto = await SpacePlanet.create(gl, standartProgram, "./assets/models/sphere.obj", "./assets/textures/pluto.jpg")
    pluto.scale = [10, 10, 10];
    pluto.setPareentPlanet(sun, 8000);
    pluto.setAngularSpeedRotation(0.01, 0.000030);

    const frameRateHTML = document.querySelector(".info");

    requestAnimationFrame(timeNow => frameRender(gl, timeNow, deltaTime => {
        SpacePlanet.currentObjects.forEach(object => object.rotationStep(deltaTime, 8));
        FreeCamera.currentObjects.forEach(object => object.transformEvents(deltaTime));
        frameRateHTML.innerText = `FPS: ${Math.round(1 / deltaTime)}\n Resolution: ${gl.canvas.width}x${gl.canvas.height}`;
    }));
})();