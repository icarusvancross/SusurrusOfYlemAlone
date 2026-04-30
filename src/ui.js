// src/ui.js
class UIManager {
    constructor(scene, cameraMgr) {
        this.scene = scene;
        this.cameraMgr = cameraMgr;
        this.setupEditorUI();
    }

    setupEditorUI() {
        const sidePanel = document.getElementById("side-panel");
        sidePanel.innerHTML = `
            <div style="padding: 10px; border-bottom: 1px solid #333;">
                <h4>Camera Settings</h4>
                <label style="font-size: 10px;">Sensitivity</label>
                <input type="range" id="rot-sens" min="500" max="5000" value="2000" style="width: 100%;">
            </div>
            <div style="padding: 10px;">
                <h4>Asset Library</h4>
                <div class="asset-item" id="spawn-tree">Tree (RE4 Style)</div>
                <div class="asset-item" id="spawn-box">Wooden Crate</div>
                <div class="asset-item" id="spawn-enemy">Ganado Spawn Point</div>
            </div>
            <div style="padding: 10px; border-top: 1px solid #333;">
                <button class="btn-main" id="save-level" style="width:100%">Save Stage Data</button>
            </div>
        `;

        // ربط الأزرار بالوظائف
        document.getElementById("spawn-tree").onclick = () => this.spawnObject("tree");
        document.getElementById("spawn-box").onclick = () => this.spawnObject("box");
        document.getElementById("save-level").onclick = () => this.saveLevel();

        window.addEventListener("keydown", (e) => {
            if (e.code === "KeyE") sidePanel.classList.toggle("open");
        });
    }

    spawnObject(type) {
        let mesh;
        if (type === "tree") {
            mesh = BABYLON.MeshBuilder.CreateCylinder("tree", {diameterTop: 0.2, diameterBottom: 0.5, height: 4}, this.scene);
        } else {
            mesh = BABYLON.MeshBuilder.CreateBox("box", {size: 1}, this.scene);
        }
        
        mesh.position = new BABYLON.Vector3(0, mesh.scaling.y / 2, 0);
        
        // تفعيل الـ Gizmo التلقائي لأي شيء يتم إضافته في المختبر
        this.attachGizmo(mesh);
    }

    attachGizmo(mesh) {
        const utilLayer = new BABYLON.UtilityLayerRenderer(this.scene);
        const gizmo = new BABYLON.PositionGizmo(utilLayer);
        gizmo.attachedMesh = mesh;

        // ميزة الـ Uniform Scaling التي تحبها (تكبير متساوي XYZ)
        const scaleGizmo = new BABYLON.ScaleGizmo(utilLayer);
        scaleGizmo.attachedMesh = mesh;
        scaleGizmo.onScaleBoxDragObservable.add(() => {
            const s = mesh.scaling;
            const avg = (s.x + s.y + s.z) / 3;
            mesh.scaling.set(avg, avg, avg);
        });
    }

    saveLevel() {
        // وظيفة حفظ المرحلة (ستظهر البيانات في الكونسول F12)
        const data = this.scene.meshes.map(m => ({
            name: m.name,
            pos: m.position,
            scale: m.scaling
        }));
        console.log("Stage Data Saved:", JSON.stringify(data));
        alert("Stage data exported to Console (F12)");
    }
}

function toggleInventory() {
    const inv = document.getElementById("inventory-overlay");
    inv.style.display = (inv.style.display === "flex") ? "none" : "flex";
}