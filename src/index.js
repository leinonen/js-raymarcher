import { render_image } from './lib/raymarcher'

function main() {
  let canvas = document.createElement('canvas')
  canvas.width = 512;
  canvas.height = 512;
  document.body.appendChild(canvas)
  let context = canvas.getContext('2d')

  console.time('Render')
  render_image(context, canvas.width, canvas.height)
  console.timeEnd('Render')
}

window.onload = main
