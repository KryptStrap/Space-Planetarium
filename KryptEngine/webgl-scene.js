const mat4 = glMatrix.mat4;

export class GLCamera {
  _gl;
  _programs;
  _skyboxProgram;

  _viewMatrix = mat4.identity(mat4.create());
  _viewSkyboxMatrix = mat4.identity(mat4.create());
  _perspectiveMatrix = mat4.identity(mat4.create());
  _renderDistanceMatrix = mat4.identity(mat4.create());
  renderDistance = 1;


  _uniformsArray = [];
  _uPerspectiveSkyboxMatrixLocation;
  _uRenderDistanceSkyboxMatrixLocation;
  _uViewSkyboxMatrixLocation;


  static currentObjects = [];
  static activeCamera;

  constructor(gl, programs, skyboxProgram) {
    this._gl = gl;
    this._programs = programs;
    this._skyboxProgram = skyboxProgram;

    this.#initGLCamera();
    GLCamera.currentObjects.push(this);
  };

  #initGLCamera() {
    this._gl.canvas.width = Math.round(this._gl.canvas.clientWidth * window.devicePixelRatio);
    this._gl.canvas.height = Math.round(this._gl.canvas.clientHeight * window.devicePixelRatio);
    this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);

    mat4.perspective(this._perspectiveMatrix, 45, this._gl.canvas.width / this._gl.canvas.height, 0.1, this.renderDistance * Math.sqrt(3));

    for(const program of this._programs) {
      this._gl.useProgram(program);

      this._uniformsArray.push({
        program: program,
        uViewMatrixLocation: this._gl.getUniformLocation(program, "u_ViewMatrix"),
        uPerspectiveMatrixLocation: this._gl.getUniformLocation(program, "u_PerspectiveMatrix")
      });
    };
    
    /*this._gl.useProgram(this._program);
    this._uViewMatrixLocationArray = this._gl.getUniformLocation(this._program, "u_ViewMatrix");
    this._uPerspectiveMatrixLocationArray = this._gl.getUniformLocation(this._program, "u_PerspectiveMatrix");*/
    
    this._gl.useProgram(this._skyboxProgram);
    this._uViewSkyboxMatrixLocation = this._gl.getUniformLocation(this._skyboxProgram, "u_ViewSkyboxMatrix");
    this._uPerspectiveSkyboxMatrixLocation = this._gl.getUniformLocation(this._skyboxProgram, "u_PerspectiveSkyboxMatrix");
    this._uRenderDistanceSkyboxMatrixLocation = this._gl.getUniformLocation(this._skyboxProgram, "u_RenderDistanceSkyboxMatrix");
  };

  updateStatus() {
    for(const uniform of this._uniformsArray) {
      this._gl.useProgram(uniform.program);
      this._gl.uniformMatrix4fv(uniform.uViewMatrixLocation, false, this._viewMatrix);
      this._gl.uniformMatrix4fv(uniform.uPerspectiveMatrixLocation, false, this._perspectiveMatrix);
    };

    /*this._gl.useProgram(this._program);
    this._gl.uniformMatrix4fv(this._uViewMatrixLocation, false, this._viewMatrix);
    this._gl.uniformMatrix4fv(this._uPerspectiveMatrixLocation, false, this._perspectiveMatrix);*/

    this._gl.useProgram(this._skyboxProgram);
    this._gl.uniformMatrix4fv(this._uViewSkyboxMatrixLocation, false, this._viewSkyboxMatrix);
    this._gl.uniformMatrix4fv(this._uPerspectiveSkyboxMatrixLocation, false, this._perspectiveMatrix);
    this._gl.uniformMatrix4fv(this._uRenderDistanceSkyboxMatrixLocation, false, mat4.scale(this._renderDistanceMatrix, mat4.create(), [-this.renderDistance, -this.renderDistance, -this.renderDistance]));

    if((this._gl.canvas.width !== Math.floor(this._gl.canvas.clientWidth * window.devicePixelRatio)) || (this._gl.canvas.height !== Math.floor(this._gl.canvas.clientHeight * window.devicePixelRatio))) {
      this._gl.canvas.width = Math.floor(this._gl.canvas.clientWidth * window.devicePixelRatio);
      this._gl.canvas.height = Math.floor(this._gl.canvas.clientHeight * window.devicePixelRatio);
      this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);

      mat4.perspective(this._perspectiveMatrix, 45, this._gl.canvas.width / this._gl.canvas.height, 0.1, this.renderDistance * Math.sqrt(3));
     // this._gl.useProgram(this._program);
     // this._gl.uniformMatrix4fv(this._uPerspectiveMatrixLocation, false, this._perspectiveMatrix);

      //this._gl.useProgram(this._skyboxProgram);
      //this._gl.uniformMatrix4fv(this._uPerspectiveSkyboxMatrixLocation, false, this._perspectiveMatrix);
    };
  };

  set position(positionArray) {
    mat4.translate(this._viewMatrix, this._viewMatrix, positionArray);
    mat4.invert(this._viewMatrix, this._viewMatrix);
  };

  set rotation(rotationArray) {
    mat4.rotateZ(this._viewMatrix, this._viewMatrix, rotationArray[2]);
    mat4.rotateY(this._viewMatrix, this._viewMatrix, rotationArray[1]);
    mat4.rotateX(this._viewMatrix, this._viewMatrix, rotationArray[0]);

    mat4.rotateZ(this._viewSkyboxMatrix, this._viewMatrix, rotationArray[2]);
    mat4.rotateY(this._viewSkyboxMatrix, this._viewMatrix, rotationArray[1]);
    mat4.rotateX(this._viewSkyboxMatrix, this._viewMatrix, rotationArray[0]);
  };

  static create(gl, program, skyboxProgram) {
    return new GLCamera(gl, program, skyboxProgram);
  };


};

