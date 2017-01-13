/* eslint-disable global-require */
/* eslint-env node */
'use strict';

let gulp = require('gulp'),
    rollup_babel = require('rollup-plugin-babel'),
    rollup_multi = require('rollup-plugin-multi-entry'),
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

const pkg = require('./package.json')

gulp.task('examples', () => {
    return rollup({
            entry: 'examples/cli/simple.js',
        })
        .pipe(source('simple.js'))
        .pipe(gulp.dest('./build'))
})

gulp.task('rollup', () => {
    return rollup({
            entry: lib_code,
            plugins: [
                rollup_multi(),
                rollup_babel({
                    //presets: [ "es2015-rollup" ],
                    include: lib_code
                })
            ]
        })
        .pipe(source('metis.js'))
        .pipe(gulp.dest('./build'))
})

gulp.task('build', ['rollup', 'examples'], () => {
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
    return gulp.src('build/' + lib_code)
        .pipe(istanbul({
            instrumenter: require('isparta').Instrumenter
        }))
        .pipe(istanbul.hookRequire())
})


gulp.task('test', ['build', 'pretest'], () => {
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
