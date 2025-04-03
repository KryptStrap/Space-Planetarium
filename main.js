import { initGL, createShader, createProgram } from "./KryptEngine/webgl-context.js";
import { parseObj, imageLoader } from "./KryptEngine/file-loader.js";
import { createBuffer, createTexture } from "./KryptEngine/webgl-resource.js";
import { frameRender, GLCamera, GLModel } from "./KryptEngine/webgl-scene.js";
import { SpacePlanet } from "./scripts/PlanetGLRenderer.js";
import { FreeCamera, InputManager } from "./scripts/InputManager.js";

(async function main() {
    const gl = initGL();

    const [standartVertexShader, standartFragmentShader, starVertexShader, starFragmentShader, skyboxVertexShader, skyboxFragmentShader] = await Promise.all([
        createShader(gl, gl.VERTEX_SHADER, "./KryptEngine/Shaders/planetVertexShader.vert"),
        createShader(gl, gl.FRAGMENT_SHADER, "./KryptEngine/Shaders/planetFragmentShader.frag"),

        createShader(gl, gl.VERTEX_SHADER, "./KryptEngine/Shaders/starVertexShader.vert"),
        createShader(gl, gl.FRAGMENT_SHADER, "./KryptEngine/Shaders/starFragmentShader.frag"),

        createShader(gl, gl.VERTEX_SHADER, "./KryptEngine/Shaders/skyboxVertexShader.vert"),
        createShader(gl, gl.FRAGMENT_SHADER, "./KryptEngine/Shaders/skyboxFragmentShader.frag")

    ]);

    const [standartProgram, starProgram, skyboxProgram] = await Promise.all([
        createProgram(gl, standartVertexShader, standartFragmentShader),
        createProgram(gl, starVertexShader, starFragmentShader),
        createProgram(gl, skyboxVertexShader, skyboxFragmentShader)
    ]);

    const [sphereModel, milkyWayImage, sunImage, mercuryImage, venusImage, earthImage, earthCloudsImage,
        moonImage, marsImage, jupiterImage, saturnImage, uranusImage, neptuneImage, plutoImage] = await Promise.all([
        parseObj("./assets/models/sphere.obj"),
        imageLoader("./assets/textures/Milky-Way-panorama_4000.jpg"),
        imageLoader("./assets/textures/sun.jpg"),
        imageLoader("./assets/textures/mercury.jpg"),
        imageLoader("./assets/textures/venus.jpg"),
        imageLoader("./assets/textures/Earth Map.jpg"),
        imageLoader("./assets/textures/Earth-Clouds2700.jpg"),
        imageLoader("./assets/textures/moon_map_002.jpg"),
        imageLoader("./assets/textures/mars.jpg"),
        imageLoader("./assets/textures/jupiter.jpg"),
        imageLoader("./assets/textures/saturn.jpg"),
        imageLoader("./assets/textures/uranus.jpg"),
        imageLoader("./assets/textures/neptune.jpg"),
        imageLoader("./assets/textures/pluto.jpg"),
    ]);

    const sphereBufferData = createBuffer(gl, sphereModel);

    const milkyWayTexture = createTexture(gl, milkyWayImage);
    const sunTexture = createTexture(gl, sunImage);
    const mercuryTexture = createTexture(gl, mercuryImage);
    const venusTexture = createTexture(gl, venusImage);
    const earthTexture = createTexture(gl, earthImage);
    const earthCloudsTexture = createTexture(gl, earthCloudsImage);
    const moonTexture = createTexture(gl, moonImage);
    const marsTexture = createTexture(gl, marsImage);
    const jupiterTexture = createTexture(gl, jupiterImage);
    const saturnTexture = createTexture(gl, saturnImage);
    const uranusTexture = createTexture(gl, uranusImage);
    const neptuneTexture = createTexture(gl, neptuneImage);
    const plutoTexture = createTexture(gl, plutoImage);

    const camera0 = FreeCamera.create(gl, [standartProgram, starProgram], skyboxProgram);
    camera0.renderDistance = 100000;
    camera0.speedMove = 1000;
    camera0.speedRotation = 4;
    camera0.rotation = [0.0, 3.14, 0.0];
    camera0.position = [0.0, 300.0, 2000.0]
    GLCamera.activeCamera = camera0;

    InputManager.init();

    const skybox = GLModel.create(gl, skyboxProgram, sphereBufferData, milkyWayTexture);

    const sun = await SpacePlanet.create(gl, starProgram, sphereBufferData, sunTexture);
    sun.scale = [100, 100, 100];
    sun.setAngularSpeedRotation(0.01, 0);
    sun.position = [0.0, 0.0, 0.0];

    const mercury = await SpacePlanet.create(gl, standartProgram, sphereBufferData, mercuryTexture);
    mercury.scale = [25, 25, 25];
    mercury.setPareentPlanet(sun, 1200);
    mercury.setAngularSpeedRotation(0.01, 0.01);

    const venus = await SpacePlanet.create(gl, standartProgram, sphereBufferData, venusTexture);
    venus.scale = [25, 25, 25];
    venus.setPareentPlanet(sun, 2400);
    venus.setAngularSpeedRotation(0.01, 0.005);

    const earth = await SpacePlanet.create(gl, standartProgram, sphereBufferData, earthTexture);
    earth.scale = [25, 25, 25];
    earth.setPareentPlanet(sun, 2800);
    earth.setAngularSpeedRotation(0.01, 0.0025);

    const earthClouds = await SpacePlanet.create(gl, standartProgram, sphereBufferData, earthCloudsTexture);
    earthClouds.scale = [26, 26, 26];
    earthClouds.setPareentPlanet(earth, 0);
    earthClouds.setAngularSpeedRotation(0.02, 0);
    earthClouds.color = [1.0, 1.0, 1.0, 0.4];

    const moon = await SpacePlanet.create(gl, standartProgram, sphereBufferData, moonTexture);
    moon.scale = [10, 10, 10];
    moon.setPareentPlanet(earth, 200);
    moon.setAngularSpeedRotation(0.01, 0.01);

    const mars = await SpacePlanet.create(gl, standartProgram, sphereBufferData, marsTexture);
    mars.scale = [15, 15, 15];
    mars.setPareentPlanet(sun, 3200);
    mars.setAngularSpeedRotation(0.01, 0.00125);

    const jupiter = await SpacePlanet.create(gl, standartProgram, sphereBufferData, jupiterTexture);
    jupiter.scale = [50, 50, 50];
    jupiter.setPareentPlanet(sun, 4000);
    jupiter.setAngularSpeedRotation(0.01, 0.000675);

    const saturn = await SpacePlanet.create(gl, standartProgram, sphereBufferData, saturnTexture);
    saturn.scale = [45, 45, 45];
    saturn.setPareentPlanet(sun, 5000);
    saturn.setAngularSpeedRotation(0.01, 0.000300);

    const uranus = await SpacePlanet.create(gl, standartProgram, sphereBufferData, uranusTexture);
    uranus.scale = [35, 35, 35];
    uranus.setPareentPlanet(sun, 6000);
    uranus.setAngularSpeedRotation(0.01, 0.000150);

    const neptune = await SpacePlanet.create(gl, standartProgram, sphereBufferData, neptuneTexture);
    neptune.scale = [40, 40, 40];
    neptune.setPareentPlanet(sun, 7000);
    neptune.setAngularSpeedRotation(0.01, 0.000075);

    const pluto = await SpacePlanet.create(gl, standartProgram, sphereBufferData, plutoTexture);
    pluto.scale = [10, 10, 10];
    pluto.setPareentPlanet(sun, 8000);
    pluto.setAngularSpeedRotation(0.01, 0.000030);

    const frameRateHTML = document.querySelector(".info");

    requestAnimationFrame(timeNow => frameRender(gl, timeNow, deltaTime => {
        SpacePlanet.currentObjects.forEach(object => object.rotationStep(deltaTime, 8));
        FreeCamera.activeCamera.transformEvents(deltaTime);
        frameRateHTML.innerText = `FPS: ${Math.round(1 / deltaTime)}\n Resolution: ${gl.canvas.width}x${gl.canvas.height}`;
    }));
})();