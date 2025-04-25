import { initGL, createShader, createProgram } from "./KryptEngine/webgl-context.js";
import { parseObj, imageLoader } from "./KryptEngine/file-loader.js";
import { createBuffer, createTexture } from "./KryptEngine/webgl-resource.js";
import { frameRender, GLCamera, GLLight, GLModel } from "./KryptEngine/webgl-scene.js";
import { SpacePlanet } from "./scripts/planetGL-renderer.js";
import { FreeCamera, InputManager } from "./scripts/input-manager.js";
import { updateInfo, timeAcceleration } from "./scripts/interface.js";

(async function main() {
    const gl = initGL();

    const [planetVertexShader, planetFragmentShader, starVertexShader, starFragmentShader, skyboxVertexShader, skyboxFragmentShader] = await Promise.all([
        createShader(gl, gl.VERTEX_SHADER, "./KryptEngine/Shaders/planetVertexShader.vert"),
        createShader(gl, gl.FRAGMENT_SHADER, "./KryptEngine/Shaders/planetFragmentShader.frag"),

        createShader(gl, gl.VERTEX_SHADER, "./KryptEngine/Shaders/starVertexShader.vert"),
        createShader(gl, gl.FRAGMENT_SHADER, "./KryptEngine/Shaders/starFragmentShader.frag"),

        createShader(gl, gl.VERTEX_SHADER, "./KryptEngine/Shaders/skyboxVertexShader.vert"),
        createShader(gl, gl.FRAGMENT_SHADER, "./KryptEngine/Shaders/skyboxFragmentShader.frag")

    ]);

    const [planetProgram, starProgram, skyboxProgram] = await Promise.all([
        createProgram(gl, planetVertexShader, planetFragmentShader),
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

    const camera0 = FreeCamera.create(gl, [planetProgram, starProgram], skyboxProgram);
    camera0.renderDistance = 100000;
    camera0.speedMove = 1000;
    camera0.speedRotation = 4;
    camera0.position = [0.0, 6000.0, 14000.0];
    camera0.rotation = [0.0, 3.14, 0.0];
    GLCamera.activeCamera = camera0;

    InputManager.init();

    const skybox = GLModel.create(gl, skyboxProgram, sphereBufferData, milkyWayTexture);

    const sun = await SpacePlanet.create(gl, starProgram, sphereBufferData, sunTexture);
    sun.scale = [1000, 1000, 1000];
    sun.setAngularSpeedRotation(0.01, 0);
    sun.position = [0.0, 0.0, 0.0];

    const light = GLLight.create(gl, [planetProgram]);

    const mercury = await SpacePlanet.create(gl, planetProgram, sphereBufferData, mercuryTexture);
    mercury.scale = [25, 25, 25];
    mercury.setParrentPlanet(sun, 5000);
    mercury.setAngularSpeedRotation(0.01, 0.01);

    const venus = await SpacePlanet.create(gl, planetProgram, sphereBufferData, venusTexture);
    venus.scale = [25, 25, 25];
    venus.setParrentPlanet(sun, 7000);
    venus.setAngularSpeedRotation(0.01, 0.005);

    const earth = await SpacePlanet.create(gl, planetProgram, sphereBufferData, earthTexture);
    earth.scale = [25, 25, 25];
    earth.setParrentPlanet(sun, 9000);
    earth.setAngularSpeedRotation(0.01, 0.0025);

    const earthClouds = await SpacePlanet.create(gl, planetProgram, sphereBufferData, earthCloudsTexture);
    earthClouds.scale = [26, 26, 26];
    earthClouds.setParrentPlanet(earth, 0);
    earthClouds.setAngularSpeedRotation(0.02, 0);
    earthClouds.color = [1.0, 1.0, 1.0, 0.4];

    const moon = await SpacePlanet.create(gl, planetProgram, sphereBufferData, moonTexture);
    moon.scale = [10, 10, 10];
    moon.setParrentPlanet(earth, 500);
    moon.setAngularSpeedRotation(0.01, 0.01);

    const mars = await SpacePlanet.create(gl, planetProgram, sphereBufferData, marsTexture);
    mars.scale = [15, 15, 15];
    mars.setParrentPlanet(sun, 11000);
    mars.setAngularSpeedRotation(0.01, 0.00125);

    const jupiter = await SpacePlanet.create(gl, planetProgram, sphereBufferData, jupiterTexture);
    jupiter.scale = [50, 50, 50];
    jupiter.setParrentPlanet(sun, 13000);
    jupiter.setAngularSpeedRotation(0.01, 0.000675);

    const saturn = await SpacePlanet.create(gl, planetProgram, sphereBufferData, saturnTexture);
    saturn.scale = [45, 45, 45];
    saturn.setParrentPlanet(sun, 15000);
    saturn.setAngularSpeedRotation(0.01, 0.000300);

    const uranus = await SpacePlanet.create(gl, planetProgram, sphereBufferData, uranusTexture);
    uranus.scale = [35, 35, 35];
    uranus.setParrentPlanet(sun, 17000);
    uranus.setAngularSpeedRotation(0.01, 0.000150);

    const neptune = await SpacePlanet.create(gl, planetProgram, sphereBufferData, neptuneTexture);
    neptune.scale = [40, 40, 40];
    neptune.setParrentPlanet(sun, 19000);
    neptune.setAngularSpeedRotation(0.01, 0.000075);

    const pluto = await SpacePlanet.create(gl, planetProgram, sphereBufferData, plutoTexture);
    pluto.scale = [10, 10, 10];
    pluto.setParrentPlanet(sun, 21000);
    pluto.setAngularSpeedRotation(0.01, 0.000030);

    requestAnimationFrame(timeNow => frameRender(gl, timeNow, 0, deltaTime => {
        SpacePlanet.currentObjects.forEach(object => object.rotationStep(deltaTime, timeAcceleration));
        FreeCamera.activeCamera.transformEvents(deltaTime);
        updateInfo(gl, deltaTime);
    }));
})();