// src/camera.js
class CameraManager {
    constructor(scene, canvas) {
        this.scene = scene;
        this.canvas = canvas;
        this.setupCamera();
    }

    setupCamera() {
        // وضع الكاميرا في مكان مرتفع وبعيد قليلاً لرؤية المشهد (Alpha, Beta, Radius, Target)
        this.camera = new BABYLON.ArcRotateCamera("mainCam", -Math.PI / 2, Math.PI / 3, 20, new BABYLON.Vector3(0, 0, 0), this.scene);
        this.camera.attachControl(this.canvas, true);
        
        this.camera.lowerRadiusLimit = 2;
        this.camera.upperRadiusLimit = 50;
        this.camera.wheelPrecision = 50;
    }

    update(playerMesh, isAiming) {
        if (!playerMesh || !window.isPlayMode) return;

        let targetRadius = isAiming ? 4 : 8;
        let targetHeight = isAiming ? 1.5 : 2.0;

        this.camera.radius = BABYLON.Scalar.Lerp(this.camera.radius, targetRadius, 0.1);
        this.camera.setTarget(playerMesh.position.add(new BABYLON.Vector3(0, targetHeight, 0)));
    }

    updateSensitivity(value) {
        this.camera.angularSensibilityX = value;
        this.camera.angularSensibilityY = value;
    }
}