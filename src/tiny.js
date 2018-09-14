const EPS = 0.001
const clipNear = 0.0;
const clipFar = 40.0;
const stepSize = 0.35;

function vec3(x, y, z) { return [x, y, z] }
function length(v) { return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]); }
function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]] }
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]] }
function scale(v, x) { return [v[0] * x, v[1] * x, v[2] * x] }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]] }
function dot(a, b) { return (a[0] * b[0]) + (a[1] * b[1]) + (a[2] * b[2]) }
function normalize(v) { return scale(v, 1.0 / length(v)) }
function reflect(i, n) { return sub(i, scale(n, 2.0 * dot(n, i))) }
function sdSphere(p, radius) { return length(p) - radius; }
function sinusoidBumps(p) {
  let t = 0;
  return Math.sin(p[0] * 16. + t * 0.57) * Math.cos(p[1] * 16. + t * 2.17) * Math.sin(p[2] * 16. - t * 1.31) +
    0.5 * Math.sin(p[0] * 32. + t * 0.07) * Math.cos(p[1] * 32. + t * 2.11) * Math.sin(p[2] * 32. - t * 1.23);
}
function map(p) { let b = sinusoidBumps(p) * 0.04; return sdSphere(add(p, vec3(b, b, b)), 1.5); }
function getNormal(p) {
  return normalize(vec3(
    map(vec3(p[0] + EPS, p[1], p[2])) - map(vec3(p[0] - EPS, p[1], p[2])),
    map(vec3(p[0], p[1] + EPS, p[2])) - map(vec3(p[0], p[1] - EPS, p[2])),
    map(vec3(p[0], p[1], p[2] + EPS)) - map(vec3(p[0], p[1], p[2] - EPS))
  ));
}

function main() {
  console.time('Render')
  let canvas = document.createElement('canvas')
  let w = canvas.width = 128;
  let h = canvas.height = 128;
  let aspect = 1.0; // w / h;
  document.body.appendChild(canvas)
  let ctx = canvas.getContext('2d')
  let imageData = ctx.createImageData(w, h);
  let data = imageData.data;
  let offs = 0;
  let fov = 1.0;
  let lightPos = [5, 2, -3.5]
  let lookAt = [0, 0, 1.0]
  let camPos = [0, 0, -2.5]
  let forward = normalize(sub(lookAt, camPos));
  let right = normalize(vec3(forward[2], 0.0, -forward[0]));
  let up = normalize(cross(forward, right));
  for (let y = 0; y < h; y++) {
    let dy = y / h;
    for (let x = 0; x < w; x++) {
      let dx = x / w;
      let uvx = ((2.0 * dx) - 1.0) * aspect;
      let uvy = ((2.0 * (1.0 - dy)) - 1.0) * aspect;
      let rd = normalize(add(forward, add(scale(right, uvx * fov), scale(up, uvy * fov))));
      let t = 0.0;
      for (let i = 0; i < 100; i++) {
        let dist = map(add(camPos, scale(rd, t)));
        if ((dist < clipNear) || (t > clipFar)) {
          break;
        }
        t += dist * stepSize;
      }
      let p = add(camPos, scale(rd, t));
      let normal = getNormal(p)
      let sceneColor = [.1, .1, .4]
      if (t < clipFar) {
        let lightDirection = normalize(sub(lightPos, p));
        let eyeDirection = normalize(sub(camPos, p));
        let diffuse = Math.max(0.0, dot(normal, lightDirection));
        let specularPower = 128.0;
        let specular = Math.pow(Math.max(0.0, dot(reflect(scale(lightDirection, -1), normal), eyeDirection)), specularPower);
        let Ka = 0.1
        let Kd = 0.9;
        let objectColor = [1, .8, 0]
        sceneColor = add(sceneColor, scale(objectColor, Ka + diffuse * Kd));
        sceneColor = add(sceneColor, scale(vec3(1, 1, 1), specular))
      }
      data[offs + 0] = sceneColor[0] * 255;
      data[offs + 1] = sceneColor[1] * 255;
      data[offs + 2] = sceneColor[2] * 255;
      data[offs + 3] = 255;
      offs += 4;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  console.timeEnd('Render')
  // requestAnimationFrame(main, canvas)
}
main()
