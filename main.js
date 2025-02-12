import { createWebGlContext, loadShaderProgram } from "./Engine/initWebGlContext.js";
import { camera, renderObjects } from "./Engine/initWebGlObject.js";
import { spObject } from "./SP_Source/initSPObject.js";
import { OBJParser, modelFileLoader } from "./Engine/OBJLoader.js";

(async function main() {
    const gl = createWebGlContext();
    const program = await loadShaderProgram(gl, "Engine/Shaders/standartVertexShader.vert", "Engine/Shaders/standartFragmentShader.frag");
    const parser = new OBJParser();

    camera.create(gl, program, [0.0, 20.0, 0.0], [-3.14, 0.0, 0.0]);

    parser.parse(await modelFileLoader("./Models/sphere.obj"));

    console.log(parser.getVertices());
    console.log(parser.getFaces().flat());

    const object1 = new spObject(gl, program, parser.getVertices(), parser.getVertices(), parser.getFaces(), null, null);
    object1.setTranslation([0.0, 0.0, 0.0]);

    const object2 = new spObject(gl, program, parser.getVertices(), parser.getVertices(), parser.getFaces(), object1, 10);

    const object3 = new spObject(gl, program, parser.getVertices(), parser.getVertices(), parser.getFaces(), object2, 5);

    requestAnimationFrame(timeNow => renderObjects(gl, [object1, object2, object3], timeNow));
})()