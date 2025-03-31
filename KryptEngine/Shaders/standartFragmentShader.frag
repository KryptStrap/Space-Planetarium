#version 300 es
precision highp float;

in vec2 v_Texcoord;
in vec3 v_Normal;

out vec4 outColor;

uniform sampler2D u_Texture;
uniform vec4 u_Color;

void main() {
    outColor = texture(u_Texture, v_Texcoord) * u_Color;
}