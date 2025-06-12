import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Global variables
let scene, camera, renderer, controls;
let sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune;
const clock = new THREE.Clock();
let isPaused = false; // Tracks whether animation is paused

// Constant for scaling slider value to angular velocity
const ANGULAR_SPEED_FACTOR = 0.01; // radians per second per unit

// Orbital radii (distance from Sun)
const orbitalRadii = {
    mercury: 15,
    venus: 25,
    earth: 35,
    mars: 55,
    jupiter: 75,
    saturn: 95,
    uranus: 115,
    neptune: 135
};

// Constant for calculating default speeds
const K = 1000; // Scaling constant, adjustable for visual effect

// Calculate default speeds inversely proportional to orbital radius
const defaultSpeeds = {
    mercury: K / orbitalRadii.mercury,
    venus: K / orbitalRadii.venus,
    earth: K / orbitalRadii.earth,
    mars: K / orbitalRadii.mars,
    jupiter: K / orbitalRadii.jupiter,
    saturn: K / orbitalRadii.saturn,
    uranus: K / orbitalRadii.uranus,
    neptune: K / orbitalRadii.neptune
};

// Object to store absolute orbit speeds for each planet (using calculated defaults)
const speedMultipliers = {
    mercury: defaultSpeeds.mercury,
    venus: defaultSpeeds.venus,
    earth: defaultSpeeds.earth,
    mars: defaultSpeeds.mars,
    jupiter: defaultSpeeds.jupiter,
    saturn: defaultSpeeds.saturn,
    uranus: defaultSpeeds.uranus,
    neptune: defaultSpeeds.neptune
};

function initScene() {
    scene = new THREE.Scene();
}

function initCamera() {
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 50;
}

function createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 5000;

    const positions = [];
    for (let i = 0; i < starCount; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        positions.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: document.querySelector('#webgl')
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function loadTextures() {
    const textureLoader = new THREE.TextureLoader();
    return {
        sunTexture: textureLoader.load('./img/sun_hd.jpg'),
        mercuryTexture: textureLoader.load('./img/mercury_hd.jpg'),
        venusTexture: textureLoader.load('./img/venus_hd.jpg'),
        earthTexture: textureLoader.load('./img/earth_hd.jpg'),
        marsTexture: textureLoader.load('./img/mars_hd.jpg'),
        jupiterTexture: textureLoader.load('./img/jupiter_hd.jpg'),
        saturnTexture: textureLoader.load('./img/saturn_hd.jpg'),
        uranusTexture: textureLoader.load('./img/uranus_hd.jpg'),
        neptuneTexture: textureLoader.load('./img/neptune_hd.jpg'),
    };
}

function createSun(texture) {
    const sunMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        emissive: 0xffff00,
        emissiveIntensity: 2
    });
    const sunGeo = new THREE.SphereGeometry(10, 45, 45);
    sun = new THREE.Mesh(sunGeo, sunMaterial);
    scene.add(sun);
}

function createMercury(texture) {
    const mercuryMaterial = new THREE.MeshBasicMaterial({ map: texture });
    const mercuryGeo = new THREE.SphereGeometry(2, 32, 32);
    mercury = new THREE.Mesh(mercuryGeo, mercuryMaterial);
    mercury.position.x = orbitalRadii.mercury;
    scene.add(mercury);
}

function createVenus(texture) {
    const venusmaterial = new THREE.MeshBasicMaterial({ map: texture });
    const venusGeo = new THREE.SphereGeometry(3, 40, 40);
    venus = new THREE.Mesh(venusGeo, venusmaterial);
    venus.position.x = orbitalRadii.venus;
    scene.add(venus);
}

function createEarth(texture) {
    const earthMaterial = new THREE.MeshBasicMaterial({ map: texture });
    const earthGeo = new THREE.SphereGeometry(3, 40, 40);
    earth = new THREE.Mesh(earthGeo, earthMaterial);
    earth.position.x = orbitalRadii.earth;
    scene.add(earth);
}

function createMars(texture) {
    const marsematerial = new THREE.MeshBasicMaterial({ map: texture });
    const marseGeo = new THREE.SphereGeometry(5, 40, 40);
    mars = new THREE.Mesh(marseGeo, marsematerial);
    mars.position.x = orbitalRadii.mars;
    scene.add(mars);
}

