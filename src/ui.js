// src/ui.js
class UIManager {
    constructor(scene, cameraMgr) {
        this.scene = scene;
        this.cameraMgr = cameraMgr;
        this.setupEditorUI();
    }

    setupEditorUI() {
        const sidePanel = document.getElementById("side-panel");
        if (!sidePanel) return;

        sidePanel.innerHTML = `
            <div style="padding: 15px; background: #111; border-bottom: 1px solid #d4a373;">
                <h3 style="margin:0; color:#d4a373;">LAB SETTINGS</h3>
            </div>
            <div style="padding: 15px;">
                <label style="display:block; margin-bottom:10px;">Camera Sensitivity</label>
                <input type="range" id="rot-sens" min="500" max="5000" value="2000" style="width:100%;">
            </div>
            <div style="padding: 15px;">
                <h4 style="color:#d4a373; border-bottom:1px solid #333;">Asset Library</h4>
                <div class="asset-item" onclick="alert('Spawn Tree Logic Next')">Tree (RE4)</div>
                <div class="asset-item" onclick="alert('Spawn Box Logic Next')">Wooden Box</div>
            </div>
            <div style="padding: 15px;">
                <button class="btn-main" style="width:100%; background:#2ecc71;" onclick="testCinematic()">Test Cinematic</button>
            </div>
        `;

        // إظهار البردة تلقائياً في البداية للتأكد من عملها
        sidePanel.classList.add("open");

        window.addEventListener("keydown", (e) => {
            if (e.code === "KeyE") {
                sidePanel.classList.toggle("open");
            }
        });
    }
}

function toggleInventory() {
    const inv = document.getElementById("inventory-overlay");
    if (inv) inv.style.display = (inv.style.display === "flex") ? "none" : "flex";
}