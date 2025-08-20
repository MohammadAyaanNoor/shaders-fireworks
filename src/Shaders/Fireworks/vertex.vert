uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

attribute float aSize;
attribute float aTimeMultiplier;
attribute vec3 aColor;

varying vec3 vColor;

#include ../includes/remap.vert

void main(){
    float progress = uProgress * aTimeMultiplier;
    vec3 newPosition = position;
    //exploading
    float exploadingProgress = remap(progress,0.0,0.1,0.0,1.0);
    exploadingProgress = clamp(exploadingProgress,0.0,1.0);
    exploadingProgress = 1.0 -  pow(1.0 -exploadingProgress,3.0);
    newPosition *= exploadingProgress;

    //falling
    float fallingProgress = remap(progress,0.1,1.0,0.0,1.0);
    fallingProgress = clamp(fallingProgress,0.0,1.0);
    fallingProgress = 1.0 -  pow(1.0 -fallingProgress,3.0);
    newPosition.y -= fallingProgress * 0.2;

    //scalling
    float sizeOpeningProgress = remap(progress,0.0,0.125,0.0,1.0);
    float sizeClosingProgress = remap(progress,0.125,1.0,1.0,0.0);
    float sizeProgress = min(sizeOpeningProgress,sizeClosingProgress);
    sizeProgress = clamp(sizeProgress,0.0,1.0);

    //twinkling
    float twinklingProgress = remap(progress,0.2,0.8,0.0,1.0);
    twinklingProgress = clamp(twinklingProgress,0.0,1.0);
    float sizeTwinkling = sin(progress * 30.0) * 0.5 + 0.5;
    sizeTwinkling = 1.0 - sizeTwinkling * twinklingProgress;


    vec4 modelPosition = modelMatrix * vec4(newPosition,1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
    gl_PointSize = uSize * uResolution.y * aSize * sizeProgress * sizeTwinkling;
    gl_PointSize *= 1.0/-viewPosition.z;

    if(gl_PointSize < 1.0){
        gl_Position = vec4(9999.9);
    }

    vColor = aColor;
}