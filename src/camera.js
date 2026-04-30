// src/camera.js
class CameraManager {
    constructor(scene, canvas) {
        this.scene = scene;
        this.canvas = canvas;
        this.setupCamera();
    }

    setupCamera() {
        // كاميرا مدارية (ArcRotate) - ممتازة للتاتش باد
        this.camera = new BABYLON.ArcRotateCamera("mainCam", -Math.PI / 2, Math.PI / 2.5, 30, BABYLON.Vector3.Zero(), this.scene);
        
        // تفعيل كليك يمين للتدوير (2 = Right Click)
        this.camera.attachControl(this.canvas, true, false, 2);
        
        // ضبط سرعة الزووم
        this.camera.wheelPrecision = Config.zoomSpeed;
        
        // ربط الحساسية بملف Config
        this.updateSensitivity(Config.rotationSensitivity);
    }

    updateSensitivity(value) {
        this.camera.angularSensibilityX = value;
        this.camera.angularSensibilityY = value;
    }

    setTarget(position) {
        this.camera.target = position;
    }
}