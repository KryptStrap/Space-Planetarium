#version 300 es
precision highp float;

in vec4 v_Position;
in vec2 v_Texcoord;
in vec3 v_Normal;

out vec4 outColor;

uniform sampler2D u_Texture;
uniform vec4 u_Color;



uniform vec3 u_LightPosition;
uniform float u_LightIntensity;
uniform vec3 u_LightColor;

void main() {
    vec3 lightDir = normalize(u_LightPosition - vec3(v_Position.xyz));

    float diffuse = max(dot(v_Normal, lightDir), 0.0);

    vec3 finalColor = texture(u_Texture, v_Texcoord).rgb * diffuse * u_LightIntensity * u_LightColor;

    outColor = vec4(finalColor, 1.0) * u_Color;
}