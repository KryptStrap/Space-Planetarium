#version 300 es
precision highp float;

in vec4 a_Position;
in vec2 a_Texcoord;
in vec3 a_Normal;

out vec4 v_Position;
out vec2 v_Texcoord;
out vec3 v_Normal;

uniform mat4 u_PerspectiveMatrix;
uniform mat4 u_ViewMatrix;

uniform mat4 u_PositionMatrix;
uniform mat4 u_RotationMatrix;
uniform mat4 u_ScaleMatrix;

void main() {
    mat4 transformMatrix = u_PositionMatrix * u_RotationMatrix * u_ScaleMatrix;
    v_Position = transformMatrix * a_Position;
    gl_Position = u_PerspectiveMatrix * u_ViewMatrix * v_Position;
    
    v_Texcoord = vec2(a_Texcoord.x, 1.0 - a_Texcoord.y);

    mat3 normalMatrix = transpose(inverse(mat3(transformMatrix)));
    v_Normal = normalize(normalMatrix * a_Normal);
}