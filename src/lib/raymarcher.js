const EPS = 0.001
const clipNear = 0.0;
const clipFar = 40.0;
const stepSize = 0.35;

function vec3(x, y, z) {
  return [x, y, z]
}

function length(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function scale(v, x) {
  return [v[0] * x, v[1] * x, v[2] * x]
}

function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

function dot(a, b) {
  return (a[0] * b[0]) + (a[1] * b[1]) + (a[2] * b[2])
}

function normalize(v) {
  return scale(v, 1.0 / length(v))
}

function rayDirection(x, y, camPos, lookAt, fov) {
  let forward = normalize(sub(lookAt, camPos));
  let right = normalize(vec3(forward[2], 0.0, -forward[0]));
  let up = normalize(cross(forward, right));
  return normalize(add(forward, add(scale(right, x * fov), scale(up, y * fov))));
}

function sdSphere(p, radius) {
  return length(p) - radius;
}

function map(p) {
  return sdSphere(p, 1.0);
}

function getNormal(p) {
  return normalize(vec3(
    map(vec3(p[0] + EPS, p[1], p[2])) - map(vec3(p[0] - EPS, p[1], p[2])),
    map(vec3(p[0], p[1] + EPS, p[2])) - map(vec3(p[0], p[1] - EPS, p[2])),
    map(vec3(p[0], p[1], p[2] + EPS)) - map(vec3(p[0], p[1], p[2] - EPS))
  ));
}

function raymarch(ro, rd) {
  let t = 0.0;
  for (let i = 0; i < 100; i++) {
    let dist = map(add(ro, scale(rd, t)));
    if ((dist < clipNear) || (t > clipFar)) {
      break;
    }
    t += dist * stepSize;
  }
  return t;
}

const color = (data, offs, r, g, b) => {
  data[offs + 0] = r * 255;
  data[offs + 1] = g * 255;
  data[offs + 2] = b * 255;
  data[offs + 3] = 255;
}

function light(p, normal, lightPos, dist) {
  let lightDirection = normalize(sub(lightPos, p));
  let diffuse = Math.max(0.0, dot(normal, lightDirection));

  let sceneColor = [.1, .1, .4]
  let objectColor = [1, .8, 0]

  if (dist <= clipFar) {
    sceneColor = add(sceneColor, scale(objectColor, diffuse));
    // sceneColor = objectColor;
  }

  return sceneColor;
}

export function render_image(ctx, width, height) {
  let imageData = ctx.createImageData(width, height);
  let data = imageData.data;
  let offs = 0;

  let fov = 1.0;
  let lookAt = [0, 0, 1.0]
  let camPos = [0, 0, -2.5]
  let lightPos = [0, -2, -3.5]

  console.log(getNormal(vec3(0,0,0)));

  for (let y = 0; y < height; y++) {
    let dy = y / height;
    for (let x = 0; x < width; x++) {
      let dx = x / width;

      let aspect = width / height;
      let uvx = ((2.0 * dx) - 1.0) * aspect;
      let uvy = ((2.0 * dy) - 1.0) * aspect;

      let rd = rayDirection(uvx, uvy, camPos, lookAt, fov);
      let t = raymarch(camPos, rd);
      let p = add(camPos, scale(rd, t));
      let normal = getNormal(p)

      let sceneColor = light(p, normal, lightPos, t);

      color(data, offs, sceneColor[0], sceneColor[1], sceneColor[2]);

      offs += 4;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
