let scene, camera, renderer, player, controller;

function createVillageGround() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2b1d12'; 
    ctx.fillRect(0, 0, 512, 512);
    for(let i=0; i<2000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#1e140d' : '#352518';
        ctx.fillRect(Math.random()*512, Math.random()*512, 3, 3);
    }
    // إضافة لمسات عشب بني/أخضر داكن
    for(let i=0; i<500; i++) {
        ctx.fillStyle = '#1a2a0a';
        ctx.fillRect(Math.random()*512, Math.random()*512, 4, 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(30, 30);
    return texture;
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020202);
    scene.fog = new THREE.Fog(0x020202, 5, 35);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    scene.add(new THREE.AmbientLight(0x404040, 1.5));
    
    const sun = new THREE.DirectionalLight(0xffffff, 0.6);
    sun.position.set(5, 10, 5);
    scene.add(sun);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshStandardMaterial({ map: createVillageGround(), roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // لون اللاعب بني محروق بلمسة حمراء (Dark Reddish Brown)
    player = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, 1),
        new THREE.MeshStandardMaterial({ color: 0x4a1a1a, roughness: 0.8 })
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