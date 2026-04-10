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
        
        // حالات الأكشن
        this.isAiming = false;
        this.isKnifing = false;

        // إعداد الليزر
        this.raycaster = new THREE.Raycaster();
        this.laserMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
        this.laserGeometry = new THREE.BufferGeometry();
        this.laser = new THREE.Line(this.laserGeometry, this.laserMaterial);
        this.scene.add(this.laser);
        this.laser.visible = false;

        // استماع المفاتيح
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
        // 1. ميكانيكية السكين (C) - ضربة فورية
        if (this.keys['KeyC'] && !this.isKnifing) {
            this.performKnifeAttack();
        }

        // 2. ميكانيكية التصويب (X)
        if (this.keys['KeyX']) {
            this.isAiming = true;
            document.getElementById('crosshair').style.display = 'block';
            
            // 3. ميكانيكية الإطلاق (V) - فقط أثناء التصويب
            if (this.keys['KeyV']) {
                this.shoot();
            }
        } else {
            this.isAiming = false;
            document.getElementById('crosshair').style.display = 'none';
        }

        // الحركة (تعطيل المشي أثناء التصويب أو السكين)
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
        this.raycaster.set(gunPos, targetDir);
        const intersects = this.raycaster.intersectObjects(this.scene.children);
        let laserEnd = gunPos.clone().add(targetDir.multiplyScalar(20));
        if (intersects.length > 0) laserEnd = intersects[0].point;
        this.laser.geometry.setFromPoints([gunPos, laserEnd]);
    }

    shoot() {
        // تأثير بصري بسيط عند الإطلاق (تغيير لون الليزر مؤقتاً)
        this.laser.material.color.setHex(0xffffff);
        setTimeout(() => this.laser.material.color.setHex(0xff0000), 50);
        console.log("إطلاق نار!"); 
    }

    performKnifeAttack() {
        this.isKnifing = true;
        // أنيميشن سكين: ميلان المكعب للأمام بسرعة
        this.player.rotation.x = -0.5;
        setTimeout(() => {
            this.player.rotation.x = 0;
            this.isKnifing = false;
        }, 200);
        console.log("ضربة سكين!");
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