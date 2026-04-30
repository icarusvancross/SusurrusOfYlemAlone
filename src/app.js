// src/app.js
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let sceneMgr, cameraMgr, inputMgr, playerMgr, uiMgr;
let isPlayMode = false;

const init = () => {
    sceneMgr = new SceneManager(engine);
    cameraMgr = new CameraManager(sceneMgr.scene, canvas);
    inputMgr = new InputManager(sceneMgr.scene, canvas);
    playerMgr = new PlayerManager(sceneMgr.scene);
    uiMgr = new UIManager(sceneMgr.scene, cameraMgr); // تفعيل مدير الواجهة

    engine.runRenderLoop(() => {
        sceneMgr.scene.render();
        // تحديث الحساسية من السلايدر الموجود في البردة
        cameraMgr.updateSensitivity(document.getElementById("rot-sens").value);

        if (isPlayMode) {
            let moveVector = inputMgr.getMovementVector(cameraMgr.camera);
            let isAiming = inputMgr.states["KeyX"];
            playerMgr.update(moveVector, isAiming, Config.walkSpeed);
            cameraMgr.setTarget(playerMgr.mesh.position);
        } else {
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
    isPlayMode = true;
    document.getElementById("toolbar").style.display = "none";
    document.getElementById("game-ui").style.display = "block";
    canvas.requestPointerLock();
};

function toggleFullscreen() {
    if (!document.fullscreenElement) canvas.requestFullscreen(); else document.exitFullscreen();
}