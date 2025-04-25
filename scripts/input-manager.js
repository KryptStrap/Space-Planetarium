import { GLCamera } from "../KryptEngine/webgl-scene.js";

export class InputManager {
  static #keysPressed = new Set();
  static #initialized = false;

  static #onKeyDown = (event) => {
    if (!event.repeat) {
      this.#keysPressed.add(event.key);
    };
  };

  static #onKeyUp = (event) => {
    this.#keysPressed.delete(event.key);
  };

  static #onMouseDown = () => {
    this.#keysPressed.add("mouse");
  };

  static #onMouseUp = () => {
    this.#keysPressed.delete("mouse");
  };

  static #resetTimeout;

  static #mouseThenX = null;
  static #mouseThenY = null;
  static mouseOffsetX = null;
  static mouseOffsetY = null;

  static #onMouseMove = (event) => {
    clearTimeout(this.#resetTimeout);

    if(this.#mouseThenX === null || this.#mouseThenY === null) {
      this.#mouseThenX = event.clientX;
      this.#mouseThenY = event.clientY;
      return;
    };

    this.mouseOffsetX = event.clientX - this.#mouseThenX;
    this.mouseOffsetY = event.clientY - this.#mouseThenY;

    this.#mouseThenX = event.clientX;
    this.#mouseThenY = event.clientY;

    this.#resetTimeout = setTimeout(() => {
      this.mouseOffsetX = null;
      this.mouseOffsetY = null;
      this.#mouseThenX = null;
      this.#mouseThenY = null;
    }, 16);
  };

  static #onTouchStart = () => {
    this.#keysPressed.add("touch");
  };

  static #onTouchEnd = () => {
    this.#keysPressed.delete("touch");
  };

  static #touchThenX = null;
  static #touchThenY = null;
  static touchOffsetX = null;
  static touchOffsetY = null;

  static #onTouchMove = (event) => {
    clearTimeout(this.#resetTimeout);

    if(this.#touchThenX === null || this.#touchThenY === null) {
      this.#touchThenX = event.touches[0].clientX;
      this.#touchThenY = event.touches[0].clientY;
      return;
    };

    this.touchOffsetX = event.touches[0].clientX - this.#touchThenX;
    this.touchOffsetY = event.touches[0].clientY - this.#touchThenY;

    this.#touchThenX = event.touches[0].clientX;
    this.#touchThenY = event.touches[0].clientY;

    this.#resetTimeout = setTimeout(() => {
      this.touchOffsetX = null;
      this.touchOffsetY = null;
      this.#touchThenX = null;
      this.#touchThenY = null;
    }, 16);
  };

  static init() {
    if (!this.#initialized) {
      if (!("ontouchstart" in window)) {
        document.addEventListener("keydown", this.#onKeyDown);
        document.addEventListener("keyup", this.#onKeyUp);

        document.addEventListener("mousedown", this.#onMouseDown);
        document.addEventListener("mouseup", this.#onMouseUp);
        document.addEventListener("mousemove", this.#onMouseMove);
      } else {
        document.addEventListener("touchstart", this.#onTouchStart);
        document.addEventListener("touchend", this.#onTouchEnd);
        document.addEventListener("touchmove", this.#onTouchMove);
      };

      this.#initialized = true;
    };
  };

  static get keys() {
    return new Set(this.#keysPressed);
  };

  static isKeyPressed(key) {
    return InputManager.keys.has(key);
  };
};

const mat4 = glMatrix.mat4;

export class FreeCamera extends GLCamera {
  speedMove = 1;
  speedRotation = 1;
  static currentObjects = [];

  constructor(gl, programs, skyboxProgram) {
    super(gl, programs, skyboxProgram);
    FreeCamera.currentObjects.push(this);
  };

  #updateViewMatrix(matrix) {
    mat4.multiply(this._viewMatrix, matrix, this._viewMatrix);
    //this._gl.useProgram(this._program);
    //this._gl.uniformMatrix4fv(this._uViewMatrixLocation, false, this._viewMatrix);
  };
    
  #updateViewSkyboxMatrix(matrix) {
    mat4.multiply(this._viewSkyboxMatrix, matrix, this._viewSkyboxMatrix);
   // this._gl.useProgram(this._skyboxProgram);
    //this._gl.uniformMatrix4fv(this._uViewSkyboxMatrixLocation, false, this._viewSkyboxMatrix);
  };
    
  #moveLocalX(speed) {
    const translationSpeedMatrix = mat4.create();
    return mat4.translate(translationSpeedMatrix, translationSpeedMatrix, [speed, 0.0, 0.0]);
  };
    
  #moveLocalY(speed) {
    const translationSpeedMatrix = mat4.create();
    return mat4.translate(translationSpeedMatrix, translationSpeedMatrix, [0.0, speed, 0.0]);
  };
    
  #moveLocalZ(speed) {
    const translationSpeedMatrix = mat4.create();
    return mat4.translate(translationSpeedMatrix, translationSpeedMatrix, [0.0, 0.0, speed]);
  };
    
  #rotateLocalX(angularVelocity) {
    const rotateSpeedMatrix = mat4.create();
    return mat4.rotateX(rotateSpeedMatrix, rotateSpeedMatrix, angularVelocity);
  };
    
  #rotateLocalY(angularVelocity) {
    const rotateSpeedMatrix = mat4.create();
    return mat4.rotateY(rotateSpeedMatrix, rotateSpeedMatrix, angularVelocity);
  };
    
  #rotateLocalZ(angularVelocity) {
    const rotateSpeedMatrix = mat4.create();
    return mat4.rotateZ(rotateSpeedMatrix, rotateSpeedMatrix, angularVelocity);
  };
    
  transformEvents(deltaTime) {
    if(InputManager.isKeyPressed("w")) {
      this.#updateViewMatrix(this.#moveLocalZ(this.speedMove * deltaTime));
    };
    
    if(InputManager.isKeyPressed("s")) {
      this.#updateViewMatrix(this.#moveLocalZ(-this.speedMove * deltaTime));
    };
    
    if(InputManager.isKeyPressed("a")) {
      this.#updateViewMatrix(this.#moveLocalX(this.speedMove * deltaTime));
    };

    if(InputManager.isKeyPressed("d")) {
      this.#updateViewMatrix(this.#moveLocalX(-this.speedMove * deltaTime));
    };

    if(InputManager.isKeyPressed("Control")) {
      this.#updateViewMatrix(this.#moveLocalY(this.speedMove * deltaTime));
    };
    
    if(InputManager.isKeyPressed(" ")) {
      this.#updateViewMatrix(this.#moveLocalY(-this.speedMove * deltaTime));
    };
    
    if(InputManager.isKeyPressed("mouse")) {
      this.#updateViewMatrix(this.#rotateLocalY(InputManager.mouseOffsetX * deltaTime));
      this.#updateViewSkyboxMatrix(this.#rotateLocalY(InputManager.mouseOffsetX * deltaTime));

      this.#updateViewMatrix(this.#rotateLocalX(InputManager.mouseOffsetY* deltaTime));
      this.#updateViewSkyboxMatrix(this.#rotateLocalX(InputManager.mouseOffsetY * deltaTime));
    };

    if(InputManager.isKeyPressed("touch")) {
      this.#updateViewMatrix(this.#rotateLocalY(InputManager.touchOffsetX * deltaTime));
      this.#updateViewSkyboxMatrix(this.#rotateLocalY(InputManager.touchOffsetX * deltaTime));

      this.#updateViewMatrix(this.#rotateLocalX(InputManager.touchOffsetY * deltaTime));
      this.#updateViewSkyboxMatrix(this.#rotateLocalX(InputManager.touchOffsetY * deltaTime));
    };
    
    if(InputManager.isKeyPressed("q")) {
      this.#updateViewMatrix(this.#rotateLocalZ(-this.speedRotation * deltaTime));
      this.#updateViewSkyboxMatrix(this.#rotateLocalZ(-this.speedRotation * deltaTime));
    };
    
    if(InputManager.isKeyPressed("e")) {
      this.#updateViewMatrix(this.#rotateLocalZ(this.speedRotation * deltaTime));
      this.#updateViewSkyboxMatrix(this.#rotateLocalZ(this.speedRotation * deltaTime));
    };
  };

  static create(gl, programs, skyboxProgram) {
    return new FreeCamera(gl, programs, skyboxProgram);
  };
};