import * as THREE from 'three';

class Body {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000,
  );
  components = new Map();

  constructor({ canvas }) {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      canvas,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.camera.position.z = 1000;

    // init lights
    const light = new THREE.AmbientLight(0xeeeeee);
    this.scene.add(light);

    const lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);

    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set(-100, -200, -100);

    this.scene.add(lights[0]);
    this.scene.add(lights[1]);
    this.scene.add(lights[2]);

    // handle resize
    const resizeObserver = new ResizeObserver(() => {
      this._handleResize();
    });
    resizeObserver.observe(canvas);
  }

  setData(data) {
    const torsoWidth = Math.abs(
      data.rightShoulder.position.x - data.leftShoulder.position.x,
    );
    const torsoHeight = Math.abs(
      data.leftShoulder.position.y - data.leftHip.position.y,
    );
    this._renderTorso(
      'torso',
      data.leftShoulder.position.x + torsoWidth / 2,
      data.leftShoulder.position.y - torsoHeight / 2,
      data.rightShoulder.position.x - data.leftShoulder.position.x,
      data.rightHip.position.x - data.leftHip.position.x,
      torsoHeight,
    );

    this._renderHead(
      'head',
      data.nose.position.x,
      data.nose.position.y,
      Math.abs(data.rightEar.position.x - data.leftEar.position.x) / 2,
    );

    this._renderLimb(
      'left-arm',
      data.leftShoulder.position,
      data.leftElbow.position,
      data.leftWrist.position,
    );

    this._renderLimb(
      'right-arm',
      data.rightShoulder.position,
      data.rightElbow.position,
      data.rightWrist.position,
    );

    this._renderLimb(
      'left-leg',
      data.leftHip.position,
      data.leftKnee.position,
      data.leftAnkle.position,
    );

    this._renderLimb(
      'right-leg',
      data.rightHip.position,
      data.rightKnee.position,
      data.rightAnkle.position,
    );

    this.renderer.render(this.scene, this.camera);
  }

  _handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  _getNormalMaterial(color = 0xeeeecc) {
    return new THREE.MeshLambertMaterial({ color });
  }

  _renderHead(label, x, y, radius) {
    let head = this.components.get(label);
    if (head) {
      head.position.set(x, y, 0);
      const oldRadius = head.geometry.parameters.radius;
      const scaleRatio = radius / oldRadius;
      head.scale.set(scaleRatio, scaleRatio, 1);
    } else {
      const geometry = new THREE.SphereBufferGeometry(radius, 32, 32);
      head = new THREE.Mesh(geometry, this._getNormalMaterial());
      head.position.set(x, y, 0);
      this.scene.add(head);
      this.components.set(label, head);
    }
  }

  _renderLimb(label, near, mid, far) {
    let limb = this.components.get(label);
    if (limb) {
      [near, mid, far].forEach((node, i) => {
        limb.bones[i].position.set(node.x, node.y, 0);
      });
    } else {
      const geometry = new THREE.CylinderBufferGeometry(5, 5, 5, 5, 15, 5, 30);

      // create the skin indices and skin weights
      const position = geometry.attributes.position;
      const vertex = new THREE.Vector3();

      const skinIndices = [];
      const skinWeights = [];

      for (let i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(position, i);

        // compute skinIndex and skinWeight based on some configuration data
        const y = vertex.y + 8; //sizing.halfHeight;

        const skinIndex = Math.floor(y / 2); //sizing.segmentHeight);
        const skinWeight = (y % 2) / 2;
        // const skinWeight = (y % sizing.segmentHeight) / sizing.segmentHeight;

        skinIndices.push(skinIndex, skinIndex + 1, 0, 0);
        skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
      }

      geometry.setAttribute(
        'skinIndex',
        new THREE.Uint16BufferAttribute(skinIndices, 4),
      );
      geometry.setAttribute(
        'skinWeight',
        new THREE.Float32BufferAttribute(skinWeights, 4),
      );

      // create skinned mesh and skeleton
      limb = new THREE.SkinnedMesh(geometry, this._getNormalMaterial());

      const bones = [];
      let lastBone = null;
      [near, mid, far].forEach((node) => {
        const bone = new THREE.Bone();
        bone.position.x = node.x;
        bone.position.y = node.y;
        if (lastBone) {
          lastBone.add(bone);
        }
        lastBone = bone;
        bones.push(bone);
      });
      const skeleton = new THREE.Skeleton(bones);
      const rootBone = skeleton.bones[0];
      limb.add(rootBone);

      // bind the skeleton to the mesh
      limb.bind(skeleton);
      limb.position.set(near.x, near.y, 0);

      this.scene.add(limb);
      this.components.set(label, skeleton);
    }
  }

  _renderTorso(label, x, y, topRadius, bottomRadius, height) {
    const geometry = new THREE.CylinderBufferGeometry(
      topRadius,
      bottomRadius,
      height,
      32,
    );
    const torso = new THREE.Mesh(geometry, this._getNormalMaterial());
    torso.position.set(x, y, 0);
    this.scene.add(torso);
    this.components.set(label, torso);
  }
}

export { Body };
