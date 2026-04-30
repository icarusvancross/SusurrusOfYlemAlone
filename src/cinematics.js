// src/cinematics.js
class CinematicManager {
    constructor(scene, cameraMgr) {
        this.scene = scene;
        this.cameraMgr = cameraMgr;
        this.ui = this.createDialogueUI();
    }

    createDialogueUI() {
        // إنشاء عنصر النص أسفل الشاشة إذا لم يكن موجوداً
        let div = document.getElementById("cutscene-text");
        if (!div) {
            div = document.createElement("div");
            div.id = "cutscene-text";
            div.style.cssText = `
                position: absolute; bottom: 15%; width: 100%; text-align: center;
                color: white; font-size: 24px; font-weight: bold;
                text-shadow: 2px 2px #000; z-index: 3000; display: none;
                font-family: 'Segoe UI', sans-serif; pointer-events: none;
            `;
            document.body.appendChild(div);
        }
        return div;
    }

    async playSequence(sequence) {
        console.log("Starting Cinematic Sequence...");
        // تعطيل نمط اللعب مؤقتاً
        window.isPlayMode = false; 

        for (let frame of sequence) {
            // تحريك الكاميرا بسلاسة
            this.cameraMgr.camera.setPosition(frame.cameraPos);
            this.cameraMgr.camera.setTarget(frame.lookAt);

            // إظهار نص الحوار
            if (frame.text) {
                this.ui.innerText = frame.text;
                this.ui.style.display = "block";
            } else {
                this.ui.style.display = "none";
            }

            // الانتظار حسب المدة
            await new Promise(resolve => setTimeout(resolve, frame.duration));
        }

        this.ui.style.display = "none";
        console.log("Cinematic Finished.");
        // إعادة التحكم حسب الرغبة (يمكنك تفعيلها يدوياً بعد المشهد)
    }
}