class PlayerController {
    constructor(player, camera, canvas, scene) {
        this.player = player;
        this.camera = camera;
        this.canvas = canvas;
        this.scene = scene;
        this.keys = {};
        
        // سمات اللاعب
        this.health = 100;
        this.currentClip = 9;
        this.clipSize = 10;
        this.totalAmmo = 50;
        
        this.isInventoryOpen = false;
        this.isReloading = false;
        this.lookSpeed = 0.002;
        this.moveSpeed = 0.08;
        this.rotationX = 0;
        this.isAiming = false;
        this.isKnifing = false;
        this.canShoot = true;

        this.setupVisuals();

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'KeyI') this.toggleInventory();
            if (e.code === 'KeyR') this.reload();
        });
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
        this.canvas.addEventListener('mousedown', () => { if(!this.isInventoryOpen) this.canvas.requestPointerLock(); });

        window.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === this.canvas && !this.isInventoryOpen) {
                this.player.rotation.y -= e.movementX * this.lookSpeed;
                this.rotationX -= e.movementY * this.lookSpeed;
                this.rotationX = Math.max(-Math.PI/3, Math.min(Math.PI/3, this.rotationX));
            }
        });
    }

    setupVisuals() {
        this.laserMat = new THREE.LineBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.8 });
        this.laserGeo = new THREE.BufferGeometry();
        this.laser = new THREE.Line(this.laserGeo, this.laserMat);
        this.scene.add(this.laser);
        this.laser.visible = false;

        this.blade = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.15), new THREE.MeshBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
        this.player.add(this.blade);
        this.blade.position.set(0, 1.3, -1);
    }

    toggleInventory() {
        this.isInventoryOpen = !this.isInventoryOpen;
        const inv = document.getElementById('inventory-overlay');
        inv.style.display = this.isInventoryOpen ? 'flex' : 'none';
        if(this.isInventoryOpen) {
            document.getElementById('inv-ammo-text').innerText = `AMMO: ${this.currentClip} / ${this.totalAmmo}`;
            document.getElementById('inv-hp-text').innerText = `CONDITION: ${this.getHPStatus()}`;
            document.exitPointerLock();
        } else {
            this.canvas.requestPointerLock();
        }
    }

    reload() {
        if (this.isReloading || this.currentClip === this.clipSize || this.totalAmmo <= 0) return;
        this.isReloading = true;
        this.canShoot = false;
        console.log("Reloading...");
        
        setTimeout(() => {
            let needed = this.clipSize - this.currentClip;
            let reloadAmount = Math.min(needed, this.totalAmmo);
            this.currentClip += reloadAmount;
            this.totalAmmo -= reloadAmount;
            this.isReloading = false;
            this.canShoot = true;
        }, 1500); // وقت التعمير 1.5 ثانية
    }

    getHPStatus() {
        if (this.health >= 75) return "FINE";
        if (this.health >= 50) return "CAUTION (BLUE)";
        if (this.health >= 25) return "CAUTION (ORANGE)";
        return "DANGER";
    }

    update() {
        if (this.isInventoryOpen) return;
        this.updateHUD();
        if (this.keys['KeyC'] && !this.isKnifing) this.performKnife();
        if (this.keys['KeyX']) {
            this.isAiming = true;
            if (this.keys['KeyV'] && this.canShoot && this.currentClip > 0) this.shoot();
        } else { this.isAiming = false; }

        if (!this.isAiming && !this.isKnifing && !this.isReloading) {
            if (this.keys['KeyW']) this.player.translateZ(-this.moveSpeed);
            if (this.keys['KeyS']) this.player.translateZ(this.moveSpeed);
            if (this.keys['KeyA']) this.player.translateX(-this.moveSpeed);
            if (this.keys['KeyD']) this.player.translateX(this.moveSpeed);
            this.laser.visible = false;
        } else if (this.isAiming) { this.updateLaser(); }
        this.updateCamera();
    }

    shoot() {
        this.canShoot = false;
        this.currentClip--;
        this.laser.material.color.setHex(0xffffff);
        setTimeout(() => {
            this.laser.material.color.setHex(0xff0000);
            setTimeout(() => { if(!this.isReloading) this.canShoot = true; }, 300);
        }, 50);
    }

    updateHUD() {
        document.getElementById('ammo-count').innerText = `${this.currentClip} / ${this.totalAmmo}`;
        const bar = document.getElementById('health-bar-fill');
        bar.style.width = this.health + "%";
        if (this.health >= 75) bar.style.backgroundColor = "#00ff00";
        else if (this.health >= 50) bar.style.backgroundColor = "#0088ff";
        else if (this.health >= 25) bar.style.backgroundColor = "#ffaa00";
        else bar.style.backgroundColor = "#ff0000";
    }

    performKnife() {
        this.isKnifing = true;
        this.blade.material.opacity = 0.8;
        let start = Date.now();
        const anim = () => {
            let elapsed = Date.now() - start;
            if (elapsed < 150) {
                this.blade.position.x = Math.sin(elapsed * 0.1) * 0.5;
                requestAnimationFrame(anim);
            } else {
                this.blade.material.opacity = 0;
                this.blade.position.x = 0;
                setTimeout(() => { this.isKnifing = false; }, 300);
            }
        };
        anim();
    }

    updateLaser() {
        this.laser.visible = true;
        const gunPos = this.player.position.clone().add(new THREE.Vector3(0.5, 1.3, -0.4).applyQuaternion(this.player.quaternion));
        const targetDir = new THREE.Vector3(0, Math.tan(this.rotationX), -1).applyQuaternion(this.player.quaternion).normalize();
        this.laser.geometry.setFromPoints([gunPos, gunPos.clone().add(targetDir.multiplyScalar(40))]);
    }

    updateCamera() {
        const offset = this.isAiming ? new THREE.Vector3(0.4, 1.8, 2.5) : new THREE.Vector3(0.6, 2.2, 3.8);
        offset.applyQuaternion(this.player.quaternion);
        this.camera.position.lerp(this.player.position.clone().add(offset), 0.1);
        const lookAtTarget = this.player.position.clone().add(new THREE.Vector3(0, 1.5 + (this.isAiming ? this.rotationX * 3 : 0), -5).applyQuaternion(this.player.quaternion));
        this.camera.lookAt(lookAtTarget);
    }
}