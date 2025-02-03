import { createWebGlContext, loadShaderProgram } from "./Engine/initWebGlContext.js";
import { camera, webGlObject, renderObjects } from "./Engine/initWebGlObject.js";
import { sunPositions, sunColors, coordinateGridPosition, coordinateGridColor } from "./Engine/initObjectsVertexPosition.js";
import {spObject} from "./SP_Source/initSPObject.js";

(async function main() {
    const gl = createWebGlContext();
    const program = await loadShaderProgram(gl, "Engine/Shaders/standartVertexShader.vert", "Engine/Shaders/standartFragmentShader.frag");

    camera.create(gl, program, [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]);

    const coordinateGrid = new webGlObject(gl, program, coordinateGridPosition, coordinateGridColor, "lines");
    
    const object1 = new spObject(gl, program, sunPositions, sunColors, "triangles");

    requestAnimationFrame(timeNow => renderObjects(gl, [object1, coordinateGrid], timeNow));
})()