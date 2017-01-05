import {Individual} from '../lib/individual.js'
var assert = require('assert')

describe('Individual object', () => {
    it('Basic creation', () => {
        let ind = new Individual()
        assert.equal(ind.id, 0)
    })
})
