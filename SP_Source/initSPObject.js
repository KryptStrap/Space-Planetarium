import {webGlObject} from "../Engine/initWebGlObject.js";

export class spObject extends webGlObject {
    #radius;
    #parentPlanet;
    #distanceFromParent;
    #revolution;

    constructor(gl, program, positions, color, indices, parrentPlanet, distanceFromParent) {
        super(gl, program, positions, color, indices);

        this.#parentPlanet = parrentPlanet;
        this.#distanceFromParent = distanceFromParent;
        this.#revolution = 0;
    }



    moveOrbit(speed) {
        this._translationArray[0] = this.#parentPlanet._translationArray[0] + this.#distanceFromParent * Math.sin(this.#revolution);
        this._translationArray[2] = this.#parentPlanet._translationArray[2] + this.#distanceFromParent * Math.cos(this.#revolution);
        this.#revolution += speed;

        this._rotationArray[1] += 0.01;

        glMatrix.mat4.translate(this._translationMatrix, glMatrix.mat4.create(), this._translationArray);
        glMatrix.mat4.rotateY(this._rotationMatrix, glMatrix.mat4.create(), this._rotationArray[1]);
        

        this._gl.uniformMatrix4fv(this._u_Translation_Matrix_Location, false, this._translationMatrix);
        this._gl.uniformMatrix4fv(this._u_Rotation_Matrix_Location, false, this._rotationMatrix);
    }
}