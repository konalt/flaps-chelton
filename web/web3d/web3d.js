import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

const resolutions = {
    bigtext: [768, 768],
    cube: [768, 768],
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

async function _init(id, options = {}) {
    let size = resolutions[id];
    if (!size) size = [1, 1];
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        60,
        size[0] / size[1],
        0.1,
        1000
    );
    const renderer = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        antialias: true,
    });
    renderer.setSize(size[0], size[1]);
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
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            texture.colorSpace = THREE.SRGBColorSpace;
            const cube = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshStandardMaterial({
                    map: texture,
                    metalness: 1,
                    roughness: 1,
                })
            );
            scene.add(cube);

            const light = new THREE.PointLight(0xffffff, 100, 10);
            light.position.x = 2;
            light.position.y = 1.6;
            light.position.z = 1.5;
            scene.add(light);
            break;
        }
    }

    renderer.render(scene, camera);

    window.flapsWeb3DFinished(size[0], size[1]);
}

window.flapsWeb3DInit = _init;
