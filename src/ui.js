// src/ui.js
class UIManager {
    constructor(scene, cameraMgr) {
        this.scene = scene;
        this.cameraMgr = cameraMgr;
        this.pendingAssetUrl = null;
        this.setupButtons();
        this.fetchGitHubAssets();
    }

    setupButtons() {
        // فتح وإغلاق البردة الجانبية
        document.getElementById("btn-toggle-assets").onclick = () => {
            document.getElementById("side-panel").classList.toggle("open");
        };

        // زر إضافة الموديل للعالم
        document.getElementById("spawn-btn").onclick = () => {
            if (this.pendingAssetUrl) {
                BABYLON.SceneLoader.ImportMesh("", "", this.pendingAssetUrl, this.scene, (meshes) => {
                    let main = BABYLON.Mesh.MergeMeshes(meshes.filter(m => m.getTotalIndices() > 0), true, true, undefined, false, true);
                    if(main) {
                        main.position = this.cameraMgr.camera.target.clone();
                        main.checkCollisions = true;
                    }
                    document.getElementById("asset-info").style.display = "none";
                });
            }
        };
    }

    async fetchGitHubAssets() {
        const url = `https://api.github.com/repos/${Config.user}/${Config.repo}/contents/`;
        try {
            const res = await fetch(url);
            const files = await res.json();
            const list = document.getElementById("file-list");
            list.innerHTML = "";
            
            files.forEach(f => {
                if (f.name.toLowerCase().endsWith(".glb")) {
                    let div = document.createElement("div");
                    div.className = "asset-item";
                    div.innerText = f.name;
                    div.onclick = () => {
                        this.pendingAssetUrl = f.download_url;
                        document.getElementById("selected-name").innerText = f.name;
                        document.getElementById("asset-info").style.display = "block";
                    };
                    list.appendChild(div);
                }
            });
        } catch(e) { console.error("GitHub Sync Error"); }
    }
}