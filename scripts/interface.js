const frameRateHTML = document.querySelector(".info");

document.querySelector(".fullscreen-button").addEventListener("click", () => {
    document.querySelector(".overlay").requestFullscreen();
});

let isPause = false;
let previousStatus = 1;
export let timeAcceleration = 1;

document.querySelector(".pause-button").addEventListener("click", () => {
    if(!isPause) {
        previousStatus = timeAcceleration;
        timeAcceleration = 0;
        isPause = true;
    } else {
        timeAcceleration = previousStatus;
        isPause = false;
    };
});

document.querySelector(".left-button").addEventListener("click", () => {
    if(!isPause) {
        timeAcceleration = Math.max(1, --timeAcceleration)
    };
});

document.querySelector(".right-button").addEventListener("click", () => {
    if(!isPause) {
        timeAcceleration++;
    }
});

export const updateInfo = (gl, deltaTime) => {
    frameRateHTML.innerText = `FPS: ${Math.round(1 / deltaTime)}\nResolution: ${gl.canvas.width}x${gl.canvas.height}\nTime Acceleration: x${timeAcceleration}`;
};