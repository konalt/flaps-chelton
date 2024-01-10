import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

const resolutions = {
    bigtext: [768, 768],
    cube: [768, 768],
    ecube_2planes: [512, 512],
    ecube_hearts: [512, 512],
    ecube_sliced: [512, 512],
};

const fontLoader = new FontLoader();
async function loadFont(fontName) {
    return new Promise((res) => {
        fontLoader.load(fontName, function (font) {
            res(font);
        });
    });
}
const textureLoader = new THREE.TextureLoader();
async function loadTexture(textureName) {
    return new Promise((res) => {
        if (!textureName)
            textureName =
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAALElEQVQYV2P8z/D/PwMQMAIhCAD5YBrGZySoAKwJi06ESYQUELSCoAKK3QAAUtcn+TTvDwYAAAAASUVORK5CYII=";
        textureLoader.load(textureName, function (texture) {
            res(texture);
        });
    });
}

let lastID = "";
let renderer, camera, scene;

async function _init(id, options = {}) {
    let size = resolutions[id];
    if (!size) size = [1, 1];
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, size[0] / size[1], 0.1, 1000);
    renderer = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        antialias: true,
    });
    renderer.setSize(size[0], size[1]);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild(renderer.domElement);

    switch (id) {
        case "bigtext": {
            let debug = options.debug;
            camera.position.x = 6.9;
            camera.position.y = 1.2;
            camera.position.z = 6.9;
            camera.lookAt(0, 2, 0.5);

            let textMaterial;
            let groundMaterial;

            if (debug) {
                textMaterial = new THREE.MeshNormalMaterial();
                groundMaterial = new THREE.MeshNormalMaterial();
            } else {
                textMaterial = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    metalness: 0.683,
                    roughness: 0.562,
                });

                groundMaterial = new THREE.MeshPhysicalMaterial({
                    color: 0x9b9b9b,
                    roughness: 0,
                    metalness: 0,
                    reflectivity: 1,
                });
            }

            const ground = new THREE.Mesh(
                new THREE.PlaneGeometry(20, 20, 20),
                groundMaterial
            );
            ground.rotation.x = -Math.PI / 2;
            scene.add(ground);
            if (debug) {
                scene.add(new THREE.AxesHelper(1));
            }

            let topText = options.topText;
            let bottomText = options.bottomText;

            let font = await loadFont("fonts/impact.json");
            const text = new THREE.Mesh(
                new TextGeometry(bottomText, {
                    font: font,
                    size: 3,
                    height: 1,
                }),
                textMaterial
            );
            text.rotation.y = Math.PI / 2;
            text.geometry.center();
            text.geometry.computeBoundingBox();
            text.position.y +=
                (text.geometry.boundingBox.max.y -
                    text.geometry.boundingBox.min.y) /
                2;

            scene.add(text);
            const text2 = new THREE.Mesh(
                new TextGeometry(topText, {
                    font: font,
                    size: 1.7,
                    height: 1,
                }),
                textMaterial
            );
            text2.rotation.y = Math.PI / 2;
            text2.geometry.center();
            text2.geometry.computeBoundingBox();
            text2.position.y +=
                (text2.geometry.boundingBox.max.y -
                    text2.geometry.boundingBox.min.y) /
                2;
            text2.position.y +=
                text.geometry.boundingBox.max.y -
                text.geometry.boundingBox.min.y;
            text2.position.y += 0.1;

            scene.add(text2);

            const orangeLight = new THREE.PointLight(0xffb095, 50);
            orangeLight.position.x = 4.5;
            orangeLight.position.y = 3.5;
            orangeLight.position.z = 4;
            scene.add(orangeLight);
            if (debug) {
                scene.add(new THREE.PointLightHelper(orangeLight));
            }

            const blueLight = new THREE.PointLight(0xe5b7ff, 50);
            blueLight.position.x = 5;
            blueLight.position.y = 3;
            blueLight.position.z = -4;
            scene.add(blueLight);
            if (debug) {
                scene.add(new THREE.PointLightHelper(blueLight));
            }

            break;
        }
        case "cube": {
            camera.position.x = 2.5;
            camera.position.y = 1.4;
            camera.position.z = 3;
            camera.fov = 25;
            camera.updateProjectionMatrix();
            camera.lookAt(0, 0, 0);

            let texture = await loadTexture(options.imageURL);
            texture.colorSpace = THREE.SRGBColorSpace;
            const cube = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshStandardMaterial({
                    map: texture,
                    metalness: 1,
                    roughness: 1,
                })
            );
            if (Math.random() > 0.5) {
                cube.rotation.y = Math.PI / 2;
            }
            scene.add(cube);

            const light = new THREE.PointLight(0xffffff, 100, 10);
            light.position.x = 2;
            light.position.y = 1.6;
            light.position.z = 1.5;
            scene.add(light);
            break;
        }
        case "ecube_2planes": {
            camera.position.x = 0;
            camera.position.y = 0;
            camera.position.z = 6;
            camera.fov = 25;
            camera.updateProjectionMatrix();
            camera.lookAt(0, 0, 0);

            let texture = await loadTexture(options.imageURL);
            texture.colorSpace = THREE.SRGBColorSpace;
            let material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
            });
            let geometry = new THREE.PlaneGeometry(1.5, 1.5);
            const plane1 = new THREE.Mesh(geometry, material);
            plane1.position.z = 1.01;
            const plane2 = new THREE.Mesh(geometry, material);
            plane2.position.z = 1;
            plane2.rotation.y = Math.PI;
            const plane3 = new THREE.Mesh(geometry, material);
            plane3.position.z = -1;
            plane3.rotation.y = Math.PI;
            const plane4 = new THREE.Mesh(geometry, material);
            plane4.position.z = -1.01;

            let group = new THREE.Group();
            group.add(plane1);
            group.add(plane2);
            group.add(plane3);
            group.add(plane4);

            scene.add(group);

            stepFunction = (rotate = 0.4, fov = 25, setup = false) => {
                group.rotation.y += rotate;
                camera.fov = fov;
                camera.updateProjectionMatrix();
                if (setup) {
                    group.rotation.y = 0;
                }
            };
            break;
        }
        case "ecube_hearts": {
            camera.position.x = 0;
            camera.position.y = 0;
            camera.position.z = 6;
            camera.fov = 25;
            camera.updateProjectionMatrix();
            camera.lookAt(0, 0, 0);

            let group = new THREE.Group();

            let texture = await loadTexture(options.imageURL);
            texture.colorSpace = THREE.SRGBColorSpace;
            const imagePlane = new THREE.Mesh(
                new THREE.PlaneGeometry(1.3, 1.3),
                new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                })
            );
            group.add(imagePlane);

            let heartsFrontTexture = await loadTexture(
                "images/ecube_hearts_front.png"
            );
            heartsFrontTexture.colorSpace = THREE.SRGBColorSpace;
            const heartsFrontPlane = new THREE.Mesh(
                new THREE.PlaneGeometry(1.5, 1.5),
                new THREE.MeshBasicMaterial({
                    map: heartsFrontTexture,
                    transparent: true,
                })
            );
            heartsFrontPlane.position.z = 0.2;
            group.add(heartsFrontPlane);

            let heartsBackTexture = await loadTexture(
                "images/ecube_hearts_back.png"
            );
            heartsFrontTexture.colorSpace = THREE.SRGBColorSpace;
            const heartsBackPlane = new THREE.Mesh(
                new THREE.PlaneGeometry(1.5, 1.5),
                new THREE.MeshBasicMaterial({
                    map: heartsBackTexture,
                    transparent: true,
                })
            );
            heartsBackPlane.position.z = -0.2;
            group.add(heartsBackPlane);

            scene.add(group);

            stepFunction = (x, y) => {
                group.rotation.x = x;
                group.rotation.y = -y;
            };
            break;
        }
        case "ecube_sliced": {
            camera.position.x = 0;
            camera.position.y = 0;
            camera.position.z = 6;
            camera.fov = 25;
            camera.updateProjectionMatrix();
            camera.lookAt(0, 0, 0);

            let leftTexture = await loadTexture(options.leftSideImageURL);
            leftTexture.colorSpace = THREE.SRGBColorSpace;
            let left = new THREE.Mesh(
                new THREE.PlaneGeometry(1, 2),
                new THREE.MeshBasicMaterial({
                    map: leftTexture,
                    transparent: true,
                })
            );
            left.position.x = -0.53;
            left.position.y = 1.5;
            left.position.z = 1;
            scene.add(left);

            let rightTexture = await loadTexture(options.rightSideImageURL);
            rightTexture.colorSpace = THREE.SRGBColorSpace;
            let right = new THREE.Mesh(
                new THREE.PlaneGeometry(1, 2),
                new THREE.MeshBasicMaterial({
                    map: rightTexture,
                    transparent: true,
                })
            );
            right.position.x = 0.53;
            right.position.y = -1.5;
            right.position.z = 1;
            scene.add(right);

            stepFunction = (lx, ly, fov) => {
                left.position.x = -lx;
                left.position.y = ly;
                right.position.x = lx;
                right.position.y = -ly;
                camera.fov = fov;
                camera.updateProjectionMatrix();
            };
        }
    }

    lastID = id;
    renderer.render(scene, camera);

    if (window.flapsWeb3DFinished) window.flapsWeb3DFinished(size[0], size[1]);
}

let stepFunction = () => {};

async function _step(...args) {
    if (!lastID) return;
    stepFunction(...args);
    renderer.render(scene, camera);
    if (window.flapsWeb3DStepFinished) {
        window.flapsWeb3DStepFinished(
            resolutions[lastID][0],
            resolutions[lastID][1]
        );
    }
}

window.flapsWeb3DStep = _step;
window.flapsWeb3DInit = _init;
