#version 300 es
precision mediump float;

in vec4 a_Position;
in vec4 a_Color;
out vec4 v_Color;

uniform mat4 u_Scaling_Matrix;
uniform mat4 u_Rotation_Matrix;
uniform mat4 u_Translation_Matrix;
uniform mat4 u_Perspective_Matrix;
uniform mat4 u_View_Matrix;

void main() {
    mat4 transformMatrix = u_Translation_Matrix * u_Rotation_Matrix * u_Scaling_Matrix;
    gl_Position = u_Perspective_Matrix * u_View_Matrix * transformMatrix * a_Position;
    v_Color = a_Color;   
}