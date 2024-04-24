import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const resolutions = {
    bigtext: [768, 768],
    cube: [768, 768],
    ecube_2planes: [512, 512],
    ecube_hearts: [512, 512],
    ecube_sliced: [512, 512],
    heartlocket: [400, 300],
    cubespin: [512, 512],
    cirno: [800, 600],
    flag: [800, 600],
};
const NOTEXTURE =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAALUlEQVQ4T2O8w/DzvwoDOwOQZiCHZmRgYPhPrmaQPsZRF4yGwWg6AGfAgc8LADOwDrjWxfJ7AAAAAElFTkSuQmCC";
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
        if (!textureName) textureName = NOTEXTURE;
        textureLoader.load(textureName, function (texture) {
            res(texture);
        });
    });
}
const gltfLoader = new GLTFLoader();
async function loadModel(modelName) {
    return new Promise((res) => {
        gltfLoader.load(modelName, function (gltf) {
            res(gltf.scene);
        });
    });
}

let lastID = "";
/**
 * @type {THREE.WebGLRenderer}
 */
let renderer;
/**
 * @type {THREE.PerspectiveCamera}
 */
let camera;
/**
 * @type {THREE.Scene}
 */
let scene;

async function _init(id, options = {}) {
    let size = resolutions[id];
    if (!size) size = [1, 1];
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, size[0] / size[1], 0.1, 1000);
    renderer = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        antialias: true,
    });
    renderer.shadowMap.enabled = true;
    renderer.setSize(size[0], size[1]);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild(renderer.domElement);

    function quickLight(x, y, z) {
        const light = new THREE.PointLight(0xffffff, 100, 100);
        light.position.x = x;
        light.position.y = y;
        light.position.z = z;
        scene.add(light);
        return light;
    }

    function quickBigLight(x, y, z) {
        const light = new THREE.PointLight(0xffffff, 5000, 5000);
        light.position.x = x;
        light.position.y = y;
        light.position.z = z;
        scene.add(light);
        return light;
    }

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
            break;
        }
        case "heartlocket": {
            let img1 = options.img1 || NOTEXTURE;
            let img2 = options.img2 || NOTEXTURE;

            scene.background = new THREE.Color(0xffffff);

            camera.position.x = 0;
            camera.position.y = 0;
            camera.position.z = 20;
            camera.fov = 17.5;
            camera.updateProjectionMatrix();
            camera.lookAt(0, 0, 0);
            camera.position.x = 2;
            camera.position.y = -0.8;

            let texture1 = await loadTexture(img1);
            texture1.colorSpace = THREE.SRGBColorSpace;
            let material1 = new THREE.MeshStandardMaterial({
                map: texture1,
            });

            let texture2 = await loadTexture(img2);
            texture2.colorSpace = THREE.SRGBColorSpace;
            let material2 = new THREE.MeshStandardMaterial({
                map: texture2,
            });

            let locket1 = await loadModel("models/locket.glb");
            locket1.children[1].material = material1;
            scene.add(locket1);
            let locket2 = await loadModel("models/locket2.glb");
            locket2.children[1].material = material2;
            scene.add(locket2);

            const ambient = new THREE.AmbientLight(0xffffff, 0.1);
            scene.add(ambient);

            quickLight(5, 4, 5);
            quickLight(-5, -3, 1);
            quickLight(6, -4, 3);
            quickLight(2, 6, 2);

            let r = 0;
            let dr = 0;
            let mdr = -0.002;
            let ddr = -0.00005;
            stepFunction = (
                locket1angle = 0,
                locket2angle = 0,
                camerax = 0,
                cameray = 0,
                cameraz = 0,
                droverride = -Infinity
            ) => {
                locket1.rotation.y = locket1angle;
                locket2.rotation.y = locket2angle;
                camera.position.x = camerax;
                camera.position.y = cameray;
                camera.position.z = cameraz;
                camera.lookAt(2, -0.6, 2);
                let udr = 0;
                if (droverride != -Infinity) {
                    udr = droverride;
                } else {
                    udr = dr;
                }
                camera.rotateOnAxis(new THREE.Vector3(0, 0, 1), r + udr);
                r += udr;
                dr += ddr;
                if (dr > mdr) dr = mdr;
            };
            break;
        }
        case "cubespin": {
            camera.position.x = 0;
            camera.position.y = 0;
            camera.position.z = 4;
            camera.fov = 27;
            camera.updateProjectionMatrix();
            camera.lookAt(0, 0, 0);

            let map = await loadTexture(options.img);
            map.colorSpace = THREE.SRGBColorSpace;
            const cube = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshBasicMaterial({ map })
            );
            scene.add(cube);

            stepFunction = (fractionalTurn = 0) => {
                let fullRotate = Math.PI * 2;
                cube.rotation.x = fractionalTurn * fullRotate;
                cube.rotation.y = fractionalTurn * fullRotate;
            };
            break;
        }
        case "cirno": {
            let img = options.img || NOTEXTURE;

            camera.position.x = 20;
            camera.position.y = 7;
            camera.position.z = 30;
            camera.fov = 40;
            camera.updateProjectionMatrix();
            camera.lookAt(5, 7, 0);

            let fumo = await loadModel("models/cirno.glb");
            fumo.rotation.y = Math.PI;
            let map = await loadTexture(img);
            map.colorSpace = THREE.SRGBColorSpace;
            map.flipY = false;
            let material = new THREE.MeshStandardMaterial({
                map,
            });
            fumo.children[0].material = material;
            let scale = 0.6;
            fumo.scale.x = scale;
            fumo.scale.y = scale;
            fumo.scale.z = scale;
            scene.add(fumo);

            let ground = new THREE.Mesh(
                new THREE.PlaneGeometry(999, 999),
                new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                })
            );
            ground.rotation.x = -Math.PI / 2;
            scene.add(ground);

            scene.background = new THREE.Color(0x606060);
            scene.fog = new THREE.Fog(0x606060, 90, 100);

            quickBigLight(50, 50, 0);
            quickBigLight(50, 30, 30);
            quickBigLight(-50, 30, 30);

            scene.add(new THREE.AmbientLight(0xffffff, 0.1));
            break;
        }
        case "flag": {
            let segmentCount = 20;
            let img = options.img || NOTEXTURE;
            let imgWidth = options.imgWidth || 16;
            let imgHeight = options.imgHeight || 16;
            let flagHeight = 4;
            let flagWidth = flagHeight * (imgWidth / imgHeight);
            let skyTexture = await loadTexture(
                "images/equirectangular_sky.jpg"
            );
            skyTexture.colorSpace = THREE.SRGBColorSpace;
            console.log(flagWidth, flagHeight);
            camera.position.z = 10;
            camera.fov = 35;
            camera.updateProjectionMatrix();
            camera.lookAt(0, 0, 0);
            let plane = new THREE.Mesh(
                new THREE.PlaneGeometry(
                    flagWidth,
                    flagHeight,
                    segmentCount,
                    segmentCount
                ),
                new THREE.MeshStandardMaterial({
                    map: await loadTexture(img),
                })
            );
            if (plane.material.map)
                plane.material.map.colorSpace = THREE.SRGBColorSpace;
            plane.position.x = flagWidth / 2;
            camera.position.x += flagWidth / 2;
            let pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.075, 0.075, flagHeight * 2),
                new THREE.MeshStandardMaterial({
                    metalness: 1,
                    roughness: 0.2,
                    envMap: skyTexture,
                    color: 0xffffff,
                })
            );
            pole.position.y = -flagHeight / 2;
            scene.add(pole);
            let sky = new THREE.Mesh(
                new THREE.SphereGeometry(500, 60, 60),
                new THREE.MeshBasicMaterial({
                    map: skyTexture,
                })
            );
            sky.material.side = THREE.BackSide;
            scene.add(sky);

            quickBigLight(20, 20, 20);
            quickBigLight(-50, 10, -20);

            let overts = [...plane.geometry.attributes.position.array];
            let li = 0;

            stepFunction = (frameNumber = 0) => {
                let vertices = plane.geometry.attributes.position.array;
                for (
                    let i = 0;
                    i < plane.geometry.attributes.position.count;
                    i++
                ) {
                    let [x, y] = [
                        overts[i * 3] + flagWidth / 2,
                        overts[i * 3 + 1],
                    ];
                    let xWave = 1;
                    let yWave = 1;
                    let amt = frameNumber / 3;
                    let morphScale = Math.min((x * 2) / flagWidth, 1) * 0.6;
                    let siner =
                        (Math.sin((x + amt) * xWave) +
                            Math.sin((y + amt) * yWave)) /
                        2;
                    vertices[i * 3 + 2] = siner * morphScale;
                    if (
                        Math.abs(
                            Math.sin((y + amt) * yWave) - Math.sin(y * yWave)
                        ) < 0.001
                    ) {
                        console.log("y loop interval is " + (frameNumber - li));
                        li = frameNumber;
                    }
                }
                plane.geometry.attributes.position.needsUpdate = true;
                plane.geometry.computeVertexNormals();
            };
            if (options.debug) {
                window.flapsWeb3DDebugAnimation();
            }

            let grid = new THREE.GridHelper(20, 20);
            grid.rotation.x = Math.PI / 2;
            scene.add(grid);
            scene.add(new THREE.AxesHelper());
            scene.add(plane);
            break;
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

window.flapsWeb3DDebugAnimation = () => {
    let i = 0;
    let a = () => {
        i++;
        stepFunction(i);
        renderer.render(scene, camera);
        requestAnimationFrame(a);
    };
    a();
};

window.flapsWeb3DStep = _step;
window.flapsWeb3DInit = _init;
