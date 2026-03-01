const THREE = require('three');

const gridLimit = 20;
const gridSpacing = 4;
const MAX_SEGMENTS_PER_PIPE = 60;

const startPos = new THREE.Vector3(0, 0, 0);
const pipe = {
    currentPos: startPos,
    segments: 0,
    direction: new THREE.Vector3(1, 0, 0)
};

const advancePipe = (pipe) => {
    if (pipe.segments >= MAX_SEGMENTS_PER_PIPE) return false;

    if (Math.random() < 0.3) {
        const axes = [new THREE.Vector3(1,0,0), new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,1)];
        const validAxes = axes.filter(a => Math.abs(a.dot(pipe.direction)) < 0.1);
        if (validAxes.length > 0) {
            const newAxis = validAxes[Math.floor(Math.random() * validAxes.length)];
            newAxis.multiplyScalar(Math.random() > 0.5 ? 1 : -1);
            pipe.direction.copy(newAxis);
        }
    }

    const nextPos = pipe.currentPos.clone().add(pipe.direction.clone().multiplyScalar(gridSpacing));

    if (Math.abs(nextPos.x) > gridLimit || Math.abs(nextPos.y) > gridLimit || Math.abs(nextPos.z) > gridLimit) {
        pipe.direction.multiplyScalar(-1);
        return true; 
    }

    pipe.currentPos.copy(nextPos);
    pipe.segments++;
    return true;
};

for (let i = 0; i < 100; i++) {
    advancePipe(pipe);
    console.log(`Tick ${i}, Segs: ${pipe.segments}, POS: ${pipe.currentPos.toArray()}, DIR: ${pipe.direction.toArray()}`);
}
