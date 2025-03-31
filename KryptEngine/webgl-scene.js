import { OBJParser } from "./fileLoader.js";
import { fileReader, imageLoader } from "./fileLoader.js";

const mat4 = glMatrix.mat4;

export class GLCamera {
  _gl;
  _program;
  _skyboxProgram;

  _viewMatrix = mat4.identity(mat4.create());
  _viewSkyboxMatrix = mat4.identity(mat4.create());
  _perspectiveMatrix = mat4.identity(mat4.create());
  _renderDistanceMatrix = mat4.identity(mat4.create());
  _renderDistance = 1;

  _u_Perspective_Matrix_Location;
  _u_Perspective_Skybox_Matrix_Location;
  _u_RenderDistance_Skybox_Matrix_Location
  _u_View_Matrix_Location;
  _u_View_Skybox_Matrix_Location;


  static currentObjects = [];
  static activeCamera;

  constructor(gl, program, skyboxProgram) {
    this._gl = gl;
    this._program = program;
    this._skyboxProgram = skyboxProgram;

    this.#initCamera();
    GLCamera.currentObjects.push(this);
  }

  #initCamera() {
    this._gl.canvas.width = Math.round(this._gl.canvas.clientWidth * window.devicePixelRatio);
    this._gl.canvas.height = Math.round(this._gl.canvas.clientHeight * window.devicePixelRatio);
    this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);

    mat4.perspective(this._perspectiveMatrix, 45, this._gl.canvas.width / this._gl.canvas.height, 0.1, this.renderDistance * Math.sqrt(3));
    
    this._gl.useProgram(this._program);
    this._u_View_Matrix_Location = this._gl.getUniformLocation(this._program, "u_View_Matrix");
    this._u_Perspective_Matrix_Location = this._gl.getUniformLocation(this._program, "u_Perspective_Matrix");

    this._gl.uniformMatrix4fv(this._u_View_Matrix_Location, false, this._viewMatrix);
    this._gl.uniformMatrix4fv(this._u_Perspective_Matrix_Location, false, this._perspectiveMatrix);
    
    this._gl.useProgram(this._skyboxProgram);
    this._u_View_Skybox_Matrix_Location = this._gl.getUniformLocation(this._skyboxProgram, "u_View_Skybox_Matrix");
    this._u_Perspective_Skybox_Matrix_Location = this._gl.getUniformLocation(this._skyboxProgram, "u_Perspective_Skybox_Matrix");
    this._u_RenderDistance_Skybox_Matrix_Location = this._gl.getUniformLocation(this._skyboxProgram, "u_RenderDistance_Skybox_Matrix");

    this._gl.uniformMatrix4fv(this._u_View_Skybox_Matrix_Location, false, this._viewSkyboxMatrix);
    this._gl.uniformMatrix4fv(this._u_Perspective_Skybox_Matrix_Location, false, this._perspectiveMatrix);
    this._gl.uniformMatrix4fv(this._u_RenderDistance_Skybox_Matrix_Location, false, mat4.scale(this._renderDistanceMatrix, this._renderDistanceMatrix, [this._renderDistance, this._renderDistance, this._renderDistance]));
  }

  updatePerspective() {
    if((this._gl.canvas.width !== Math.floor(this._gl.canvas.clientWidth * window.devicePixelRatio)) || (this._gl.canvas.height !== Math.floor(this._gl.canvas.clientHeight * window.devicePixelRatio))) {
      this._gl.canvas.width = Math.floor(this._gl.canvas.clientWidth * window.devicePixelRatio);
      this._gl.canvas.height = Math.floor(this._gl.canvas.clientHeight * window.devicePixelRatio);
      this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);

      mat4.perspective(this._perspectiveMatrix, 45, this._gl.canvas.width / this._gl.canvas.height, 0.1, this.renderDistance * Math.sqrt(3));
      this._gl.useProgram(this._program);
      this._gl.uniformMatrix4fv(this._u_Perspective_Matrix_Location, false, this._perspectiveMatrix);

      this._gl.useProgram(this._skyboxProgram);
      this._gl.uniformMatrix4fv(this._u_Perspective_Skybox_Matrix_Location, false, this._perspectiveMatrix);
    }
  }

  get renderDistance() {
    return this._renderDistance;
  }

  set renderDistance(value) {
    this._renderDistance = value;
    this._gl.uniformMatrix4fv(this._u_RenderDistance_Skybox_Matrix_Location, false, mat4.scale(this._renderDistanceMatrix, this._renderDistanceMatrix, [-this._renderDistance, -this._renderDistance, -this._renderDistance]));
  }

  static create(gl, program, skyboxProgram) {
    return new GLCamera(gl, program, skyboxProgram);
  }
}

export class GLModel {
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
  color = [1.0, 1.0, 1.0, 1.0];

  _u_Scaling_Matrix_Location;
  _u_Rotation_Matrix_Location;
  _u_Translation_Matrix_Location;

  _u_Color_Vector4_Location;

  _translationArray = [0.0, 0.0, 0.0];
  _rotationArray = [0.0, 0.0, 0.0,];
  _scalingArray = [1.0, 1.0, 1.0];

  _translationMatrix = mat4.identity(mat4.create());
  _rotationMatrix = mat4.identity(mat4.create());
  _scalingMatrix = mat4.identity(mat4.create());

  static currentObjects = [];

  constructor(gl, program, modelData, image) {
    this._gl = gl;
    this._program = program;

    this._parser = new OBJParser();
    this._parser.parse(modelData);

    this._positions = this._parser.getCombinedVertices();

    this._stride = 8 * Float32Array.BYTES_PER_ELEMENT;

    this._image = image;

    this.#initBuffers();
    this.#initTexture();

    GLModel.currentObjects.push(this);
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

    this._u_Color_Vector4_Location =  this._gl.getUniformLocation(this._program, "u_color");
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
    this._gl.uniform4fv(this._u_Color_Vector4_Location, this.color);

    this._gl.drawArrays(this._gl.TRIANGLES, 0, this._positions.length / 8);
  }

  static async create(gl, program, modelDataPath, imagePath) {
          const modelData = await fileReader(modelDataPath);
          const image = await imageLoader(imagePath);
          return new GLModel(gl, program, modelData, image);
      }
}

let timeThen = 0;
let deltaTime = 1;

export function frameRender(gl, timeNow, func) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  GLCamera.activeCamera.updatePerspective();

  GLModel.currentObjects.forEach(object => object.render());

  timeNow *= 0.001;
  deltaTime = timeNow - timeThen;
  timeThen = timeNow;

  if (typeof func === "function") {
    try {
      func(deltaTime);
    } catch (error) {
      console.error("An error occurred while executing the function:", error);
    }
  } else {
    console.error("The passed argument is not a function.");
  };
  
  requestAnimationFrame(timeNow => frameRender(gl, timeNow, func));
}
