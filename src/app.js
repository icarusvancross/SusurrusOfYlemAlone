// src/app.js
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let sceneMgr, cameraMgr, inputMgr, playerMgr, uiMgr, cinemaMgr;
window.isPlayMode = false;

const init = () => {
    try {
        console.log("Initializing Engine...");
        sceneMgr = new SceneManager(engine);
        cameraMgr = new CameraManager(sceneMgr.scene, canvas);
        inputMgr = new InputManager(sceneMgr.scene, canvas);
        playerMgr = new PlayerManager(sceneMgr.scene);
        uiMgr = new UIManager(sceneMgr.scene, cameraMgr);
        cinemaMgr = new CinematicManager(sceneMgr.scene, cameraMgr);

        engine.runRenderLoop(() => {
            sceneMgr.scene.render();

            // حماية ضد السلايدر المفقود
            const sensSlider = document.getElementById("rot-sens");
            if (sensSlider && cameraMgr) {
                cameraMgr.updateSensitivity(sensSlider.value);
            }

            if (window.isPlayMode) {
                let moveVector = inputMgr.getMovementVector(cameraMgr.camera);
                let isAiming = inputMgr.states["KeyX"] || false;
                playerMgr.update(moveVector, isAiming, Config.walkSpeed);
                cameraMgr.update(playerMgr.mesh, isAiming);
            } else {
                if (inputMgr && inputMgr.states["ShiftLeft"]) {
                    let flyVector = inputMgr.getMovementVector(cameraMgr.camera);
                    cameraMgr.camera.target.addInPlace(flyVector.scale(Config.flySpeed));
                }
            }
        });
        console.log("Engine Ready!");
    } catch (error) {
        console.error("CRITICAL ERROR DURING INIT:", error);
    }
};

window.onload = init;
window.addEventListener("resize", () => engine.resize());

const startBtn = document.getElementById("btn-start-game");
if (startBtn) {
    startBtn.onclick = () => {
        window.isPlayMode = true;
        document.getElementById("toolbar").style.display = "none";
        document.getElementById("game-ui").style.display = "block";
        canvas.requestPointerLock();
    };
}

window.testCinematic = () => {
    if(!cinemaMgr) return console.error("Cinema Manager not ready!");
    const intro = [
        { cameraPos: new BABYLON.Vector3(0, 10, -20), lookAt: new BABYLON.Vector3(0, 0, 0), text: "Leon: Testing...", duration: 2000 }
    ];
    cinemaMgr.playSequence(intro);
};

function toggleFullscreen() {
    if (!document.fullscreenElement) canvas.requestFullscreen(); else document.exitFullscreen();
}