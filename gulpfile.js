/*eslint-env node*/
'use strict';

let gulp = require('gulp'),
    rollup_babel = require('rollup-plugin-babel'),
    babel = require('gulp-babel'),
    rollup = require('rollup-stream'),
    eslint = require('gulp-eslint'),
    gulpdoc = require('gulp-documentation'),
    istanbul = require('gulp-istanbul'),
    source = require('vinyl-source-stream'),
    mocha = require('gulp-mocha')

const lib_code = ['./lib/**/*.js']
const lint_files = ['*.js', './tests/**/*.js'].concat(lib_code)
const test_files = ['./tests/**/*.js']


gulp.task('build', () => {
    return rollup({
            entry: './lib/main.js',
            plugins: [
                rollup_babel({
                    "presets": [
                        [
                            "es2015", {
                                "modules": false
                            }
                        ]
                    ],
                    "plugins": [
                        "external-helpers"
                    ],
                    include: lib_code
                })
            ]
        })
        .pipe(source('app.js'))
        .pipe(gulp.dest('./dist'))
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
    return gulp.src('./index.js')
        .pipe(gulpdoc('html'))
        .pipe(gulp.dest('docs/gen'))
})


gulp.task('pretest', () => {
    return gulp.src(lib_code)
        .pipe(babel({
            presets: [
                ['es2015', {
                    modules: "commonjs"
                }]
            ]
        }))
        .pipe(istanbul({
            instrumenter: require('isparta').Instrumenter
        }))
        .pipe(istanbul.hookRequire())
})


gulp.task('test', ['pretest'], () => {
    require('babel-register')
        //require('babel-polyfill')

    return gulp.src(test_files, {
            read: false
        })
        .pipe(babel({
            presets: [
                ['es2015', {
                    modules: false
                }]
            ]
        }))
        .pipe(mocha())
        .pipe(istanbul.writeReports())
})


gulp.task('default', function (cb) {
    let run_sequence = require('run-sequence')
    run_sequence('build', 'doc', cb)
})
