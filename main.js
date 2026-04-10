let scene, camera, renderer, player, controller;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010101);
    scene.fog = new THREE.Fog(0x010101, 5, 35);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    scene.add(new THREE.AmbientLight(0x404040, 1.5));
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // لون اللاعب بني محروق بلمسة حمراء
    player = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, 1),
        new THREE.MeshStandardMaterial({ color: 0x4a1414 })
    );
    player.position.y = 1;
    scene.add(player);

    controller = new PlayerController(player, camera, renderer.domElement, scene);

    document.getElementById('fullscreen-btn').addEventListener('click', () => {
        document.documentElement.requestFullscreen().catch(() => {});
        document.getElementById('fullscreen-btn').style.display = 'none';
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    if(controller) controller.update();
    renderer.render(scene, camera);
}

window.onload = init;