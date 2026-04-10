let scene, camera, renderer, player, controller;

function init() {
    // 1. المشهد والجو العام
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020202);
    scene.fog = new THREE.Fog(0x020202, 2, 25);

    // 2. الكاميرا والضوء
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));

    // 3. المحرك (Renderer)
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);

    // 4. الأرضية (مخططة لرؤية الحركة)
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0x111111, wireframe: true })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // 5. اللاعب (المكعب الرمادي)
    player = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, 1),
        new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    player.position.y = 1;
    scene.add(player);

    // 6. تشغيل المتحكم
    controller = new PlayerController(player, camera, renderer.domElement, scene);

    // 7. زر الشاشة الكاملة
    document.getElementById('fullscreen-btn').addEventListener('click', () => {
        document.documentElement.requestFullscreen();
        document.getElementById('fullscreen-btn').style.display = 'none';
    });

    window.addEventListener('resize', onWindowResize);
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    if(controller) controller.update();
    renderer.render(scene, camera);
}

// بدء التشغيل
window.onload = init;