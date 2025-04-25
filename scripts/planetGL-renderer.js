import { GLModel } from "../KryptEngine/webgl-scene.js";
import { timeAcceleration } from "./interface.js";

export class SpacePlanet extends GLModel {
    #parentPlanet;
    #distanceFromParrent = 0;
    #revolution = 0;

    #axisRotationSpeed = 0;
    #orbitalRotationSpeed = 0;

    static currentObjects = [];

    constructor(gl, program, modelData, image,) {
        super(gl, program, modelData, image);
        
        this.#revolution = 0;

        SpacePlanet.currentObjects.push(this);
    }

    setParrentPlanet(parrentPlanet, distanceFromParrent) {
        this.#parentPlanet = parrentPlanet;
        this.#distanceFromParrent = distanceFromParrent;
    }

    setAngularSpeedRotation(axisRotationSpeed, orbitalRotationSpeed) {
        this.#axisRotationSpeed = axisRotationSpeed;
        this.#orbitalRotationSpeed = orbitalRotationSpeed;
    }

    rotationStep(deltaTime) {
        if(this.#parentPlanet) {
            this._positionArray[0] = this.#parentPlanet._positionArray[0] + this.#distanceFromParrent * Math.sin(this.#revolution);
            this._positionArray[2] = this.#parentPlanet._positionArray[2] + this.#distanceFromParrent * Math.cos(this.#revolution);
            this.#revolution += this.#orbitalRotationSpeed * deltaTime * timeAcceleration;

            this._rotationArray[1] += this.#axisRotationSpeed * deltaTime * timeAcceleration;

            glMatrix.mat4.translate(this._positionMatrix, glMatrix.mat4.create(), this._positionArray);
            glMatrix.mat4.rotateY(this._rotationMatrix, glMatrix.mat4.create(), this._rotationArray[1]);
        
            this._gl.useProgram(this._program);
            this._gl.uniformMatrix4fv(this._uPositionMatrixLocation, false, this._positionMatrix);
            this._gl.uniformMatrix4fv(this._uRotationMatrixLocation, false, this._rotationMatrix);
        } else {
            this._rotationArray[1] += this.#axisRotationSpeed * deltaTime * timeAcceleration;

            glMatrix.mat4.rotateY(this._rotationMatrix, glMatrix.mat4.create(), this._rotationArray[1]);
            
            this._gl.useProgram(this._program);
            this._gl.uniformMatrix4fv(this._uRotationMatrixLocation, false, this._rotationMatrix);
        }
    }

    static async create(gl, program, bufferData, texture) {
        return new SpacePlanet(gl, program, bufferData, texture);
    }
}