import { OBJParser } from "./fileLoader.js";

const mat4 = glMatrix.mat4;

export const camera = {
  translationArray: [0.0, 0.0, 0.0],
  pointView: [0.0, 0.0, 1.0],
  rotationArray: [0.0, 0.0, 0.0],

  perspectiveMatrix: mat4.create(),
  translationMatrix: mat4.create(),
  rotationMatrix: mat4.create(),
  viewMatrix: mat4.create(),

  create: function(gl, program, translationArray, rotationArray) {
    gl.useProgram(program);
    const u_View_Matrix_Location = gl.getUniformLocation(program, "u_View_Matrix");
    const u_Perspective_Matrix_Location = gl.getUniformLocation(program, "u_Perspective_Matrix");

    mat4.perspective(this.perspectiveMatrix, 45, gl.canvas.width / gl.canvas.height, 0.1, 8000);
    gl.uniformMatrix4fv(u_Perspective_Matrix_Location, false, this.perspectiveMatrix);

    window.addEventListener("resize", () => {
      gl.canvas.width = gl.canvas.clientWidth;
      gl.canvas.height = gl.canvas.clientHeight;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      mat4.perspective(this.perspectiveMatrix, 45, gl.canvas.width / gl.canvas.height, 0.1, 2000);
      gl.uniformMatrix4fv(u_Perspective_Matrix_Location, false, this.perspectiveMatrix);
    })

    this.translationArray = translationArray;
    this.rotationArray = rotationArray;

    mat4.lookAt(this.viewMatrix, this.translationArray, this.pointView, [0, 1, 0]);
    gl.uniformMatrix4fv(u_View_Matrix_Location, false, this.viewMatrix);

    document.addEventListener("keydown", (keyCode) => {
      if(keyCode.key == "ArrowLeft") {
        this.rotationArray[1] += 0.1
        this.pointView[2] = this.translationArray[2] + Math.cos(this.rotationArray[1]);
        this.pointView[0] = this.translationArray[0] + Math.sin(this.rotationArray[1]);

        mat4.lookAt(this.viewMatrix, translationArray, this.pointView, [0, 1, 0]);
        gl.uniformMatrix4fv(u_View_Matrix_Location, false, this.viewMatrix);
      }

      if(keyCode.key == "ArrowRight") {
        this.rotationArray[1] -= 0.1
        this.pointView[2] = this.translationArray[2] + Math.cos(this.rotationArray[1]);
        this.pointView[0] = this.translationArray[0] + Math.sin(this.rotationArray[1]);

        mat4.lookAt(this.viewMatrix, translationArray, this.pointView, [0, 1, 0]);
        gl.uniformMatrix4fv(u_View_Matrix_Location, false, this.viewMatrix);
      }

      if(keyCode.key == "w") {
        this.translationArray[0] = this.pointView[0];
        this.translationArray[1] = this.pointView[1];
        this.translationArray[2] = this.pointView[2];

        this.pointView[2] = this.translationArray[2] + Math.cos(this.rotationArray[1]);
        this.pointView[0] = this.translationArray[0] + Math.sin(this.rotationArray[1]);

        mat4.lookAt(this.viewMatrix, translationArray, this.pointView, [0, 1, 0]);
        gl.uniformMatrix4fv(u_View_Matrix_Location, false, this.viewMatrix);
      }
    })
  
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

    this.translationMatrix = mat4.identity(mat4.create());
    this.rotationMatrix = mat4.identity(mat4.create());
    this._scalingMatrix = mat4.identity(mat4.create());

    this.#initBuffers();
    this.#initTexture();
  }

  #initBuffers() {
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

    this._translationMatrix = mat4.create();
    this._rotationMatrix = mat4.create();
    this._scalingMatrix = mat4.create();

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
}

let timeThen = 0;
const frameRateHTML = document.getElementById("frameRate");
const resolutionHTML = document.getElementById("resolution");
const camPosHTML = document.getElementById("camPos");
const camRotHTML = document.getElementById("camRot");

export function frameRender(gl, timeNow, renderObjects) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  renderObjects.forEach(webglObject => webglObject.render());
  renderObjects[0].moveOrbit(0.01, 0);
  renderObjects[1].moveOrbit(0.1, 0.01);
  renderObjects[2].moveOrbit(0.1, 0.005);
  renderObjects[3].moveOrbit(0.1, 0.02);
  renderObjects[4].moveOrbit(0.1, 0.004);

  timeNow *= 0.001;
  frameRateHTML.innerText = Math.round(1 / (timeNow - timeThen));
  timeThen = timeNow;

  resolutionHTML.innerText = `${gl.canvas.width}x${gl.canvas.height}`;
  camPosHTML.innerText = camera.translationArray;
  camRotHTML.innerText = camera.rotationArray;

  requestAnimationFrame(timeNow => frameRender(gl, timeNow, renderObjects));
}
