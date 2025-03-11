import { OBJParser } from "./fileLoader.js";
import { fileReader, imageLoader } from "../Engine/fileLoader.js";

const mat4 = glMatrix.mat4;

export class webGlCamera {
  #gl;
  #program;
  #skyboxProgram;

  #viewMatrix = mat4.identity(mat4.create());;
  #viewSkyboxMatrix = mat4.identity(mat4.create());
  #perspectiveMatrix = mat4.identity(mat4.create());
  #renderDistance;
  #handleKeyDown;

  #u_Perspective_Matrix_Location;
  #u_Perspective_Skybox_Matrix_Location;
  #u_View_Matrix_Location;
  #u_View_Skybox_Matrix_Location;

  static #activeCamera;

  constructor(gl, program, skyboxProgram, renderDistance) {
    this.#gl = gl;
    this.#program = program;
    this.#skyboxProgram = skyboxProgram;
    this.#renderDistance = renderDistance;

    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.#initCamera();
  }

  #initCamera() {
    this.#gl.canvas.width = Math.round(this.#gl.canvas.clientWidth * window.devicePixelRatio);
    this.#gl.canvas.height = Math.round(this.#gl.canvas.clientHeight * window.devicePixelRatio);
    this.#gl.viewport(0, 0, this.#gl.canvas.width, this.#gl.canvas.height);

    mat4.perspective(this.#perspectiveMatrix, 45, this.#gl.canvas.width / this.#gl.canvas.height, 0.1, this.#renderDistance);
    
    this.#gl.useProgram(this.#program);
    this.#u_View_Matrix_Location = this.#gl.getUniformLocation(this.#program, "u_View_Matrix");
    this.#u_Perspective_Matrix_Location = this.#gl.getUniformLocation(this.#program, "u_Perspective_Matrix");

    this.#gl.uniformMatrix4fv(this.#u_View_Matrix_Location, false, this.#viewMatrix);
    this.#gl.uniformMatrix4fv(this.#u_Perspective_Matrix_Location, false, this.#perspectiveMatrix);
    
    this.#gl.useProgram(this.#skyboxProgram);
    this.#u_View_Skybox_Matrix_Location = this.#gl.getUniformLocation(this.#skyboxProgram, "u_View_Skybox_Matrix");
    this.#u_Perspective_Skybox_Matrix_Location = this.#gl.getUniformLocation(this.#skyboxProgram, "u_Perspective_Skybox_Matrix");

    this.#gl.uniformMatrix4fv(this.#u_View_Skybox_Matrix_Location, false, this.#viewSkyboxMatrix);
    this.#gl.uniformMatrix4fv(this.#u_Perspective_Skybox_Matrix_Location, false, this.#perspectiveMatrix);
  }

  setRenderDistance(renderDistance) {
    this.#renderDistance = renderDistance;
  }

  updatePerspective() {
    if((this.#gl.canvas.width !== Math.round(this.#gl.canvas.clientWidth * window.devicePixelRatio)) || (this.#gl.canvas.height !== Math.round(this.#gl.canvas.clientHeight * window.devicePixelRatio))) {
      this.#gl.canvas.width = Math.round(this.#gl.canvas.clientWidth * window.devicePixelRatio);
      this.#gl.canvas.height = Math.round(this.#gl.canvas.clientHeight * window.devicePixelRatio);
      this.#gl.viewport(0, 0, this.#gl.canvas.width, this.#gl.canvas.height);

      mat4.perspective(this.#perspectiveMatrix, 45, this.#gl.canvas.width / this.#gl.canvas.height, 0.1, this.#renderDistance);
      this.#gl.useProgram(this.#program);
      this.#gl.uniformMatrix4fv(this.#u_Perspective_Matrix_Location, false, this.#perspectiveMatrix);

      this.#gl.useProgram(this.#skyboxProgram);
      this.#gl.uniformMatrix4fv(this.#u_Perspective_Skybox_Matrix_Location, false, this.#perspectiveMatrix);
    }
  }

  #updateViewMatrix(matrix) {
    mat4.multiply(this.#viewMatrix, matrix, this.#viewMatrix);
    this.#gl.useProgram(this.#program);
    this.#gl.uniformMatrix4fv(this.#u_View_Matrix_Location, false, this.#viewMatrix);
  }

  #updateViewSkyboxMatrix(matrix) {
    mat4.multiply(this.#viewSkyboxMatrix, matrix, this.#viewSkyboxMatrix);
    this.#gl.useProgram(this.#skyboxProgram);
    this.#gl.uniformMatrix4fv(this.#u_View_Skybox_Matrix_Location, false, this.#viewSkyboxMatrix);
  }

  #moveLocalX(speed) {
    const translationSpeedMatrix = mat4.create();
    return mat4.translate(translationSpeedMatrix, translationSpeedMatrix, [speed, 0.0, 0.0]);
  }

  #moveLocalY(speed) {
    const translationSpeedMatrix = mat4.create();
    return mat4.translate(translationSpeedMatrix, translationSpeedMatrix, [0.0, speed, 0.0]);
  }