export class GLModel {
  _gl;
  _program;

  //_indices;
  _aPositionLocation;

  _aTexcoordLocation;

  _bufferData;

  color = [1.0, 1.0, 1.0, 1.0];

  _uPositionMatrixLocation;
  _uRotationMatrixLocation;
  _uScalingMatrixLocation;

  _uColorLocation;

  _positionArray = [0.0, 0.0, 0.0];
  _rotationArray = [0.0, 0.0, 0.0,];
  _scaleArray = [1.0, 1.0, 1.0];

  _positionMatrix = mat4.identity(mat4.create());
  _rotationMatrix = mat4.identity(mat4.create());
  _scaleMatrix = mat4.identity(mat4.create());

  static currentObjects = [];

  constructor(gl, program, bufferData, texture) {
    this._gl = gl;
    this._program = program;

    this._bufferData = bufferData;
    this._texture = texture;

    this._stride = 8 * Float32Array.BYTES_PER_ELEMENT;

    this.#initGLModel();

    GLModel.currentObjects.push(this);
  };

  #initGLModel() {
    this._gl.useProgram(this._program);
    this._aPositionLocation = this._gl.getAttribLocation(this._program, "a_Position");

    this._aTexcoordLocation = this._gl.getAttribLocation(this._program, "a_Texcoord");

    this._aNormalLocation = this._gl.getAttribLocation(this._program, "a_Normal");

    //this._indexBuffer = this._gl.createBuffer();
    //this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    //this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._indices), this._gl.STATIC_DRAW);

    this._uPositionMatrixLocation =  this._gl.getUniformLocation(this._program, "u_PositionMatrix");
    this._uRotationMatrixLocation = this._gl.getUniformLocation(this._program, "u_RotationMatrix");
    this._uScaleMatrixLocation = this._gl.getUniformLocation(this._program, "u_ScaleMatrix");

