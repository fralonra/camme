import { bodyData } from './data';
import { Body } from './body';

const body = new Body({ canvas: document.getElementById('canvas') });

const data = bodyData.reduce((p, c) => {
  p[c.part] = {
    score: c.score,
    position: { x: c.position.x, y: -c.position.y },
  };
  return p;
}, {});
body.setData(data);
setTimeout(function () {
  data.nose.position.x += 10;
  data.leftEar.position.x -= 5;
  body.setData(data);
}, 1000);
// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshBasicMaterial({ color: 0xeeeecc });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// const animate = function () {
//   requestAnimationFrame(animate);

//   cube.rotation.x += 0.01;
//   cube.rotation.y += 0.01;

//   renderer.render(scene, camera);
// };

// animate();
