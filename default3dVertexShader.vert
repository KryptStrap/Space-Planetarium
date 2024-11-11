attribute vec4 a_Position;

uniform mat4 u_Scale_Matrix;
uniform mat4 u_RotationX_Matrix;
uniform mat4 u_RotationY_Matrix;
uniform mat4 u_RotationZ_Matrix;
uniform mat4 u_Translation_Matrix;
uniform mat4 u_Perspective_Matrix;

attribute vec4 a_Colors;
varying vec4 v_Colors;

void main() {
    mat4 transformMatrix = u_Translation_Matrix * (u_RotationX_Matrix * u_RotationY_Matrix * u_RotationZ_Matrix) * u_Scale_Matrix;
    gl_Position = u_Perspective_Matrix * transformMatrix * a_Position;
    v_Colors = a_Colors;
}