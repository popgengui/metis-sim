/* eslint-disable global-require */
/* eslint-env node */
'use strict';

let gulp = require('gulp'),
    rollup_babel = require('rollup-plugin-babel'),
    rollup_multi = require('rollup-plugin-multi-entry'),
    rollup_resolve = require('rollup-plugin-node-resolve'),
    rollup_common = require('rollup-plugin-commonjs'),
    babel = require('gulp-babel'),
    rollup = require('rollup-stream'),
    eslint = require('gulp-eslint'),
    gulpdoc = require('gulp-documentation'),
    istanbul = require('gulp-istanbul'),
    source = require('vinyl-source-stream'),
    flatmap = require('gulp-flatmap'),
    mocha = require('gulp-mocha')

const lib_code = ['./lib/metis/*.js']
const lint_files = ['*.js', './tests/**/*.js'].concat(lib_code)
const test_files = ['./tests/**/*.js']

const pkg = require('./package.json')

gulp.task('examples_cli', () => {
    return gulp.src('examples/cli/*.js')
        .pipe(flatmap( (stream, file) => {
            return rollup({
                entry: file.path,
                plugins: [
                    rollup_resolve({preferBuiltins: false}),
                rollup_common({
                    namedExports: {
                        'node_modules/events/events.js' : ['EventEmitter']
                    }
                })]
            })
            .pipe(source(file.relative))
            .pipe(gulp.dest('./build/examples/cli'))
        }))
})

gulp.task('web', () => {
    return rollup({
                entry: 'web/metis.js',
                format: 'iife',
                name: 'metis',
                plugins: [
                    rollup_resolve({preferBuiltins: false}),
                    rollup_common({
                        namedExports: {
                            'node_modules/events/events.js' : ['EventEmitter']
                        }
                    })
                ]
            })
            .pipe(source('metis.js'))
            //.pipe(babel(({presets: ['es2015']})))
            .pipe(gulp.dest('./build/web'))
})

gulp.task('rollup', () => {
    return rollup({
            input: lib_code,
            plugins: [
                rollup_multi(),
                rollup_resolve({preferBuiltins: false}),
                rollup_common({
                    namedExports: {
                        'node_modules/events/events.js' : ['EventEmitter']
                    }
                }),
                rollup_babel({
                    //presets: [ "es2015-rollup" ],
                    include: lib_code
                })
            ]
        })
        .pipe(source('metis.js'))
        .pipe(gulp.dest('./build'))
})

gulp.task('build', ['rollup', 'examples_cli', 'web'], () => {
    return gulp.src(lib_code, {
            read: true
        })
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('build/lib'))
})

gulp.task('lint', () => {
    return gulp.src(lint_files)
        .pipe(eslint({
            ecmaVersion: 6,
            envs: ['es6'],
            parserOptions: {sourceType: 'module'},
            useEslintrc: false
        }))
        .pipe(eslint.format())
        .pipe(eslint.failOnError())
})


gulp.task('doc', () => {
    return gulp.src(lib_code)
        .pipe(gulpdoc('html', {}, {
            name: 'Metis',
            version: pkg.version
        }))
        .pipe(gulp.dest('docs/api'))
})


gulp.task('pretest', () => {
    return gulp.src('build/' + lib_code[0]) //XXX silly
        .pipe(istanbul({
            instrumenter: require('isparta').Instrumenter
        }))
        .pipe(istanbul.hookRequire())
})


gulp.task('test', ['build', 'pretest'], () => {
    require('babel-polyfill')
    return gulp.src(test_files, {
            read: true
        })
        .pipe(babel({
            presets: [
                'es2015'
            ]
        }))
       .pipe(gulp.dest('build/tests'))
       .pipe(mocha())
       .pipe(istanbul.writeReports())
})


gulp.task('default', function (cb) {
    let run_sequence = require('run-sequence')
    run_sequence('build', 'doc', cb)
})
