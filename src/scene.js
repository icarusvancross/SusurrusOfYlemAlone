// src/scene.js
class SceneManager {
    constructor(engine) {
        this.scene = new BABYLON.Scene(engine);
        this.scene.clearColor = new BABYLON.Color4(0.2, 0.2, 0.3, 1); // خلفية زرقاء داكنة بدلاً من الأسود للتأكد
        this.scene.collisionsEnabled = true;
        this.setupEnvironment();
    }

    setupEnvironment() {
        // إضاءة شاملة قوية جداً
        const light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 1.5;

        // إضاءة شمسية (Directional)
        const dirLight = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-1, -2, -1), this.scene);
        dirLight.position = new BABYLON.Vector3(20, 40, 20);
        dirLight.intensity = 1.0;

        // الأرضية
        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 100, height: 100}, this.scene);
        const groundMat = new BABYLON.StandardMaterial("groundMat", this.scene);
        groundMat.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2); // بني صريح
        ground.material = groundMat;
        ground.checkCollisions = true;
        this.ground = ground;

        // مكعب مرجعي في المنتصف للتأكد من الرؤية
        const box = BABYLON.MeshBuilder.CreateBox("centerBox", {size: 2}, this.scene);
        box.position.y = 1;
        const boxMat = new BABYLON.StandardMaterial("boxMat", this.scene);
        boxMat.diffuseColor = BABYLON.Color3.Red();
        box.material = boxMat;
    }
}