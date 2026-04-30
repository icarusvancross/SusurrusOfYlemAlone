// src/camera.js
class CameraManager {
    constructor(scene, canvas) {
        this.scene = scene;
        this.canvas = canvas;
        this.setupCamera();
    }

    setupCamera() {
        // إنشاء كاميرا مدارية
        this.camera = new BABYLON.ArcRotateCamera("mainCam", -Math.PI / 2, Math.PI / 2.5, 5, BABYLON.Vector3.Zero(), this.scene);
        
        // إعدادات المسافات (مأخوذة من منطق الـ 200 سطر القديمة)
        this.camera.lowerRadiusLimit = 2; // أقرب مسافة
        this.camera.upperRadiusLimit = 10; // أبعد مسافة
        
        // تفعيل التحكم (كليك يمين للتدوير)
        this.camera.attachControl(this.canvas, true, false, 2);
        
        // سرعة الزووم
        this.camera.wheelPrecision = Config.zoomSpeed;
    }

    // وظيفة التحديث السلس (Lerp) مأخوذة من كودك القديم
    update(playerMesh, isAiming) {
        if (!playerMesh) return;

        // تحديد مكان الكاميرا خلف الكتف (RE4 Style)
        // إذا كان يصور (Aiming) تقترب الكاميرا، وإذا لا تبتعد
        let targetRadius = isAiming ? 3 : 5;
        let targetHeight = isAiming ? 1.8 : 2.2;

        // تطبيق الحركة السلسة (Interpolation)
        this.camera.radius = BABYLON.Scalar.Lerp(this.camera.radius, targetRadius, 0.1);
        this.camera.beta = BABYLON.Scalar.Lerp(this.camera.beta, Math.PI / 2.5, 0.1);
        
        // جعل الكاميرا تتبع اللاعب دائماً
        this.camera.setTarget(playerMesh.position.add(new BABYLON.Vector3(0, targetHeight, 0)));
    }

    updateSensitivity(value) {
        this.camera.angularSensibilityX = value;
        this.camera.angularSensibilityY = value;
    }
}