import {webGlObject, webGlCamera} from "../Engine/initWebGlObject.js";
import { fileReader, imageLoader } from "../Engine/fileLoader.js";

export class spacePlanetObject extends webGlObject {
    #radius = 1;
    #parentPlanet;
    #distanceFromParent = 0;
    #revolution = 0;

    #axisRotationSpeed = 0;
    #orbitalRotationSpeed = 0;

    constructor(gl, program, modelData, image, radius) {
        super(gl, program, modelData, image);
        
        this.#radius = radius;
        this.#revolution = 0;

        this.setScale([this.#radius, this.#radius, this.#radius]);
    }

    setPareentPlanet(parrentPlanet, distanceFromParent) {
        this.#parentPlanet = parrentPlanet;
        this.#distanceFromParent = distanceFromParent;
    }

    setAngularSpeedRotation(axisRotationSpeed, orbitalRotationSpeed) {
        this.#axisRotationSpeed = axisRotationSpeed;
        this.#orbitalRotationSpeed = orbitalRotationSpeed;
    }

    rotationStep() {
        if(this.#parentPlanet !== undefined) {
            this._translationArray[0] = this.#parentPlanet._translationArray[0] + this.#distanceFromParent * Math.sin(this.#revolution);
            this._translationArray[2] = this.#parentPlanet._translationArray[2] + this.#distanceFromParent * Math.cos(this.#revolution);
            this.#revolution += this.#orbitalRotationSpeed;

            this._rotationArray[1] += this.#axisRotationSpeed;

            glMatrix.mat4.translate(this._translationMatrix, glMatrix.mat4.create(), this._translationArray);
            glMatrix.mat4.rotateY(this._rotationMatrix, glMatrix.mat4.create(), this._rotationArray[1]);
        

            this._gl.uniformMatrix4fv(this._u_Translation_Matrix_Location, false, this._translationMatrix);
            this._gl.uniformMatrix4fv(this._u_Rotation_Matrix_Location, false, this._rotationMatrix);
        } else {
            this._rotationArray[1] += this.#axisRotationSpeed;

            glMatrix.mat4.rotateY(this._rotationMatrix, glMatrix.mat4.create(), this._rotationArray[1]);
        
            this._gl.uniformMatrix4fv(this._u_Rotation_Matrix_Location, false, this._rotationMatrix);
        }
    }

    static async create(gl, program, modelDataPath, imagePath, radius, parrentPlanet, distanceFromParent) {
        const modelData = await fileReader(modelDataPath);
        const image = await imageLoader(imagePath);
        return new spacePlanetObject(gl, program, modelData, image, radius, parrentPlanet, distanceFromParent);
    }
}