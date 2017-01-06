import chai from 'chai'
var assert = chai.assert

import {Individual} from '../lib/individual.js'

describe('Individual object', () => {
    it('Basic creation', () => {
        let ind = new Individual()
        assert.equal(ind.id, 0)
    })
})
