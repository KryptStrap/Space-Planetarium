#version 300 es
precision mediump float;

in vec4 a_Position;
in vec2 a_texcoord;
in vec3 a_normal;

out vec2 v_texcoord;
out vec3 v_normal;

uniform mat4 u_Scaling_Matrix;
uniform mat4 u_Rotation_Matrix;
uniform mat4 u_Translation_Matrix;
uniform mat4 u_Perspective_Matrix;
uniform mat4 u_View_Matrix;

void main() {
    mat4 transformMatrix = u_Translation_Matrix * u_Rotation_Matrix * u_Scaling_Matrix;
    gl_Position = u_Perspective_Matrix * u_View_Matrix * transformMatrix * a_Position;
    v_texcoord = vec2(a_texcoord.x, 1.0 - a_texcoord.y);
    v_normal = a_normal;
    }