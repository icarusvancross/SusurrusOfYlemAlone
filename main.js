let scene, camera, renderer, player, controller;

// وظيفة لصنع أرضية "القرية" برمجياً
function createVillageGround() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // لون التربة البني
    ctx.fillStyle = '#3d2b1f';
    ctx.fillRect(0, 0, 512, 512);
    
    // إضافة بقع عشب خضراء داكنة
    for(let i=0; i<1000; i++) {
        ctx.fillStyle = `rgb(${20+Math.random()*20}, ${30+Math.random()*20}, 10)`;
        ctx.fillRect(Math.random()*512, Math.random()*512, 5, 5);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(20, 20); // تكرار النمط
    return texture;
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.Fog(0x050505, 5, 30);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.5));

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);

    // الأرضية المطورة (Village Style)
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshStandardMaterial({ map: createVillageGround() });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // اللاعب (بني مائل للأحمر الغامق كما طلبت)
    player = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, 1),
        new THREE.MeshStandardMaterial({ color: 0x5d2a2a }) // Dark Brown-Red
    );
    player.position.y = 1;
    scene.add(player);

    controller = new PlayerController(player, camera, renderer.domElement, scene);

    document.getElementById('fullscreen-btn').addEventListener('click', () => {
        document.documentElement.requestFullscreen();
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