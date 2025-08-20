uniform sampler2D uTexture;
uniform vec3 uColor;

varying vec3 vColor;
void main(){

    float textureAlpha = texture(uTexture,gl_PointCoord).r;

    vec3 color = mix(vec3(0.0,0.0,0.0),vColor,textureAlpha);

    gl_FragColor = vec4(color,textureAlpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}