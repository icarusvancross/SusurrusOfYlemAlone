// src/app.js
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let sceneMgr, cameraMgr, inputMgr, playerMgr, uiMgr, cinemaMgr;
window.isPlayMode = false;

const init = () => {
    sceneMgr = new SceneManager(engine);
    cameraMgr = new CameraManager(sceneMgr.scene, canvas);
    inputMgr = new InputManager(sceneMgr.scene, canvas);
    playerMgr = new PlayerManager(sceneMgr.scene);
    uiMgr = new UIManager(sceneMgr.scene, cameraMgr);
    cinemaMgr = new CinematicManager(sceneMgr.scene, cameraMgr); // تفعيل المخرج

    engine.runRenderLoop(() => {
        sceneMgr.scene.render();

        // تحديث الحساسية من السلايدر
        const sensSlider = document.getElementById("rot-sens");
        if (sensSlider) {
            cameraMgr.updateSensitivity(sensSlider.value);
        }

        if (window.isPlayMode) {
            let moveVector = inputMgr.getMovementVector(cameraMgr.camera);
            let isAiming = inputMgr.states["KeyX"] || false;
            
            playerMgr.update(moveVector, isAiming, Config.walkSpeed);
            cameraMgr.update(playerMgr.mesh, isAiming);
        } else {
            // نمط المختبر أو السينما
            if (inputMgr.states["ShiftLeft"]) {
                let flyVector = inputMgr.getMovementVector(cameraMgr.camera);
                cameraMgr.camera.target.addInPlace(flyVector.scale(Config.flySpeed));
            }
        }
    });
};

window.onload = init;
window.addEventListener("resize", () => engine.resize());

document.getElementById("btn-start-game").onclick = () => {
    window.isPlayMode = true;
    document.getElementById("toolbar").style.display = "none";
    document.getElementById("game-ui").style.display = "block";
    canvas.requestPointerLock();
};

// وظيفة لتجربة مشهد سينمائي (اكتب testCinematic() في الكونسول)
window.testCinematic = () => {
    const intro = [
        {
            cameraPos: new BABYLON.Vector3(0, 10, -20),
            lookAt: new BABYLON.Vector3(0, 0, 0),
            text: "Leon: Something is not right in this village...",
            duration: 4000
        },
        {
            cameraPos: new BABYLON.Vector3(5, 2, 5),
            lookAt: new BABYLON.Vector3(0, 1, 0),
            text: "Hunnigan: Be careful, Leon. We've lost contact with the local police.",
            duration: 4000
        }
    ];
    cinemaMgr.playSequence(intro);
};

function toggleFullscreen() {
    if (!document.fullscreenElement) canvas.requestFullscreen(); else document.exitFullscreen();
}