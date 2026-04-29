const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
let scene, camera, player, controller, isPlayMode = false;

const createScene = () => {
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.01, 0.01, 0.02, 1);
    scene.collisionsEnabled = true;

    camera = new BABYLON.ArcRotateCamera("cam", -Math.PI/2, Math.PI/2.5, 30, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true, false, 2);

    const light = new BABYLON.HemisphericLight("light", BABYLON.Vector3.Up(), scene);
    
    // الأرضية
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 200, height: 200}, scene);
    const groundMat = new BABYLON.StandardMaterial("gMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.4, 0.35, 0.3);
    ground.material = groundMat;
    ground.checkCollisions = true;

    // اللاعب
    player = BABYLON.MeshBuilder.CreateBox("Leon", {height: 2}, scene);
    player.position.y = 1;
    player.checkCollisions = true;

    // تفعيل الكنترولر
    controller = new PlayerController(player, camera, scene, canvas);

    return scene;
};

scene = createScene();
engine.runRenderLoop(() => { 
    scene.render(); 
    if(isPlayMode) controller.update(); 
});

// زر البداية
document.getElementById("btn-start-game").onclick = () => {
    isPlayMode = true;
    document.getElementById("toolbar").style.display = "none";
    document.getElementById("game-ui").style.display = "block";
    camera.target = player.position;
    canvas.requestPointerLock();
};

// جلب الأصول من GitHub (تلقائي)
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
                m[0].position = camera.target.clone();
                m[0].checkCollisions = true;
            });
            list.appendChild(d);
        }
    });
}
fetchAssets();
document.getElementById("btn-toggle-assets").onclick = () => document.getElementById("side-panel").classList.toggle("open");