function createJupiter(texture) {
    const jupitermaterial = new THREE.MeshBasicMaterial({ map: texture });
    const jupiterGeo = new THREE.SphereGeometry(3, 35, 35);
    jupiter = new THREE.Mesh(jupiterGeo, jupitermaterial);
    jupiter.position.x = orbitalRadii.jupiter;
    scene.add(jupiter);
}

function createSaturn(texture) {
    const saturnMaterial = new THREE.MeshBasicMaterial({ map: texture });
    const saturnGeo = new THREE.SphereGeometry(3, 35, 35);
    saturn = new THREE.Mesh(saturnGeo, saturnMaterial);
    saturn.position.x = orbitalRadii.saturn;
    scene.add(saturn);

    // Saturn's ring
    const ringGeo = new THREE.RingGeometry(4, 7, 64);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0x888888,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2; // Rotate ring flat
    ring.position.set(0, 0, 0); // Position relative to Saturn
    saturn.add(ring);
}

function createUranus(texture) {
    const uranusmaterial = new THREE.MeshBasicMaterial({ map: texture });
    const uranusGeo = new THREE.SphereGeometry(3, 35, 35);
    uranus = new THREE.Mesh(uranusGeo, uranusmaterial);
    uranus.position.x = orbitalRadii.uranus;
    scene.add(uranus);
}

function createNeptune(texture) {
    const neptunematerial = new THREE.MeshBasicMaterial({ map: texture });
    const neptuneGeo = new THREE.SphereGeometry(3, 35, 35);
    neptune = new THREE.Mesh(neptuneGeo, neptunematerial);
    neptune.position.x = orbitalRadii.neptune;
    scene.add(neptune);
}

function initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 3, 1000, 2);
    pointLight.position.set(0, 0, 0); // Center at Sun
    scene.add(pointLight);

    const lightHelper = new THREE.PointLightHelper(pointLight, 1);
    scene.add(lightHelper);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.1);
    fillLight.position.set(50, 50, 50);
    scene.add(fillLight);
}

function initControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
}

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

    if (width < 768) {
        camera.position.z = 70;
    } else {
        camera.position.z = 50;
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Only update animation if not paused
    if (!isPaused) {
        const elapsedTime = clock.getElapsedTime();

        // Rotate Sun slowly
        sun.rotation.y = elapsedTime * 0.01;
        sun.rotation.x = elapsedTime * 0.02;

        mercury.rotation.x = elapsedTime * 0.2;
        mercury.rotation.y = elapsedTime * 0.02;

        venus.rotation.x = elapsedTime * 0.2;
        venus.rotation.y = elapsedTime * 0.02;

        earth.rotation.x = elapsedTime * 0.2;
        earth.rotation.y = elapsedTime * 0.02;

        mars.rotation.x = elapsedTime * 0.3;
        mars.rotation.y = elapsedTime * 0.32;

        jupiter.rotation.x = elapsedTime * 0.2;
        jupiter.rotation.y = elapsedTime * 0.02;

        saturn.rotation.x = elapsedTime * 0.2;
        saturn.rotation.y = elapsedTime * 0.02;

        uranus.rotation.x = elapsedTime * 0.2;
        uranus.rotation.y = elapsedTime * 0.02;

        neptune.rotation.x = elapsedTime * 0.2;
        neptune.rotation.y = elapsedTime * 0.02;

        // Updated for absolute speed control
        const mercuryAngularVelocity = speedMultipliers.mercury * ANGULAR_SPEED_FACTOR;
        const venusAngularVelocity = speedMultipliers.venus * ANGULAR_SPEED_FACTOR;
        const earthAngularVelocity = speedMultipliers.earth * ANGULAR_SPEED_FACTOR;
        const marsAngularVelocity = speedMultipliers.mars * ANGULAR_SPEED_FACTOR;
        const jupiterAngularVelocity = speedMultipliers.jupiter * ANGULAR_SPEED_FACTOR;
        const saturnAngularVelocity = speedMultipliers.saturn * ANGULAR_SPEED_FACTOR;
        const uranusAngularVelocity = speedMultipliers.uranus * ANGULAR_SPEED_FACTOR;
        const neptuneAngularVelocity = speedMultipliers.neptune * ANGULAR_SPEED_FACTOR;

        // Update planet positions based on adjusted velocities
        mercury.position.x = orbitalRadii.mercury * Math.cos(elapsedTime * mercuryAngularVelocity);
        mercury.position.z = orbitalRadii.mercury * Math.sin(elapsedTime * mercuryAngularVelocity);

        venus.position.x = orbitalRadii.venus * Math.cos(elapsedTime * venusAngularVelocity);
        venus.position.z = orbitalRadii.venus * Math.sin(elapsedTime * venusAngularVelocity);

        earth.position.x = orbitalRadii.earth * Math.cos(elapsedTime * earthAngularVelocity);
        earth.position.z = orbitalRadii.earth * Math.sin(elapsedTime * earthAngularVelocity);

        mars.position.x = orbitalRadii.mars * Math.cos(elapsedTime * marsAngularVelocity);
        mars.position.z = orbitalRadii.mars * Math.sin(elapsedTime * marsAngularVelocity);

        jupiter.position.x = orbitalRadii.jupiter * Math.cos(elapsedTime * jupiterAngularVelocity);
        jupiter.position.z = orbitalRadii.jupiter * Math.sin(elapsedTime * jupiterAngularVelocity);

        saturn.position.x = orbitalRadii.saturn * Math.cos(elapsedTime * saturnAngularVelocity);
        saturn.position.z = orbitalRadii.saturn * Math.sin(elapsedTime * saturnAngularVelocity);

        uranus.position.x = orbitalRadii.uranus * Math.cos(elapsedTime * uranusAngularVelocity);
        uranus.position.z = orbitalRadii.uranus * Math.sin(elapsedTime * uranusAngularVelocity);

        neptune.position.x = orbitalRadii.neptune * Math.cos(elapsedTime * neptuneAngularVelocity);
        neptune.position.z = orbitalRadii.neptune * Math.sin(elapsedTime * neptuneAngularVelocity);
    }

    controls.update();
    renderer.render(scene, camera);
}

