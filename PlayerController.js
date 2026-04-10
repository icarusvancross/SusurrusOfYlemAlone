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

        // إعداد ليزر التصويب
        this.raycaster = new THREE.Raycaster();
        this.laserMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
        this.laserGeometry = new THREE.BufferGeometry();
        this.laser = new THREE.Line(this.laserGeometry, this.laserMaterial);
        this.scene.add(this.laser);
        this.laser.visible = false;

        // استماع للمفاتيح والماوس
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
        window.addEventListener('mousedown', (e) => {
            if(e.button === 2) this.isAiming = true; // زر يمين للتصويب
            this.canvas.requestPointerLock();
        });
        window.addEventListener('mouseup', (e) => {
            if(e.button === 2) this.isAiming = false;
        });
        window.addEventListener('contextmenu', e => e.preventDefault()); // منع القائمة اليمين

        window.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === this.canvas) {
                this.player.rotation.y -= e.movementX * this.lookSpeed;
                this.rotationX -= e.movementY * this.lookSpeed;
                this.rotationX = Math.max(-Math.PI/4, Math.min(Math.PI/4, this.rotationX));
            }
        });
    }

    update() {
        // إذا كان يضغط Shift أو الزر الأيمن للماوس يدخل في وضع التصويب
        if (this.keys['ShiftLeft'] || this.isAiming) {
            this.isAiming = true;
            document.getElementById('crosshair').style.display = 'block';
        } else {
            this.isAiming = false;
            document.getElementById('crosshair').style.display = 'none';
        }

        if (!this.isAiming) {
            // حركة مشي عادية (WASD)
            if (this.keys['KeyW']) this.player.translateZ(-this.moveSpeed);
            if (this.keys['KeyS']) this.player.translateZ(this.moveSpeed);
            if (this.keys['KeyA']) this.player.translateX(-this.moveSpeed);
            if (this.keys['KeyD']) this.player.translateX(this.moveSpeed);
            this.laser.visible = false;
            this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 75, 0.1);
        } else {
            // وضع التصويب (تثبيت اللاعب وتفعيل الليزر)
            this.updateLaser();
            this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 45, 0.1); // زووم التصويب
        }

        this.camera.updateProjectionMatrix();
        this.updateCamera();
    }

    updateLaser() {
        this.laser.visible = true;
        // نقطة خروج الليزر من جانب المكعب (كأنه من السلاح)
        const gunPos = this.player.position.clone().add(new THREE.Vector3(0.5, 1.2, -0.5).applyQuaternion(this.player.quaternion));
        // اتجاه التصويب
        const targetDir = new THREE.Vector3(0, this.rotationX, -1).applyQuaternion(this.player.quaternion).normalize();
        
        this.raycaster.set(gunPos, targetDir);
        const intersects = this.raycaster.intersectObjects(this.scene.children);
        
        let laserEnd = gunPos.clone().add(targetDir.multiplyScalar(20)); // طول الليزر لو ما صدم شيء
        if (intersects.length > 0) {
            laserEnd = intersects[0].point; // إذا صدم الأرض أو حائط يقف عندها
        }

        this.laser.geometry.setFromPoints([gunPos, laserEnd]);
    }

    updateCamera() {
        // كاميرا خلف الكتف
        const offset = this.isAiming ? new THREE.Vector3(0.4, 1.8, 2) : new THREE.Vector3(0.6, 2.2, 3.5);
        offset.applyQuaternion(this.player.quaternion);
        this.camera.position.lerp(this.player.position.clone().add(offset), 0.1);
        
        const lookAtOffset = new THREE.Vector3(0, 1.5 + (this.isAiming ? this.rotationX * 2 : 0), -5);
        lookAtOffset.applyQuaternion(this.player.quaternion);
        this.camera.lookAt(this.player.position.clone().add(lookAtOffset));
    }
}