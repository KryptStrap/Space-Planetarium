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

    mat4.perspective(this.perspectiveMatrix, 45, gl.canvas.width / gl.canvas.height, 0.1, 2000);
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

  _positions;
  _indices;
  _color;
  
  _positionAttributeLocation;
  _positionBuffer;
  _colorAttributeLocation;
  _colorBuffer;

  _u_Scaling_Matrix_Location;
  _u_Rotation_Matrix_Location;
  _u_Translation_Matrix_Location;

  _translationArray;
  _rotationArray;
  _scalingArray;

  _translationMatrix;
  _rotationMatrix;
  _scalingMatrix;

  _primitives;

  constructor(gl, program, positions, color, indices) {
    this._gl = gl;
    this._program = program;

    this._positions = positions;
    this._indices =  indices;
    this._color = color;

    this._translationArray = [0.0, 0.0, 0.0];
    this._rotationArray = [0.0, 0.0, 0.0,];
    this._scalingArray = [1.0, 1.0, 1.0];

    this.#initBuffers();

  }

  

  #initBuffers() {
    this._positionAttributeLocation = this._gl.getAttribLocation(this._program, "a_Position");
    this._positionBuffer = this._gl.createBuffer();
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._positionBuffer);
    this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(this._positions), this._gl.STATIC_DRAW);

    this._indexBuffers = this._indices.map(face => {
      const buffer = this._gl.createBuffer();
      this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, buffer);
      this._gl.bufferData(
          this._gl.ELEMENT_ARRAY_BUFFER,
          new Uint16Array(face),
          this._gl.STATIC_DRAW
      );
      return buffer;
    });

    this._colorAttributeLocation = this._gl.getAttribLocation(this._program, "a_Color");
    this._colorBuffer = this._gl.createBuffer();
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._colorBuffer);
    this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(this._color), this._gl.STATIC_DRAW);

    this._u_Scaling_Matrix_Location = this._gl.getUniformLocation(this._program, "u_Scaling_Matrix");
    this._u_Rotation_Matrix_Location = this._gl.getUniformLocation(this._program, "u_Rotation_Matrix");
    this._u_Translation_Matrix_Location =  this._gl.getUniformLocation(this._program, "u_Translation_Matrix");

    this._translationMatrix = mat4.identity(mat4.create());
    this._rotationMatrix = mat4.identity(mat4.create());
    this._scalingMatrix = mat4.identity(mat4.create());

    this._gl.uniformMatrix4fv(this._u_Rotation_Matrix_Location, false, this._rotationMatrix);
    this._gl.uniformMatrix4fv(this._u_Translation_Matrix_Location, false, this._translationMatrix);
    this._gl.uniformMatrix4fv(this._u_Scaling_Matrix_Location, false, this._scalingMatrix);
  }

  setTranslation(translationArray) {
    this._translationArray = translationArray;
    this._translationMatrix = mat4.identity(this._translationMatrix);
    mat4.translate(this._translationMatrix, this._translationMatrix, this._translationArray);
  }

  setRotation(rotationArray) {
    this._rotationArray = rotationArray;
    this._rotationMatrix = mat4.identity(this._rotationMatrix);
    mat4.rotateX(this._rotationMatrix, this._rotationMatrix, this._rotationArray[0]);
    mat4.rotateY(this._rotationMatrix, this._rotationMatrix, this._rotationArray[1]);
    mat4.rotateZ(this._rotationMatrix, this._rotationMatrix, this._rotationArray[2]);
  }

  setScale(scalingArray) {
    this._scalingArray = scalingArray;
    this._scalingMatrix = mat4.identity(this._scalingMatrix);
    mat4.scale(this._scalingMatrix, this._scalingMatrix, this._scalingArray);
  }

  render() {
    this._gl.useProgram(this._program);
    
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._positionBuffer);
    this._gl.vertexAttribPointer(this._positionAttributeLocation, 3, this._gl.FLOAT, false, 0, 0);
    this._gl.enableVertexAttribArray(this._positionAttributeLocation);

    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._colorBuffer);
    this._gl.vertexAttribPointer(this._colorAttributeLocation, 4, this._gl.FLOAT, false, 0, 0);
    this._gl.enableVertexAttribArray(this._colorAttributeLocation);

    this._indices.forEach((face, index) => {
      const buffer = this._indexBuffers[index];
      this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, buffer);

      if (face.length === 4) {
        this._gl.drawElements(this._gl.TRIANGLE_FAN, face.length, this._gl.UNSIGNED_SHORT, 0);
      } else if (face.length === 3) {
          this._gl.drawElements(this._gl.TRIANGLES, face.length, this._gl.UNSIGNED_SHORT, 0);
        }
    });

    this._gl.uniformMatrix4fv(this._u_Translation_Matrix_Location, false, this._translationMatrix);
    this._gl.uniformMatrix4fv(this._u_Rotation_Matrix_Location, false, this._rotationMatrix);
    this._gl.uniformMatrix4fv(this._u_Scaling_Matrix_Location, false, this._scalingMatrix);
  }
}

let timeThen = 0;
const frameRateHTML = document.getElementById("frameRate");
const resolutionHTML = document.getElementById("resolution");
const camPosHTML = document.getElementById("camPos");
const camRotHTML = document.getElementById("camRot");

export function renderObjects(gl, objArray, timeNow) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  objArray.forEach(webglObject => webglObject.render());
  objArray[1].moveOrbit(0.01);
  objArray[2].moveOrbit(0.04);

  timeNow *= 0.001;
  frameRateHTML.innerText = Math.round(1 / (timeNow - timeThen));
  timeThen = timeNow;

  resolutionHTML.innerText = `${gl.canvas.width}x${gl.canvas.height}`;
  camPosHTML.innerText = camera.translationArray;
  camRotHTML.innerText = camera.rotationArray;

  requestAnimationFrame(timeNow => renderObjects(gl, objArray, timeNow));
}
