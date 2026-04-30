// src/scene.js
class SceneManager {
    constructor(engine) {
        this.scene = new BABYLON.Scene(engine);
        this.setupEnvironment();
    }

    setupEnvironment() {
        // لون الخلفية والضباب (الجحيم البارد)
        this.scene.clearColor = new BABYLON.Color4(0.01, 0.01, 0.02, 1);
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
        this.scene.fogDensity = 0.01;
        this.scene.fogColor = new BABYLON.Color3(0.01, 0.01, 0.02);

        // الإضاءة
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 0.6;
        const dirLight = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(-1, -2, -1), this.scene);
        dirLight.intensity = 1.0;

        // الأرضية (بني رملي صريح)
        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 500, height: 500}, this.scene);
        const groundMat = new BABYLON.StandardMaterial("groundMat", this.scene);
        groundMat.diffuseColor = Config.groundColor; // يأخذ اللون من ملف الإعدادات
        
        // إضافة ملمس خشن (Noise)
        const noise = new BABYLON.NoiseProceduralTexture("noise", 512, this.scene);
        noise.octaves = 4;
        groundMat.bumpTexture = noise;
        
        ground.material = groundMat;
        ground.checkCollisions = true;
        this.ground = ground;
    }
}