#version 300 es
precision highp float;

in vec2 v_Texcoord;
in vec3 v_Normal;

out vec4 outColor;

uniform sampler2D u_Texture;

void main() {
    outColor = texture(u_Texture, v_Texcoord) * vec4(0.5, 0.5, 0.5, 1);
}