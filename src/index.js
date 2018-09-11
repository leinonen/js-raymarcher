import { render_image } from './lib/raymarcher'

function main() {
  let canvas = document.createElement('canvas')
  canvas.width = 200;
  canvas.height = 200;
  document.body.appendChild(canvas)
  let context = canvas.getContext('2d')

  console.time('Render')
  render_image(context, 200, 200)
  console.timeEnd('Render')
}

window.onload = main
