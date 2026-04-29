const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
let scene, camera, player, controller, isPlayMode = false;
let inputMap = {};

const createScene = () => {
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.01, 0.01, 0.02, 1);
    scene.collisionsEnabled = true;

    // كاميرا المحرر واللعب المدمجة
    camera = new BABYLON.ArcRotateCamera("cam", -Math.PI/2, Math.PI/2.5, 30, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true, false, 2); // كليك يمين للتدوير
    camera.wheelPrecision = 50;

    new BABYLON.HemisphericLight("light", BABYLON.Vector3.Up(), scene).intensity = 0.6;

    // الأرضية
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 500, height: 500}, scene);
    const groundMat = new BABYLON.StandardMaterial("gMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.35, 0.3, 0.25);
    ground.material = groundMat;
    ground.checkCollisions = true;

    // اللاعب (اللون البني المحروق 0x4a1a1a)
    player = BABYLON.MeshBuilder.CreateBox("Leon", {height: 2, width: 0.8, depth: 0.5}, scene);
    const leonMat = new BABYLON.StandardMaterial("leonMat", scene);
    leonMat.diffuseColor = new BABYLON.Color3(0.29, 0.1, 0.1); // تعادل 0x4a1a1a
    player.material = leonMat;
    player.position.y = 1;
    player.checkCollisions = true;
    player.ellipsoid = new BABYLON.Vector3(0.4, 1, 0.4);

    controller = new PlayerController(player, camera, scene, canvas);

    // نظام مدخلات الطيران (Editor Mode)
    window.addEventListener("keydown", (e) => { inputMap[e.code] = true; });
    window.addEventListener("keyup", (e) => { inputMap[e.code] = false; });

    return scene;
};

scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
    
    // تحديث الحساسية من السلايدر
    camera.angularSensibilityX = camera.angularSensibilityY = document.getElementById("rot-sens").value;

    if (isPlayMode) {
        controller.update();
        camera.target = player.position; // الكاميرا تتبع اللاعب
    } else {
        // منطق طيران الكاميرا (Editor Mode)
        if (inputMap["ShiftLeft"] || inputMap["ShiftRight"]) {
            let speed = document.getElementById("fly-sens").value / 100;
            let forward = camera.getForwardRay().direction;
            let right = BABYLON.Vector3.Cross(BABYLON.Vector3.Up(), forward).normalize();
            
            if (inputMap["KeyW"]) camera.target.addInPlace(forward.scale(speed));
            if (inputMap["KeyS"]) camera.target.addInPlace(forward.scale(-speed));
            if (inputMap["KeyA"]) camera.target.addInPlace(right.scale(speed));
            if (inputMap["KeyD"]) camera.target.addInPlace(right.scale(-speed));
        }
    }
});

// UI Actions
document.getElementById("btn-start-game").onclick = () => {
    isPlayMode = true;
    document.getElementById("toolbar").style.display = "none";
    document.getElementById("side-panel").classList.remove("open");
    document.getElementById("game-ui").style.display = "block";
    camera.radius = 8;
    canvas.requestPointerLock();
};

document.getElementById("btn-toggle-assets").onclick = () => document.getElementById("side-panel").classList.toggle("open");

// جلب الأصول
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