// Create UI elements (sliders and pause/play button) dynamically
function createUI() {
    const planets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

    // Create a container for UI elements
    const uiContainer = document.createElement('div');
    uiContainer.style.position = 'absolute';
    uiContainer.style.top = '10px';
    uiContainer.style.left = '10px';
    uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    uiContainer.style.padding = '10px';
    uiContainer.style.borderRadius = '5px';
    uiContainer.style.color = '#ffffff'; // White text for readability
    document.body.appendChild(uiContainer);

    // Dynamically create a slider for each planet
    planets.forEach(planet => {
        const label = document.createElement('label');
        label.textContent = `${planet.charAt(0).toUpperCase() + planet.slice(1)} Speed: `;
        label.style.display = 'block'; // Each slider on a new line

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '1';    // Minimum speed: 1 unit
        slider.max = '100';  // Maximum speed: 100 units
        slider.step = '1';   // Incremental steps: 1 unit
        slider.value = defaultSpeeds[planet].toFixed(2); // Set to calculated default speed
        slider.id = `${planet}-speed`;

        // Update speed value when slider changes
        slider.addEventListener('input', () => {
            speedMultipliers[planet] = parseFloat(slider.value);
        });

        uiContainer.appendChild(label);
        uiContainer.appendChild(slider);
    });

    // Create Pause/Play button
    const pausePlayButton = document.createElement('button');
    pausePlayButton.textContent = 'Pause';
    pausePlayButton.style.marginTop = '10px';
    pausePlayButton.style.display = 'block'; // Ensure button is on a new line

    // Toggle animation state and button text on click
    pausePlayButton.addEventListener('click', () => {
        isPaused = !isPaused;
        pausePlayButton.textContent = isPaused ? 'Play' : 'Pause';
    });

    uiContainer.appendChild(pausePlayButton);
}

function main() {
    initScene();
    initCamera();
    initRenderer();

    const { sunTexture, mercuryTexture, venusTexture, earthTexture, marsTexture, jupiterTexture, saturnTexture, uranusTexture, neptuneTexture } = loadTextures();

    createSun(sunTexture);
    createMercury(mercuryTexture);
    createVenus(venusTexture);
    createEarth(earthTexture);
    createMars(marsTexture);
    createJupiter(jupiterTexture);
    createSaturn(saturnTexture);
    createUranus(uranusTexture);
    createNeptune(neptuneTexture);

    initLights();
    initControls();
    createStarField();
    window.addEventListener('resize', onWindowResize);

    createUI(); // Add UI elements after scene setup

    animate();
}

main();