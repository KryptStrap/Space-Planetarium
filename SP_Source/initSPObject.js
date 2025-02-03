import {webGlObject} from "../Engine/initWebGlObject.js";

export class spObject extends webGlObject {
    #radius;
    #parentPlanet;
    #distanceFromParent;

    #moveOrbit;

    constructor(gl, program, positions, color, primitives, parrentPlanet) {
        super(gl, program, positions, color, primitives)

        this.#parentPlanet = parrentPlanet;
        this.#moveOrbit = false
    }

    moveOrbitStart() {
        this.#moveOrbit = true;

        while(this.#moveOrbit) {

        }
    }
}