// src/player.js
class PlayerManager {
    constructor(scene) {
        this.scene = scene;
        this.health = 100;
        this.currentClip = 10;
        this.totalAmmo = 50;
        this.isAiming = false;
        this.isKnifing = false;
        this.moveSpeed = 0.15;
        this.rotationX = 0;
        
        this.createPlayer();
        this.createLaser();
    }

    createPlayer() {
        // إنشاء مجسم اللاعب (ليون)
        this.mesh = BABYLON.MeshBuilder.CreateBox("player", {width: 1, height: 2, depth: 0.5}, this.scene);
        this.mesh.position.y = 1;
        this.mesh.isVisible = true; // اجعله ظاهراً للتأكد من الحركة
    }

    createLaser() {
        // إنشاء شعاع الليزر
        this.laser = BABYLON.MeshBuilder.CreateLines("laser", {
            points: [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, -40)]
        }, this.scene);
        this.laser.color = new BABYLON.Color3(1, 0, 0);
        this.laser.isVisible = false;
    }

    update(moveVector, isAiming, speed) {
        this.isAiming = isAiming;
        this.updateHUD();

        if (!this.isAiming && !this.isKnifing) {
            // تحريك اللاعب بناءً على منطق WASD القديم
            if (moveVector.length() > 0) {
                this.mesh.moveWithCollisions(moveVector.scale(speed));
            }
            this.laser.isVisible = false;
        } else if (this.isAiming) {
            this.updateLaser();
        }
    }

    updateLaser() {
        this.laser.isVisible = true;
        // ربط موقع الليزر بموقع اللاعب واتجاهه
        this.laser.position = this.mesh.position.clone();
        this.laser.rotationQuaternion = this.mesh.rotationQuaternion;
    }

    updateHUD() {
        const ammoText = document.getElementById('ammo-count');
        if(ammoText) ammoText.innerText = this.currentClip + " / " + this.totalAmmo;
        
        const bar = document.getElementById('health-bar-fill');
        if(bar) {
            bar.style.width = this.health + "%";
            // تطبيق منطق الألوان القديم حرفياً
            if (this.health >= 75) bar.style.backgroundColor = "#00ff00";
            else if (this.health >= 50) bar.style.backgroundColor = "#0088ff";
            else if (this.health >= 25) bar.style.backgroundColor = "#ffaa00";
            else bar.style.backgroundColor = "#ff0000";
        }
    }
}