import chai from 'chai'
var assert = chai.assert

import * as individual from '../lib/metis/individual.js'

describe('Individual object', () => {
    it('Basic creation', () => {
        let ind = new individual.Individual()
        assert.equal(ind.id, 0)
    })
})
