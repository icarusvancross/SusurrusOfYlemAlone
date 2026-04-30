// src/player.js
class PlayerManager {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.laser = null;
        this.createPlayer();
        this.createLaser();
    }

    createPlayer() {
        // إنشاء المكعب باللون البني المحروق (0x4a1a1a)
        this.mesh = BABYLON.MeshBuilder.CreateBox("Leon", {height: 2, width: 0.8, depth: 0.5}, this.scene);
        const mat = new BABYLON.StandardMaterial("leonMat", this.scene);
        mat.diffuseColor = new BABYLON.Color3(0.29, 0.1, 0.1); 
        this.mesh.material = mat;
        this.mesh.position.y = 1;
        this.mesh.checkCollisions = true;
        this.mesh.ellipsoid = new BABYLON.Vector3(0.4, 1, 0.4);
    }

    createLaser() {
        // الليزر الأحمر الخاص بالتصويب
        this.laser = BABYLON.MeshBuilder.CreateLines("laser", {
            points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, 50)]
        }, this.scene);
        this.laser.color = new BABYLON.Color3(1, 0, 0);
        this.laser.parent = this.mesh;
        this.laser.position = new BABYLON.Vector3(0.3, 0.6, 0.2); // موضع الليزر على الكتف
        this.laser.isVisible = false;
    }

    update(inputVector, isAiming, speed) {
        if (isAiming) {
            this.laser.isVisible = true;
        } else {
            this.laser.isVisible = false;
            if (inputVector.length() > 0) {
                this.mesh.moveWithCollisions(inputVector.scale(speed));
                // تدوير اللاعب باتجاه المشي بسلاسة
                let targetRotation = Math.atan2(inputVector.x, inputVector.z);
                this.mesh.rotation.y = BABYLON.Scalar.LerpAngle(this.mesh.rotation.y, targetRotation, 0.15);
            }
        }
    }
}