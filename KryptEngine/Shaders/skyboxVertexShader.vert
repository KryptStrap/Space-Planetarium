#version 300 es
precision highp float;

in vec4 a_Position;
in vec2 a_texcoord;
in vec3 a_normal;

out vec2 v_texcoord;
out vec3 v_normal;

uniform mat4 u_View_Skybox_Matrix;
uniform mat4 u_Perspective_Skybox_Matrix;
uniform mat4 u_RenderDistance_Skybox_Matrix;

void main() {
    gl_Position = u_Perspective_Skybox_Matrix * u_View_Skybox_Matrix * u_RenderDistance_Skybox_Matrix * a_Position;
    v_texcoord = vec2(a_texcoord.x, 1.0 - a_texcoord.y);
    v_normal = a_normal;
    }