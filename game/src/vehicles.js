// Vehicles: stealable cars, simple arcade driving, condition & speed.
export const CAR_MODELS = ['Causeway Coupe', 'Reef Runner GT', 'Palmetto Pickup', 'Cayo Cabrio', 'Shallows Buggy'];
export function makeCar(THREE, color, model) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.75, 4.4), new THREE.MeshPhongMaterial({ color, shininess: 90 }));
  body.position.y = 0.65; body.castShadow = true; g.add(body);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 2.1), new THREE.MeshPhongMaterial({ color: 0x223044, shininess: 120 }));
  cab.position.set(0, 1.25, -0.2); g.add(cab);
  const wm = new THREE.MeshBasicMaterial({ color: 0x14161a });
  [[-1, 1.4], [1, 1.4], [-1, -1.4], [1, -1.4]].forEach(([sx, sz]) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 10), wm);
    w.rotation.z = Math.PI / 2; w.position.set(sx * 1.05, 0.42, sz); g.add(w);
  });
  const light = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.22, 0.1), new THREE.MeshBasicMaterial({ color: 0xfff2b0 }));
  light.position.set(0, 0.7, 2.22); g.add(light);
  return { mesh: g, model, speed: 0, heading: 0, condition: 100, driver: null, parked: true };
}
export function driveCar(car, input, dt, groundH) {
  const accel = input.fwd ? 26 : input.back ? -14 : 0;
  car.speed += accel * dt;
  car.speed -= car.speed * 0.55 * dt; // drag
  if (!input.fwd && !input.back) car.speed -= Math.sign(car.speed) * Math.min(Math.abs(car.speed), 8 * dt);
  car.speed = Math.max(-16, Math.min(46, car.speed));
  if (Math.abs(car.speed) > 0.5) car.heading += (input.left ? 1 : input.right ? -1 : 0) * dt * 1.5 * Math.sign(car.speed);
  car.vy = car.vy || 0;
  const nx = car.mesh.position.x + Math.sin(car.heading) * car.speed * dt;
  const nz = car.mesh.position.z + Math.cos(car.heading) * car.speed * dt;
  car.mesh.position.x = nx; car.mesh.position.z = nz;
  const gy = groundH(nx, nz);
  if (car.airborne) {
    car.vy -= 22 * dt; car.mesh.position.y += car.vy * dt;
    car.airTime = (car.airTime || 0) + dt;
    if (car.mesh.position.y <= gy) { car.mesh.position.y = gy; const at = car.airTime; car.airborne = false; car.airTime = 0; car.justLanded = at; }
  } else {
    car.mesh.position.y = gy;
    // ramp launch check handled by stunts via ramp proximity flag
    if (car.launchVy) { car.airborne = true; car.vy = car.launchVy; car.launchVy = 0; car.mesh.position.y = gy + 0.5; }
  }
  car.mesh.rotation.y = car.heading;
  return car;
}
