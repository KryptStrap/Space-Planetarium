#version 300 es
precision highp float;

in vec2 v_texcoord;
in vec3 v_normal;

out vec4 outColor;

uniform sampler2D u_texture;
uniform vec4 u_color;

void main() {
    outColor = texture(u_texture, v_texcoord) * u_color;
}