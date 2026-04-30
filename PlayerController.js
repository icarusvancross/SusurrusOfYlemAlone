class PlayerController {
    constructor(player, camera, scene, canvas) {
        this.player = player; this.camera = camera; this.scene = scene; this.canvas = canvas;
        this.inputMap = {};
        this.health = 100; this.ammoClip = 10; this.ammoTotal = 50;
        this.isAiming = false; this.canShoot = true; this.isInventoryOpen = false;

        this.setupArsenal();
        this.setupInputs();
    }

    setupArsenal() {
        this.laser = BABYLON.MeshBuilder.CreateLines("laser", {points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, 50)]}, this.scene);
        this.laser.color = new BABYLON.Color3(1, 0, 0);
        this.laser.parent = this.player;
        this.laser.position = new BABYLON.Vector3(0.3, 0.6, 0.2);
        this.laser.isVisible = false;
    }

    setupInputs() {
        this.scene.actionManager = new BABYLON.ActionManager(this.scene);
        this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.code] = true;
            if (evt.sourceEvent.code === "KeyI") this.toggleInventory();
        }));
        this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.code] = false;
        }));
    }

    shoot() {
        if (this.ammoClip > 0 && this.canShoot) {
            this.canShoot = false;
            this.ammoClip--;
            this.laser.color = new BABYLON.Color3(1, 1, 1); // وميض أبيض
            setTimeout(() => { 
                this.laser.color = new BABYLON.Color3(1, 0, 0); 
                this.canShoot = true;
            }, 100);
        }
    }

    toggleInventory() {
        this.isInventoryOpen = !this.isInventoryOpen;
        document.getElementById("inventory-overlay").style.display = this.isInventoryOpen ? "flex" : "none";
        if(this.isInventoryOpen) document.exitPointerLock(); else this.canvas.requestPointerLock();
    }

    update() {
        if (this.isInventoryOpen) return;
        let speed = 0.15;
        this.isAiming = this.inputMap["KeyX"];
        this.laser.isVisible = this.isAiming;
        this.camera.radius = BABYLON.Scalar.Lerp(this.camera.radius, this.isAiming ? 4 : 8, 0.1);

        if (this.isAiming) {
            if (this.inputMap["KeyV"]) this.shoot(); // زر الطلق V
        } else {
            let forward = this.camera.getForwardRay().direction;
            forward.y = 0; forward.normalize();
            let right = BABYLON.Vector3.Cross(BABYLON.Vector3.Up(), forward).normalize();
            let move = BABYLON.Vector3.Zero();

            if (this.inputMap["KeyW"]) move.addInPlace(forward);
            if (this.inputMap["KeyS"]) move.addInPlace(forward.scale(-1));
            if (this.inputMap["KeyA"]) move.addInPlace(right.scale(1));
            if (this.inputMap["KeyD"]) move.addInPlace(right.scale(-1));

            if (move.length() > 0) {
                this.player.moveWithCollisions(move.scale(speed));
                this.player.rotation.y = BABYLON.Scalar.LerpAngle(this.player.rotation.y, Math.atan2(move.x, move.z), 0.15);
            }
        }
        document.getElementById("ammo-count").innerText = `${this.ammoClip} / ${this.ammoTotal}`;
        document.getElementById("health-bar-fill").style.width = this.health + "%";
    }
}