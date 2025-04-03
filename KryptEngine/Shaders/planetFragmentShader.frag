#version 300 es
precision highp float;

in vec2 v_Texcoord;
in vec3 v_Normal;

out vec4 outColor;

uniform sampler2D u_Texture;
uniform vec4 u_Color;

void main() {
    vec3 normal = normalize(v_Normal);
    vec3 lightDir = normalize(vec3(0.0, 0.0, -1.0));

    float diffuse = max(dot(normal, lightDir), 0.0);

    vec3 finalColor = texture(u_Texture, v_Texcoord).rgb * diffuse;

    outColor = vec4(finalColor, 1.0) * u_Color;
}