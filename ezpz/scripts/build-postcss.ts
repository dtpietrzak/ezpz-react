import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import presetMantine from 'postcss-preset-mantine'
import postcssSimpleVars from 'postcss-simple-vars'
import postcss from 'postcss'
import fs from 'fs'

const buildPostcss = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.time('build-postcss')

    fs.readFile('src/app.css', (err, css) => {
      postcss([
        autoprefixer,
        tailwindcss(),
        presetMantine,
        postcssSimpleVars({
          variables: {
            'mantine-breakpoint-xs': '36em',
            'mantine-breakpoint-sm': '48em',
            'mantine-breakpoint-md': '62em',
            'mantine-breakpoint-lg': '75em',
            'mantine-breakpoint-xl': '88em',
          },
        }),
      ]).process(css, { from: 'src/app.css', to: 'build/app.css' })
        .then(result => {
          fs.writeFile('build/app.css', result.css, () => true)
          if (result.map) {
            fs.writeFile('build/app.css.map', result.map.toString(), () => true)
          }
          console.timeEnd('build-postcss')
          resolve()
        })
        .catch((err) => reject(err))
    })
  })
}

export default buildPostcss