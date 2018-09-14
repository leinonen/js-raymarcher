const iterations = 40;
const E = 0.001;
const clipFar = 10.0;
const stepSize = 0.35;
const { sin, cos, pow, abs, min, max, sqrt, PI } = Math
const objectColor = [1, .8, 0];
let time = 0;

function length(v) { return sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]); }
function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]] }
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]] }
function scale(v, x) { return [v[0] * x, v[1] * x, v[2] * x] }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]] }
function dot(a, b) { return (a[0] * b[0]) + (a[1] * b[1]) + (a[2] * b[2]) }
function N(v) { return scale(v, 1.0 / length(v)) }
function R(i, n) { return sub(i, scale(n, 2.0 * dot(n, i))) }
function B(p, t) { return sin(p[0] * 16. + t * 0.57) * cos(p[1] * 16. + t * 2.17) * sin(p[2] * 16. - t * 1.31) + 0.5 * sin(p[0] * 32. + t * 0.07) * cos(p[1] * 32. + t * 2.11) * sin(p[2] * 32. - t * 1.23); }
function rot(p, a) { let sa = sin(a); let ca = cos(a); return [p[0] * ca - p[1] * sa, p[0] * sa + p[1] * ca, p[2]]; }
function sdSphere(p, radius) { return length(p) - radius; }
function sdBox(p, b) { let d = sub([abs(p[0]), abs(p[1]), abs(p[2])], b); return min(max(d[0], max(d[1], d[2]))) + length([max(d[0], 0), max(d[1], 0), max(d[2], 0)]); }
function sdCross(p, s) { return min(min(sdBox(p, [0.5, s, s]), sdBox(p, [s, 0.5, s])), sdBox(p, [s, s, 0.5])); }
function fmod(num, m) { return ((num < 0) ? abs(m) : 0) + (num % m); }
function mod(p, s) { return [fmod(p[0], s), fmod(p[1], s), fmod(p[2], s)] }
function map(p) { return sdCross(sub(mod(p, 1.0), [.5, .5, .5]), 0.095); }

window.onload = function main() {
  let canvas = document.createElement('canvas');
  canvas.setAttribute('style', 'width: 200px;');
  let w = canvas.width = 80;
  let h = canvas.height = 80;
  document.body.appendChild(canvas)
  let ctx = canvas.getContext('2d')
  let fov = .85;
  let lightPos = [0, 0, -3.5]
  let lookAt = [0, 0, 1.0]
  let camPos = [0, 0, -2.5]
  let forward = N(sub(lookAt, camPos));
  let right = N([forward[2], 0.0, -forward[0]]);
  let up = N(cross(forward, right));
  let Ka = 0.1
  let Kd = 0.9;
  let sp = 128.0;

  function render() {
    time = Date.now() * .0006;
    lookAt[2] = time;
    camPos[2] = lookAt[2] - 2.5
    lightPos[2] = lookAt[2] - 3.5

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
        rd = rot(rd, time * PI * 0.2);
        rd = rot([rd[2], rd[0], rd[1]], -time * PI * 0.3)
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
          let n = N([map([p[0] + E, p[1], p[2]]) - map([p[0] - E, p[1], p[2]]), map([p[0], p[1] + E, p[2]]) - map([p[0], p[1] - E, p[2]]), map([p[0], p[1], p[2] + E]) - map([p[0], p[1], p[2] - E])]);
          let ld = N(sub(lightPos, p));
          let len = length(ld);
          ld = scale(ld, 1 / len);
          let atten = min(1.0 / (0.225 * len * len), 1.0);
          let s = pow(max(0.0, dot(R(scale(ld, -1), n), N(sub(camPos, p)))), sp);
          final = add(final, scale(objectColor, atten * (Ka + Kd * max(0.0, dot(n, ld)))));
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
    requestAnimationFrame(render, canvas)
  }
  render()
}
