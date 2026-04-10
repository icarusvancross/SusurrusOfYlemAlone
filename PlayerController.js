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
        this.isKnifing = false;
        this.canShoot = true;

        // 1. إعداد الليزر (شعاع لا يختفي)
        this.laserMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.8 });
        this.laserGeometry = new THREE.BufferGeometry();
        this.laser = new THREE.Line(this.laserGeometry, this.laserMaterial);
        this.scene.add(this.laser);
        this.laser.visible = false;

        // 2. إعداد نصل السكين (Blade Slash) - شكل معدني نحيف
        const bladeGeo = new THREE.PlaneGeometry(1.2, 0.15);
        const bladeMat = new THREE.MeshBasicMaterial({ 
            color: 0xaaaaaa, // لون معدني
            transparent: true, 
            opacity: 0, 
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending 
        });
        this.blade = new THREE.Mesh(bladeGeo, bladeMat);
        this.player.add(this.blade);
        // مكان ثابت أمام "صدر" اللاعب
        this.blade.position.set(0, 1.3, -1); 

        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
        this.canvas.addEventListener('mousedown', () => this.canvas.requestPointerLock());

        window.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === this.canvas) {
                this.player.rotation.y -= e.movementX * this.lookSpeed;
                this.rotationX -= e.movementY * this.lookSpeed;
                this.rotationX = Math.max(-Math.PI/3, Math.min(Math.PI/3, this.rotationX));
            }
        });
    }

    update() {
        // ميكانيكية السكين (C)
        if (this.keys['KeyC'] && !this.isKnifing) {
            this.performKnifeAttack();
        }

        // ميكانيكية التصويب (X)
        if (this.keys['KeyX']) {
            this.isAiming = true;
            if (this.keys['KeyV'] && this.canShoot) {
                this.shoot();
            }
        } else {
            this.isAiming = false;
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
        // نقطة الخروج من يمين اللاعب
        const gunPos = this.player.position.clone().add(new THREE.Vector3(0.5, 1.3, -0.4).applyQuaternion(this.player.quaternion));
        
        // حساب اتجاه الليزر مع مراعاة حركة الماوس فوق وتحت (rotationX)
        const targetDir = new THREE.Vector3(0, Math.tan(this.rotationX), -1).applyQuaternion(this.player.quaternion).normalize();
        
        const laserEnd = gunPos.clone().add(targetDir.multiplyScalar(40));
        this.laser.geometry.setFromPoints([gunPos, laserEnd]);
    }

    shoot() {
        this.canShoot = false;
        this.laser.material.color.setHex(0xffffff); // ومضة بيضاء للشعاع
        setTimeout(() => {
            this.laser.material.color.setHex(0xff0000);
            setTimeout(() => { this.canShoot = true; }, 200); // سرعة الطلقات
        }, 50);
    }

    performKnifeAttack() {
        this.isKnifing = true;
        this.blade.material.opacity = 0.9;
        this.blade.rotation.z = -0.5; // ميلان النصل للضربة

        // أنيميشن حركة السكين (سحب سريع لليسار)
        let startTime = Date.now();
        const animateKnife = () => {
            let elapsed = Date.now() - startTime;
            if (elapsed < 150) {
                this.blade.position.x = Math.sin(elapsed * 0.1) * 0.5;
                requestAnimationFrame(animateKnife);
            } else {
                this.blade.material.opacity = 0;
                this.blade.position.x = 0;
                setTimeout(() => { this.isKnifing = false; }, 250); // وقت الراحة بين الضربات
            }
        };
        animateKnife();
    }

    updateCamera() {
        const offset = this.isAiming ? new THREE.Vector3(0.4, 1.8, 2.5) : new THREE.Vector3(0.6, 2.2, 3.8);
        offset.applyQuaternion(this.player.quaternion);
        this.camera.position.lerp(this.player.position.clone().add(offset), 0.1);
        
        const lookAtOffset = new THREE.Vector3(0, 1.5 + (this.isAiming ? this.rotationX * 3 : 0), -5);
        lookAtOffset.applyQuaternion(this.player.quaternion);
        this.camera.lookAt(this.player.position.clone().add(lookAtOffset));
    }
}