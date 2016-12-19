/*eslint-env node*/
'use strict';

let gulp = require('gulp'),
    babel = require('gulp-babel'),
    eslint = require('gulp-eslint'),
    jsdoc = require('gulp-documentation'),
    istanbul = require('gulp-istanbul'),
    mocha = require('gulp-mocha')

const lib_code = ['./lib/**/*.js']
const lint_files = ['*.js', './tests/**/*.js'].concat(lib_code)
const test_files = ['./tests/**/*.js']


gulp.task('build', () => {
   return gulp.src(lib_code)
       .pipe(babel())
       .pipe(gulp.dest('dist'))
})


gulp.task('lint', () => {
    return gulp.src(lint_files)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError())
})


/*
gulp.task('doc', () => {
    let config = require('./jsdoc.json')
    return gulp.src(lib_code, {read: false})
               .pipe(jsdoc(config))
})
*/

gulp.task('pretest', () => {
    require('babel-core/register')
    return gulp.src(lib_code)
               .pipe(istanbul({instrumenter: require('isparta').Instrumenter}))
               .pipe(istanbul.hookRequire())
})

gulp.task('test', ['pretest'], () => {
    require('babel-core/register')
    //require('babel-polyfill')

    return gulp.src(test_files, {read: false})
               .pipe(mocha())
               .pipe(istanbul.writeReports())
})


gulp.task('default', function (cb) {
    let run_sequence = require('run-sequence')
    run_sequence('build', 'doc', cb)
})
