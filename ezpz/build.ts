console.log('Hello World!')

import { renderToStaticMarkup } from 'react-dom/server'
import Home from '../src/pages/index';

import { writeFileSync, existsSync, mkdirSync } from 'fs';

const html = renderToStaticMarkup(Home());

// if build dir doesn't exist, create it
if (!existsSync('./build')) {
  mkdirSync('./build');
}

writeFileSync('./build/index.html', html);