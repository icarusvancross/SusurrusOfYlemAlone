// src/player.js
class PlayerManager {
    constructor(scene) {
        this.scene = scene;
        this.health = 100;
        this.isAiming = false;
        this.createPlayer();
    }

    createPlayer() {
        // لاعب مؤقت (مكعب أخضر) لنميزه عن المكعب الأحمر في المنتصف
        this.mesh = BABYLON.MeshBuilder.CreateBox("player", {width: 1, height: 2, depth: 0.8}, this.scene);
        this.mesh.position.y = 1;
        const mat = new BABYLON.StandardMaterial("playerMat", this.scene);
        mat.diffuseColor = BABYLON.Color3.Green();
        this.mesh.material = mat;
        this.mesh.checkCollisions = true;
    }

    update(moveVector, isAiming, speed) {
        this.isAiming = isAiming;
        if (!this.isAiming && moveVector.length() > 0) {
            this.mesh.moveWithCollisions(moveVector.scale(speed));
            
            // تدوير اللاعب باتجاه الحركة
            let targetRotation = Math.atan2(moveVector.x, moveVector.z);
            this.mesh.rotation.y = BABYLON.Scalar.LerpAngle(this.mesh.rotation.y, targetRotation, 0.1);
        }
    }
}