// src/input.js
class InputManager {
    constructor(scene, canvas) {
        this.scene = scene;
        this.canvas = canvas;
        this.states = {};
        this.setupInputs();
    }

    setupInputs() {
        this.scene.actionManager = new BABYLON.ActionManager(this.scene);
        this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
            this.states[evt.sourceEvent.code] = true;
            if (evt.sourceEvent.code === "KeyI" && typeof toggleInventory === 'function') toggleInventory();
        }));
        this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
            this.states[evt.sourceEvent.code] = false;
        }));
    }

    getMovementVector(camera) {
        let forward = camera.getForwardRay().direction;
        forward.y = 0; forward.normalize();
        let right = BABYLON.Vector3.Cross(BABYLON.Vector3.Up(), forward).normalize();

        let move = BABYLON.Vector3.Zero();
        if (this.states["KeyW"]) move.addInPlace(forward);
        if (this.states["KeyS"]) move.addInPlace(forward.scale(-1));
        
        // التصحيح الجذري: A تذهب لليسار (Right * -1) و D تذهب لليمين (Right * 1)
        if (this.states["KeyA"]) move.addInPlace(right.scale(-1)); 
        if (this.states["KeyD"]) move.addInPlace(right.scale(1));

        return move;
    }
}