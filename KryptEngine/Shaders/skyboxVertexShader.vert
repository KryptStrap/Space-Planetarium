#version 300 es
precision highp float;

in vec4 a_Position;
in vec2 a_Texcoord;
in vec3 a_Normal;

out vec2 v_Texcoord;
out vec3 v_Normal;

uniform mat4 u_ViewSkyboxMatrix;
uniform mat4 u_PerspectiveSkyboxMatrix;
uniform mat4 u_RenderDistanceSkyboxMatrix;

void main() {
    gl_Position = u_PerspectiveSkyboxMatrix * u_ViewSkyboxMatrix * u_RenderDistanceSkyboxMatrix * a_Position;
    v_Texcoord = vec2(a_Texcoord.x, 1.0 - a_Texcoord.y);
    v_Normal = a_Normal;
    }