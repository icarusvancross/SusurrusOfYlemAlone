const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
let scene, camera, player, controller, isPlayMode = false;
let inputMap = {};

const createScene = () => {
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.01, 0.01, 0.02, 1);
    scene.collisionsEnabled = true;

    // كاميرا Unreal: كليك يمين للتدوير
    camera = new BABYLON.ArcRotateCamera("cam", -Math.PI/2, Math.PI/2.5, 30, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true, false, 2); // 2 = Right Click
    camera.wheelPrecision = 50;

    new BABYLON.HemisphericLight("light", BABYLON.Vector3.Up(), scene).intensity = 0.7;

    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 500, height: 500}, scene);
    const groundMat = new BABYLON.StandardMaterial("gMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2); // بني ترابي صريح
    ground.material = groundMat;
    ground.checkCollisions = true;

    player = BABYLON.MeshBuilder.CreateBox("Leon", {height: 2, width: 0.8, depth: 0.5}, scene);
    const leonMat = new BABYLON.StandardMaterial("leonMat", scene);
    leonMat.diffuseColor = new BABYLON.Color3(0.29, 0.1, 0.1); 
    player.material = leonMat;
    player.position.y = 1;
    player.checkCollisions = true;

    controller = new PlayerController(player, camera, scene, canvas);

    window.addEventListener("keydown", (e) => { inputMap[e.code] = true; });
    window.addEventListener("keyup", (e) => { inputMap[e.code] = false; });

    return scene;
};

scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
    camera.angularSensibilityX = camera.angularSensibilityY = document.getElementById("rot-sens").value;

    if (isPlayMode) {
        controller.update();
        camera.target = player.position;
    } else {
        // طيران في وضع المحرر (Shift + WASD)
        if (inputMap["ShiftLeft"]) {
            let speed = document.getElementById("fly-sens").value / 100;
            let forward = camera.getForwardRay().direction; // طيران باتجاه الماوس (XYZ)
            let right = BABYLON.Vector3.Cross(BABYLON.Vector3.Up(), forward).normalize();
            if (inputMap["KeyW"]) camera.target.addInPlace(forward.scale(speed));
            if (inputMap["KeyS"]) camera.target.addInPlace(forward.scale(-speed));
            if (inputMap["KeyA"]) camera.target.addInPlace(right.scale(speed));
            if (inputMap["KeyD"]) camera.target.addInPlace(right.scale(-speed));
        }
    }
});

document.getElementById("btn-start-game").onclick = () => {
    isPlayMode = true;
    document.getElementById("toolbar").style.display = "none";
    document.getElementById("side-panel").classList.remove("open");
    document.getElementById("game-ui").style.display = "block";
    canvas.requestPointerLock();
};

document.getElementById("btn-toggle-assets").onclick = () => document.getElementById("side-panel").classList.toggle("open");

// جلب الملفات
async function fetchAssets() {
    const res = await fetch(`https://api.github.com/repos/icarusvancross/SusurrusOfYlemAlone/contents/`);
    const files = await res.json();
    const list = document.getElementById("file-list");
    list.innerHTML = "";
    files.forEach(f => {
        if (f.name.endsWith(".glb")) {
            let d = document.createElement("div");
            d.className = "asset-item"; d.innerText = f.name;
            d.onclick = () => BABYLON.SceneLoader.ImportMesh("", "", f.download_url, scene, (m) => {
                let main = BABYLON.Mesh.MergeMeshes(m.filter(mesh => mesh.getTotalIndices() > 0), true, true, undefined, false, true);
                if(main) { main.position = camera.target.clone(); main.checkCollisions = true; }
            });
            list.appendChild(d);
        }
    });
}
fetchAssets();

function toggleFullscreen() {
    if (!document.fullscreenElement) canvas.requestFullscreen(); else document.exitFullscreen();
}