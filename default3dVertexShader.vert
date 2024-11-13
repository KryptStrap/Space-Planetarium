attribute vec4 a_Position;

uniform mat4 u_Scale_Matrix;
uniform mat4 u_Rotation_Matrix[3];
uniform mat4 u_Translation_Matrix;
uniform mat4 u_Perspective_Matrix;

attribute vec4 a_Colors;
varying vec4 v_Colors;

void main() {
    mat4 transformMatrix = u_Translation_Matrix * (u_Rotation_Matrix[0] * u_Rotation_Matrix[1] * u_Rotation_Matrix[2]) * u_Scale_Matrix;
    gl_Position = u_Perspective_Matrix * transformMatrix * a_Position;
    v_Colors = a_Colors;
}