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
  #gl;
  #program;

  #positions;
  #color;
  
  #positionAttributeLocation;
  #positionBuffer;
  #colorAttributeLocation;
  #colorBuffer;

  #u_Scaling_Matrix_Location;
  #u_Rotation_Matrix_Location;
  #u_Translation_Matrix_Location;

  #translationMatrix;
  #rotationMatrix;
  #scalingMatrix;

  #primitives;

  constructor(gl, program, positions, color, primitives) {
    this.#gl = gl;
    this.#program = program;
    this.#positions = positions;
    this.#color = color;

    this.#translationMatrix = mat4.create();
    this.#rotationMatrix = mat4.create();
    this.#scalingMatrix = mat4.create();
    
    switch(primitives) {
      case "triangles":
      this.#primitives = this.#gl.TRIANGLES;
      break;
      case "lines":
        this.#primitives = this.#gl.LINES;
        break;
      case "points":
        this.#primitives = this.#gl.POINTS;
        break;
    }

    this.#initBuffers();

  }

  #initBuffers() {
    this.#positionAttributeLocation = this.#gl.getAttribLocation(this.#program, "a_Position");
    this.#positionBuffer = this.#gl.createBuffer();
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#positionBuffer);
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(this.#positions), this.#gl.STATIC_DRAW);

    this.#colorAttributeLocation = this.#gl.getAttribLocation(this.#program, "a_Color");
    this.#colorBuffer = this.#gl.createBuffer();
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#colorBuffer);
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(this.#color), this.#gl.STATIC_DRAW);

    this.#u_Scaling_Matrix_Location = this.#gl.getUniformLocation(this.#program, "u_Scaling_Matrix");

    this.#u_Rotation_Matrix_Location = this.#gl.getUniformLocation(this.#program, "u_Rotation_Matrix");

    this.#u_Translation_Matrix_Location =  this.#gl.getUniformLocation(this.#program, "u_Translation_Matrix");
  }

  setTranslation(translationArray) {
    mat4.translate(this.#translationMatrix, this.#translationMatrix, translationArray);
  }

  setRotation(rotationArray) {
    mat4.rotateX(this.#rotationMatrix, this.#rotationMatrix, rotationArray[0]);
    mat4.rotateY(this.#rotationMatrix, this.#rotationMatrix, rotationArray[1]);
    mat4.rotateZ(this.#rotationMatrix, this.#rotationMatrix, rotationArray[2]);
  }

  setScale(scalingArray) {
    mat4.scale(this.#scalingMatrix, this.#scalingMatrix, scalingArray);
  }

  render() {
    this.#gl.useProgram(this.#program);
    this.#gl.enableVertexAttribArray(this.#positionAttributeLocation);
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#positionBuffer);
    this.#gl.vertexAttribPointer(this.#positionAttributeLocation, 3, this.#gl.FLOAT, false, 0, 0);
    this.#gl.enableVertexAttribArray(this.#colorAttributeLocation);
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#colorBuffer);
    this.#gl.vertexAttribPointer(this.#colorAttributeLocation, 4, this.#gl.FLOAT, false, 0, 0);

    this.#gl.uniformMatrix4fv(this.#u_Scaling_Matrix_Location, false, this.#scalingMatrix);
    this.#gl.uniformMatrix4fv(this.#u_Rotation_Matrix_Location, false, this.#rotationMatrix);

    this.#gl.uniformMatrix4fv(this.#u_Translation_Matrix_Location, false, this.#translationMatrix);
    

    this.#gl.drawArrays(this.#primitives, 0, this.#positions.length / 3);
  }
}

let timeThen = 0;
const frameRateHTML = document.getElementById("frameRate");
const resolutionHTML = document.getElementById("resolution");
const camPosHTML = document.getElementById("camPos");
const camRotHTML = document.getElementById("camRot");

export function renderObjects(gl, objArray, timeNow) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  objArray.map(webglObject => webglObject.render());

  timeNow *= 0.001;
  frameRateHTML.innerText = Math.round(1 / (timeNow - timeThen));
  timeThen = timeNow;

  resolutionHTML.innerText = `${gl.canvas.width}x${gl.canvas.height}`;
  camPosHTML.innerText = camera.translationArray;
  camRotHTML.innerText = camera.rotationArray;

  requestAnimationFrame(timeNow => renderObjects(gl, objArray, timeNow));
}
