/* eslint-disable global-require */
/* eslint-env node */
'use strict';

let gulp = require('gulp'),
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
        .pipe(gulp.dest('./build/examples/cli'))})

gulp.task('build', ['examples_cli'], () => {
    return gulp.src(lib_code, { read: true })
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
        }))
        .pipe(istanbul.hookRequire())
})


gulp.task('test', ['build', 'pretest'], () => {
    return gulp.src(test_files, {read: true})
	.pipe(gulp.dest('build/tests'))
	.pipe(mocha())
	.pipe(istanbul.writeReports())
})


gulp.task('default', function (cb) {
    let run_sequence = require('run-sequence')
    run_sequence('build', 'doc', cb)
})
