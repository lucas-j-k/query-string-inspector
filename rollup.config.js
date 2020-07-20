// Configure Rollup Build

import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import globals from 'rollup-plugin-node-globals';
import copy from 'rollup-plugin-copy';
import postcss from 'rollup-plugin-postcss';

const isProduction = process.env.NODE_ENV === "production";

// File paths to parse for production build. Loop through below to generate config objects
const cssPaths = [
  "content/content.css",
  "global/global.css",
];

const jsPaths = [
  "background/background.js",
  "content/content.js",
  "content/init.js",
  "results/results.js"
]


/*  BUILD TAILWIND 
*   Run once when setting up project after cloning - needs a built tailwind file in the dist folder
*   Final css file is not minimised / purged at this point, so we can use extra classes in markup without re-compiling
*/
const tailwindConfig = {
  input: 'src/global/global.css',
  output: {
    file: 'dist/global/global.css'
  },
  plugins: [
    postcss({
      extract: true,
      config: {
        path: './postcss.config.js'
      },
      verbose: true,
    }),
  ],
}


/*
*   DEV CONFIG
*   Bundle content.js with dependencies, move all other js/css files as-is. Doesn't re-compile tailwind every time
*/
const devConfig = {
    input: 'src/content/content.js',
    output: {
      file: 'dist/content/content.js',
      format: 'iife',
    },

    plugins: [ 
      resolve(), 
      globals(),
      copy({
        targets: [
          { src: 'src/background', dest: 'dist' },
          { src: 'src/content/content.css', dest: 'dist/content' },
          { src: 'src/content/init.js', dest: 'dist/content' },
          { src: 'src/results', dest: 'dist' },
          { src: 'src/icons', dest: 'dist' },
          { src: 'src/manifest.json', dest: 'dist' },
        ],
        verbose: true,
      }),
    ]
};


/*
*  PROD CONFIG
*  Bundle content.js, minify all js and css files. Move static files as-is. Purges and minifies the final tailwind file as global.css
*/
const productionConfigs = () => {

  // Functions below push config objects into this array
  const configs = [];

  // Generate config objects for CSS
  const cssConfigs = cssPaths.map(path => {
    configs.push({
      input: `src/${path}`,
      output: {
        file: `dist/${path}`
      },
      plugins: [
        postcss({
          extract: true,
          minimize: true,
          config: {
            path: './postcss.config.js'
          },
          verbose: true,
        }),
      ],
    })
  });

  // Generate config objects for JS
  const jsConfigs = jsPaths.map(path => {
    configs.push({
      input: `src/${path}`,
      output: {
        file: `dist/${path}`,
        format: 'iife',
        plugins: [
            isProduction && terser(),
        ],
      },
      plugins: [
        resolve(), 
        globals(),
      ]
    })
  })

  // Add the move command to the first config, as it won't let us move static files without specifying an input file
  configs[0].plugins.push(
    copy({
      targets: [
        { src: 'src/results/results.html', dest: 'dist/results' },
        { src: 'src/icons', dest: 'dist' },
        { src: 'src/manifest.json', dest: 'dist' },
      ],
      verbose: true,
    }),
  );
  return configs;
}


/*
*   FINAL CONFIG
*   Returns different set of config objects based on CLI arguments passed in from npm script
*/
export default function(cliArgs) {

  // Build only the full, non-purged tailwind file. Run once when starting dev
  if(cliArgs.configTailwind){
    return tailwindConfig;
  }

  // Bundle the content.js file with dependencies, move all other files as-is. Doesn't re-compile tailwind to save time
  if(cliArgs.configDev){
    return devConfig;
  }

  // Minify all css and js files, bundle content.js with deps, and compile a minified, purged version of the tailwind file.
  // NODE_ENV needs to be set to production when calling from CLI, to trigger the tailwind purging.
  if(cliArgs.configProduction){
    return productionConfigs();
  }

  return configs;

}



