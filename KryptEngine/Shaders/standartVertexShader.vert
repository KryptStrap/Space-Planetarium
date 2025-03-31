#version 300 es
precision highp float;

in vec4 a_Position;
in vec2 a_Texcoord;
in vec3 a_Normal;

out vec2 v_Texcoord;

uniform mat4 u_PositionMatrix;
uniform mat4 u_RotationMatrix;
uniform mat4 u_ScaleMatrix;

uniform mat4 u_PerspectiveMatrix;
uniform mat4 u_ViewMatrix;

void main() {
    mat4 transformMatrix = u_PositionMatrix * u_RotationMatrix * u_ScaleMatrix;
    gl_Position = u_PerspectiveMatrix * u_ViewMatrix * transformMatrix * a_Position;
    
    v_Texcoord = vec2(a_Texcoord.x, 1.0 - a_Texcoord.y);
    }