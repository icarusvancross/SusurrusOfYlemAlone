class PlayerController {
    constructor(player, camera, canvas, scene) {
        this.player = player;
        this.camera = camera;
        this.canvas = canvas;
        this.scene = scene;
        this.keys = {};
        this.lookSpeed = 0.002;
        this.moveSpeed = 0.08;
        this.rotationX = 0;
        
        this.isAiming = false;
        this.isKnifing = false; // لمنع السبام
        this.canShoot = true;

        // 1. إعداد الليزر (شعاع حقيقي)
        this.laserMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
        this.laserGeometry = new THREE.BufferGeometry();
        this.laser = new THREE.Line(this.laserGeometry, this.laserMaterial);
        this.scene.add(this.laser);
        this.laser.visible = false;

        // 2. إعداد أثر السكين (Slash)
        const slashGeo = new THREE.PlaneGeometry(1.5, 0.5);
        const slashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide });
        this.slash = new THREE.Mesh(slashGeo, slashMat);
        this.player.add(this.slash);
        this.slash.position.set(0, 1.2, -1.2); // أمام اللاعب

        // 3. إعداد وميض الإطلاق (Muzzle Flash)
        const flashGeo = new THREE.SphereGeometry(0.2);
        const flashMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.muzzleFlash = new THREE.Mesh(flashGeo, flashMat);
        this.player.add(this.muzzleFlash);
        this.muzzleFlash.position.set(0.5, 1.2, -1);
        this.muzzleFlash.visible = false;

        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
        this.canvas.addEventListener('mousedown', () => this.canvas.requestPointerLock());

        window.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === this.canvas) {
                this.player.rotation.y -= e.movementX * this.lookSpeed;
                this.rotationX -= e.movementY * this.lookSpeed;
                this.rotationX = Math.max(-Math.PI/4, Math.min(Math.PI/4, this.rotationX));
            }
        });
    }

    update() {
        // ميكانيكية السكين (C) مع نظام الحماية من السبام
        if (this.keys['KeyC'] && !this.isKnifing) {
            this.performKnifeAttack();
        }

        // ميكانيكية التصويب (X) والإطلاق (V)
        if (this.keys['KeyX']) {
            this.isAiming = true;
            document.getElementById('crosshair').style.display = 'block';
            if (this.keys['KeyV'] && this.canShoot) {
                this.shoot();
            }
        } else {
            this.isAiming = false;
            document.getElementById('crosshair').style.display = 'none';
        }

        if (!this.isAiming && !this.isKnifing) {
            if (this.keys['KeyW']) this.player.translateZ(-this.moveSpeed);
            if (this.keys['KeyS']) this.player.translateZ(this.moveSpeed);
            if (this.keys['KeyA']) this.player.translateX(-this.moveSpeed);
            if (this.keys['KeyD']) this.player.translateX(this.moveSpeed);
            this.laser.visible = false;
            this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 75, 0.1);
        } else if (this.isAiming) {
            this.updateLaser();
            this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 45, 0.1);
        }

        this.camera.updateProjectionMatrix();
        this.updateCamera();
    }

    updateLaser() {
        this.laser.visible = true;
        const gunPos = this.player.position.clone().add(new THREE.Vector3(0.5, 1.2, -0.5).applyQuaternion(this.player.quaternion));
        const targetDir = new THREE.Vector3(0, this.rotationX, -1).applyQuaternion(this.player.quaternion).normalize();
        const laserEnd = gunPos.clone().add(targetDir.multiplyScalar(30));
        this.laser.geometry.setFromPoints([gunPos, laserEnd]);
    }

    shoot() {
        this.canShoot = false;
        this.muzzleFlash.visible = true;
        this.laser.material.color.setHex(0xffff00); // تغيير لون الليزر للحظة
        
        setTimeout(() => {
            this.muzzleFlash.visible = false;
            this.laser.material.color.setHex(0xff0000);
            this.canShoot = true;
        }, 100);
    }

    performKnifeAttack() {
        this.isKnifing = true;
        this.slash.material.opacity = 1;
        this.slash.rotation.z = Math.random() * Math.PI; // زاوية عشوائية للأثر

        setTimeout(() => {
            this.slash.material.opacity = 0;
            // Cooldown: لا يمكنه الضرب مرة أخرى إلا بعد نصف ثانية
            setTimeout(() => { this.isKnifing = false; }, 300);
        }, 100);
    }

    updateCamera() {
        const offset = this.isAiming ? new THREE.Vector3(0.4, 1.8, 2) : new THREE.Vector3(0.6, 2.2, 3.5);
        offset.applyQuaternion(this.player.quaternion);
        this.camera.position.lerp(this.player.position.clone().add(offset), 0.1);
        const lookAtOffset = new THREE.Vector3(0, 1.5 + (this.isAiming ? this.rotationX * 2 : 0), -5);
        lookAtOffset.applyQuaternion(this.player.quaternion);
        this.camera.lookAt(this.player.position.clone().add(lookAtOffset));
    }
}