import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
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
        // Replace process.env references with actual values for browser
        replace({
            'process.env.CIVIC_BRIDGE_URL': JSON.stringify(process.env.CIVIC_BRIDGE_URL || ''),
            'process.env.NODE_ENV': JSON.stringify('production'),
            preventAssignment: true
        }),
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
