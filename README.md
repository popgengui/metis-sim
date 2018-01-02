# A Population Genetics simulator in JavaScript

[![Build Status](https://travis-ci.org/tiagoantao/metis-sim.svg?branch=master)](https://travis-ci.org/tiagoantao/metis-sim) [![Coverage Status](https://coveralls.io/repos/github/tiagoantao/metis-sim/badge.svg?branch=master)](https://coveralls.io/github/tiagoantao/metis-sim?branch=master) [![Code Climate](https://codeclimate.com/github/tiagoantao/metis-sim/badges/gpa.svg)](https://codeclimate.com/github/tiagoantao/metis-sim) [![bitHound Overall Score](https://www.bithound.io/github/tiagoantao/metis-sim/badges/score.svg)](https://www.bithound.io/github/tiagoantao/metis-sim) [![Inline docs](http://inch-ci.org/github/tiagoantao/metis-sim.svg?branch=master)](http://inch-ci.org/github/tiagoantao/metis-sim)

[![dependencies Status](https://david-dm.org/tiagoantao/metis-sim/status.svg)](https://david-dm.org/tiagoantao/metis-sim) [![devDependencies Status](https://david-dm.org/tiagoantao/metis-sim/dev-status.svg)](https://david-dm.org/tiagoantao/metis-sim?type=dev)



## Development roadmap

### A word about modules

The original version of this code had ES6 modules (using rollup and
babel to help). This has proven, at this stage, to be quite difficult
to manage. As such all code was lumped into a single file for now and
module code (non-ES6) is being reduced to the bare minimum. As soon as
ES6 module support for browsers and Node.JS is stable everything will
go back to ES6 modules. For now, its a mess.

### Version 1

Version 1 will support the teaching tool
[metis-sim-web](https://github.com/tiagoantao/metis-web). It will also
be runnable on Node.JS as a stand-alone simulator

### Version 2

ES6 modules

### Version 3

The Node.JS version will be optimized for speed (GPU and C code for CPUs)
