const iterations = 30;
const E = 0.001
const clipFar = 40.0;
const stepSize = 0.35;
const sin = Math.sin
const cos = Math.cos
const objectColor = [1, .8, 0]

function vec3(x, y, z) { return [x, y, z] }
function length(v) { return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]); }
function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]] }
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]] }
function scale(v, x) { return [v[0] * x, v[1] * x, v[2] * x] }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]] }
function dot(a, b) { return (a[0] * b[0]) + (a[1] * b[1]) + (a[2] * b[2]) }
function N(v) { return scale(v, 1.0 / length(v)) }
function R(i, n) { return sub(i, scale(n, 2.0 * dot(n, i))) }
function sphere(p, radius) { return length(p) - radius; }
function rot(p, a) { let sa = sin(a); let ca = cos(a); return [p[0] * ca - p[1] * sa, p[0] * sa + p[1] * ca, p[2]]; }
function box(p, b) { let d = sub([Math.abs(p[0]), Math.abs(p[1]), Math.abs(p[2])], b); return Math.min(Math.max(d[0], Math.max(d[1], d[2]))) + length([Math.max(d[0], 0), Math.max(d[1], 0), Math.max(d[2], 0)]); }
function B(p, t) { return sin(p[0] * 16. + t * 0.57) * cos(p[1] * 16. + t * 2.17) * sin(p[2] * 16. - t * 1.31) + 0.5 * sin(p[0] * 32. + t * 0.07) * cos(p[1] * 32. + t * 2.11) * sin(p[2] * 32. - t * 1.23); }
function map(p) {
  let t = Date.now() * .0003
  // let b = B(scale(p, 0.5), t) * 0.02;
  // p = add(p, [b, b, b]);
  // return sphere(add(p, vec3(b, b, b)), 1.5); 
  let a = Math.PI * .125 + t * Math.PI;
  p = rot(p, a);
  p = rot([p[2], p[0], p[1]], -a)
  return box(p, [1, 1, 1])
}

window.onload = function main() {
  let canvas = document.createElement('canvas')
  let w = canvas.width = 50;
  let h = canvas.height = 50;
  document.body.appendChild(canvas)
  let ctx = canvas.getContext('2d')
  let fov = .85;
  let lightPos = [5, 2, -3.5]
  let lookAt = [0, 0, 1.0]
  let camPos = [0, 0, -2.5]
  let forward = N(sub(lookAt, camPos));
  let right = N(vec3(forward[2], 0.0, -forward[0]));
  let up = N(cross(forward, right));
  let Ka = 0.1
  let Kd = 0.9;
  let sp = 128.0;

  function render() {
    // console.time('Render')
    let imageData = ctx.createImageData(w, h);
    let data = imageData.data;
    let offs = 0;
    let dydh = 1 / h
    let dxdw = 1 / w
    let dy = 0;
    let dx = 0;
    for (let y = 0; y < h; y++) {
      dx = 0;
      for (let x = 0; x < w; x++) {
        let uvx = ((2.0 * dx) - 1.0);
        let uvy = ((2.0 * (1.0 - dy)) - 1.0);
        let rd = N(add(forward, add(scale(right, uvx * fov), scale(up, uvy * fov))));
        let t = 0.0;
        for (let i = 0; i < iterations; i++) {
          let dist = map(add(camPos, scale(rd, t)));
          if ((dist < 0.0) || (t > clipFar)) {
            break;
          }
          t += dist * stepSize;
        }
        let final = [.2, .2, .2]
        if (t < clipFar) {
          let p = add(camPos, scale(rd, t));
          let normal = N([map([p[0] + E, p[1], p[2]]) - map([p[0] - E, p[1], p[2]]), map([p[0], p[1] + E, p[2]]) - map([p[0], p[1] - E, p[2]]), map([p[0], p[1], p[2] + E]) - map([p[0], p[1], p[2] - E])]);
          let ld = N(sub(lightPos, p));
          let s = Math.pow(Math.max(0.0, dot(R(scale(ld, -1), normal), N(sub(camPos, p)))), sp);
          final = add(final, scale(objectColor, Ka + Kd * Math.max(0.0, dot(normal, ld))));
          final = add(final, [s, s, s])
        }
        data[offs++] = final[0] * 255;
        data[offs++] = final[1] * 255;
        data[offs++] = final[2] * 255;
        data[offs++] = 0xFF;
        dx += dxdw;
      }
      dy += dydh
    }
    ctx.putImageData(imageData, 0, 0);
    // console.timeEnd('Render')
    requestAnimationFrame(render, canvas)
  }
  render()
}