    this._uColorLocation =  this._gl.getUniformLocation(this._program, "u_Color");
  };

  get position() {
    return this._positionArray;
  };

  set position(positionArray) {
    this._positionArray = positionArray;
    mat4.translate(this._positionMatrix, this._positionMatrix, this._positionArray);
  };

  get rotation() {
    return this._rotationArray;
  };

  set rotation(rotationArray) {
    this._rotationArray = rotationArray;
    mat4.rotateZ(this._rotationMatrix, this._rotationMatrix, this._rotationArray[2]);
    mat4.rotateY(this._rotationMatrix, this._rotationMatrix, this._rotationArray[1]);
    mat4.rotateX(this._rotationMatrix, this._rotationMatrix, this._rotationArray[0]);
  }
  get scale() {
    return this._scaleArray;
  };

  set scale(scaleArray) {
    this._scaleArray = scaleArray;
    mat4.scale(this._scaleMatrix, this._scaleMatrix, this._scaleArray);
  };

  render() {
    this._gl.useProgram(this._program);
    
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._bufferData.buffer);

    this._gl.vertexAttribPointer(this._aPositionLocation, 3, this._gl.FLOAT, false, this._stride, 0);
    this._gl.enableVertexAttribArray(this._aPositionLocation);

    // Текстура
    this._gl.vertexAttribPointer(this._aTexcoordLocation, 2, this._gl.FLOAT, false, this._stride, 3 * Float32Array.BYTES_PER_ELEMENT);
    this._gl.enableVertexAttribArray(this._aTexcoordLocation);

    // Нормали (если используются)
    this._gl.vertexAttribPointer(this._aNormalLocation, 3, this._gl.FLOAT, false, this._stride, 5 * Float32Array.BYTES_PER_ELEMENT);
    this._gl.enableVertexAttribArray(this._aNormalLocation);

    this._gl.activeTexture(this._gl.TEXTURE0);
    this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture);

    //this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);

    //this._gl.drawElements(this._gl.TRIANGLES, this._indices.length, this._gl.UNSIGNED_SHORT, 0);

    this._gl.uniformMatrix4fv(this._uPositionMatrixLocation, false, this._positionMatrix);
    this._gl.uniformMatrix4fv(this._uRotationMatrixLocation, false, this._rotationMatrix);
    this._gl.uniformMatrix4fv(this._uScaleMatrixLocation, false, this._scaleMatrix);
    this._gl.uniform4fv(this._uColorLocation, this.color);

    this._gl.drawArrays(this._gl.TRIANGLES, 0, this._bufferData.vertexCount);
  };

  static async create(gl, program, modelData, image) {
    return new GLModel(gl, program, modelData, image);
  };
};

export class GLLight {
  _gl;
  _programs;

  _uniformsArray = [];

  _positionArray = [0.0, 0.0, 0.0];
  _intensity = 1.0;
  _color = [1.0, 1.0, 1.0];

  static currentObjects = [];

  constructor(gl, programs) {
    this._gl = gl;
    this._programs = programs;

    this.#initGLLight();
    GLLight.currentObjects.push(this);
  };

  #initGLLight() {
    for(const program of this._programs) {
      this._gl.useProgram(program);

      this._uniformsArray.push({
        program: program,
        uLightPositionLocation: this._gl.getUniformLocation(program, "u_LightPosition"),
        uLightIntensityLocation: this._gl.getUniformLocation(program, "u_LightIntensity"),
        uLightColorLocation: this._gl.getUniformLocation(program, "u_LightColor"),
        uNumberLightSources: this._gl.getUniformLocation(program, "u_NumberLightSources")

      });
    };

    for(const uniform of this._uniformsArray) {
      this._gl.useProgram(uniform.program);

      this._gl.uniform3fv(uniform.uLightPositionLocation, this._positionArray);
      this._gl.uniform1f(uniform.uLightIntensityLocation, this._intensity);
      this._gl.uniform3fv(uniform.uLightColorLocation, this._color);
    };
  };

  static create(gl, programs) {
    return new GLLight(gl, programs);
  }
};

export const frameRender = (gl, timeNow, timeThen, callback) => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  GLCamera.activeCamera.updateStatus();

  GLModel.currentObjects.forEach(object => object.render());

  timeNow *= 0.001;

  if (typeof callback === "function") {
    try {
      callback(timeNow - timeThen);
    } catch (error) {
      console.error("An error occurred while executing the function:", error);
    };
  } else {
    console.error("The passed argument is not a function.");
  };

  timeThen = timeNow;
  
  requestAnimationFrame(timeNow => frameRender(gl, timeNow, timeThen, callback));
};
