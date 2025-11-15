import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import svgr from '@svgr/rollup';
import {terser} from 'rollup-plugin-terser';

export default {
    input: 'integration/civicaction-client-renderer.jsx',
    output: {
        file: 'dist/civic-action-renderer.min.js',
        format: 'iife', // Immediately Invoked Function Expression for browser
        name: 'CivicActionRenderer',
        sourcemap: true
    },
    plugins: [
        svgr(),
        resolve({
            extensions: ['.js', '.jsx'],
            browser: true
        }),
        babel({
            babelHelpers: 'bundled',
            presets: ['@babel/preset-react'],
            extensions: ['.js', '.jsx'],
            exclude: 'node_modules/**'
        }),
        commonjs(),
        postcss({
            inject: true, // Inject CSS into JS
            minimize: true
        }),
        terser() // Minify
    ]
    // Don't mark anything as external - bundle everything including React
};
