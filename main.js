let scene, camera, renderer, player, controller;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020000);
    scene.fog = new THREE.Fog(0x020000, 2, 25);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);

    // أرضية بسيطة
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 20, 20),
        new THREE.MeshStandardMaterial({ color: 0x110000, wireframe: true })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // ليون (المكعب)
    player = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, 1),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    player.position.y = 1;
    scene.add(player);

    controller = new PlayerController(player, camera, renderer.domElement, scene);

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

window.onload = init;