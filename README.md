# Cherry-soda Minifier

A minifier for made for [esbuild](https://esbuild.github.io), used
in [cherry-soda](https://github.com/drinking-code/cherry-soda).

**Install** with `npm i @cherry-soda/minifier`

This package provides multiple plugins:

### JS Minifier

Largely adopted from [terser-webpack-plugin](https://github.com/webpack-contrib/terser-webpack-plugin).
Refer to the project's docs for details on the options.

> `parallel` is not implemented, yet

Use like this:

```javascript
import esbuild from 'esbuild'
import {jsMinifierPlugin} from '@cherry-soda/minifier'

esbuild.build({
    // ...
    plugins: [
        // ...
        jsMinifierPlugin({
            // ...
        })
        // ...
    ],
    // ...
})
```

### CSS Minifier

Largely adopted from [css-minimizer-webpack-plugin](https://github.com/webpack-contrib/css-minimizer-webpack-plugin).
Refer to the project's docs for details on the options.

> `parallel` is not implemented, yet

Use like this:

```javascript
import esbuild from 'esbuild'
import {cssMinifierPlugin} from '@cherry-soda/minifier'

esbuild.build({
    // ...
    plugins: [
        // ...
        cssMinifierPlugin({
            // ...
        })
        // ...
    ],
    // ...
})
```