  #moveLocalZ(speed) {
    const translationSpeedMatrix = mat4.create();
    return mat4.translate(translationSpeedMatrix, translationSpeedMatrix, [0.0, 0.0, speed]);
  }

  #rotateLocalX(angularVelocity) {
    const rotateSpeedMatrix = mat4.create();
    return mat4.rotateX(rotateSpeedMatrix, rotateSpeedMatrix, angularVelocity);
  }

  #rotateLocalY(angularVelocity) {
    const rotateSpeedMatrix = mat4.create();
    return mat4.rotateY(rotateSpeedMatrix, rotateSpeedMatrix, angularVelocity);
  }

  #rotateLocalZ(angularVelocity) {
    const rotateSpeedMatrix = mat4.create();
    return mat4.rotateZ(rotateSpeedMatrix, rotateSpeedMatrix, angularVelocity);
  }

  handleKeyDown(event) {
    switch(event.key) {
      case "w":
        this.#updateViewMatrix(this.#moveLocalZ(1.0));
        break;
      case "s":
        this.#updateViewMatrix(this.#moveLocalZ(-1.0));
        break;
      case "a":
        this.#updateViewMatrix(this.#moveLocalX(1.0));
        break;
      case "d":
        this.#updateViewMatrix(this.#moveLocalX(-1.0));
        break;
      case "Control":
        this.#updateViewMatrix(this.#moveLocalY(1.0));
        break;
      case " ":
        this.#updateViewMatrix(this.#moveLocalY(-1.0));
        break;
      case "ArrowRight":
        this.#updateViewMatrix(this.#rotateLocalY(0.1));
        this.#updateViewSkyboxMatrix(this.#rotateLocalY(0.1));
        break;
      case "ArrowLeft":
        this.#updateViewMatrix(this.#rotateLocalY(-0.1));
        this.#updateViewSkyboxMatrix(this.#rotateLocalY(-0.1));
        break;
      case "ArrowDown":
        this.#updateViewMatrix(this.#rotateLocalX(0.1));
        this.#updateViewSkyboxMatrix(this.#rotateLocalX(0.1));
        break;
      case "ArrowUp":
        this.#updateViewMatrix(this.#rotateLocalX(-0.1));
        this.#updateViewSkyboxMatrix(this.#rotateLocalX(-0.1));
        break;
      case "e":
        this.#updateViewMatrix(this.#rotateLocalZ(0.1));
        this.#updateViewSkyboxMatrix(this.#rotateLocalZ(0.1));
        break;
      case "q":
        this.#updateViewMatrix(this.#rotateLocalZ(-0.1));
        this.#updateViewSkyboxMatrix(this.#rotateLocalZ(-0.1));
        break;
    }
  }

  static create(gl, program, skyboxProgram) {
    return new webGlCamera(gl, program, skyboxProgram);
  }

  static getActiveCamera() {
    return webGlCamera.#activeCamera;
  }

  static setActiveCamera(camera) {
    if(webGlCamera.#activeCamera) {
      document.removeEventListener("keydown", webGlCamera.#activeCamera.handleKeyDown);
    }
    webGlCamera.#activeCamera = camera;
    document.addEventListener("keydown", webGlCamera.#activeCamera.handleKeyDown);
  }
}

export class webGlObject {
  _gl;
  _program;

  _parser;

  _positions;
  _indices;
  _positionAttributeLocation;
  _positionBuffer;

  _texcoords;
  _texcoordAttributeLocation;

  _texture;

  _image;

  _u_Scaling_Matrix_Location;
  _u_Rotation_Matrix_Location;
  _u_Translation_Matrix_Location;

  _translationArray;
  _rotationArray;
  _scalingArray;

  _translationMatrix;
  _rotationMatrix;
  _scalingMatrix;

  static currentObjects = [];

  constructor(gl, program, modelData, image) {
    this._gl = gl;
    this._program = program;

    this._parser = new OBJParser();
    this._parser.parse(modelData);

    this._positions = this._parser.getCombinedVertices();

    this._stride = 8 * Float32Array.BYTES_PER_ELEMENT;

    this._image = image;

    this._translationArray = [0.0, 0.0, 0.0];
    this._rotationArray = [0.0, 0.0, 0.0,];
    this._scalingArray = [1.0, 1.0, 1.0];

    this._translationMatrix = mat4.identity(mat4.create());
    this._rotationMatrix = mat4.identity(mat4.create());
    this._scalingMatrix = mat4.identity(mat4.create());

    this.#initBuffers();
    this.#initTexture();

    webGlObject.currentObjects.push(this);
  }

  #initBuffers() {
    this._gl.useProgram(this._program);
    this._positionAttributeLocation = this._gl.getAttribLocation(this._program, "a_Position");
    this._vertexBuffer = this._gl.createBuffer();
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vertexBuffer);
    this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(this._positions), this._gl.STATIC_DRAW);

    this._texcoordAttributeLocation = this._gl.getAttribLocation(this._program, "a_texcoord");

    this._normalAttributeLocation = this._gl.getAttribLocation(this._program, "a_normal");


    //this._indexBuffer = this._gl.createBuffer();
    //this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    //this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._indices), this._gl.STATIC_DRAW);

    this._u_Scaling_Matrix_Location = this._gl.getUniformLocation(this._program, "u_Scaling_Matrix");
    this._u_Rotation_Matrix_Location = this._gl.getUniformLocation(this._program, "u_Rotation_Matrix");
    this._u_Translation_Matrix_Location =  this._gl.getUniformLocation(this._program, "u_Translation_Matrix");

    this._gl.uniformMatrix4fv(this._u_Rotation_Matrix_Location, false, this._rotationMatrix);
    this._gl.uniformMatrix4fv(this._u_Translation_Matrix_Location, false, this._translationMatrix);
    this._gl.uniformMatrix4fv(this._u_Scaling_Matrix_Location, false, this._scalingMatrix);
  }

  #initTexture() {
    this._texture = this._gl.createTexture();
    this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture);
    
    // Временная заполняющая текстура
    this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, 1, 1, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
  
    // Загрузки изображения
    this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture);
    this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, this._image);
    this._gl.generateMipmap(this._gl.TEXTURE_2D);
    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);
    
  }

  setTranslation(translationArray) {
    this._translationArray = translationArray;
    mat4.translate(this._translationMatrix, this._translationMatrix, this._translationArray);
  }

  setRotation(rotationArray) {
    this._rotationArray = rotationArray;
    mat4.rotateX(this._rotationMatrix, this._rotationMatrix, this._rotationArray[0]);
    mat4.rotateY(this._rotationMatrix, this._rotationMatrix, this._rotationArray[1]);
    mat4.rotateZ(this._rotationMatrix, this._rotationMatrix, this._rotationArray[2]);
  }

  setScale(scalingArray) {
    this._scalingArray = scalingArray;
    mat4.scale(this._scalingMatrix, this._scalingMatrix, this._scalingArray);
  }

  render() {
    this._gl.useProgram(this._program);
    
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vertexBuffer);

    this._gl.vertexAttribPointer(this._positionAttributeLocation, 3, this._gl.FLOAT, false, this._stride, 0);
    this._gl.enableVertexAttribArray(this._positionAttributeLocation);

    // Текстура
    this._gl.vertexAttribPointer(this._texcoordAttributeLocation, 2, this._gl.FLOAT, false, this._stride, 3 * Float32Array.BYTES_PER_ELEMENT);
    this._gl.enableVertexAttribArray(this._texcoordAttributeLocation);

    // Нормали (если используются)
    this._gl.vertexAttribPointer(this._normalAttributeLocation, 3, this._gl.FLOAT, false, this._stride, 5 * Float32Array.BYTES_PER_ELEMENT);
    this._gl.enableVertexAttribArray(this._normalAttributeLocation);

    this._gl.activeTexture(this._gl.TEXTURE0);
    this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture);

    //this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);

    //this._gl.drawElements(this._gl.TRIANGLES, this._indices.length, this._gl.UNSIGNED_SHORT, 0);

    this._gl.uniformMatrix4fv(this._u_Rotation_Matrix_Location, false, this._rotationMatrix);
    this._gl.uniformMatrix4fv(this._u_Translation_Matrix_Location, false, this._translationMatrix);
    this._gl.uniformMatrix4fv(this._u_Scaling_Matrix_Location, false, this._scalingMatrix);

    this._gl.drawArrays(this._gl.TRIANGLES, 0, this._positions.length);
  }

  static async create(gl, program, modelDataPath, imagePath) {
          const modelData = await fileReader(modelDataPath);
          const image = await imageLoader(imagePath);
          return new webGlObject(gl, program, modelData, image);
      }
}

let timeThen = 0;
const frameRateHTML = document.getElementById("frameRate");
const resolutionHTML = document.getElementById("resolution");

export function frameRender(gl, timeNow, customFunc) {
  timeNow *= 0.001;
  let FPS = Math.round(1 / (timeNow - timeThen));
  frameRateHTML.innerText = FPS;
  timeThen = timeNow;

  resolutionHTML.innerText = `${gl.canvas.width}x${gl.canvas.height}`;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  webGlCamera.getActiveCamera().updatePerspective();

  webGlObject.currentObjects.forEach(object => object.render());

  if(typeof customFunc === "function") {
    customFunc();
  }

  requestAnimationFrame(timeNow => frameRender(gl, timeNow, customFunc));
}
