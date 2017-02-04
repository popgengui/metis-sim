import chai from 'chai'
var assert = chai.assert

import * as reproduction from '../../lib/metis/operators/reproduction.js'
import * as test_utils from '../test_utils.js'

describe('Reproduction', () => {
    it('Base Reproduction', () => {
        let rep = new reproduction.BaseReproduction(test_utils.empty_species, 10)
        assert.equal(rep.species, test_utils.empty_species)
        assert.equal(rep.size, 10)
    })
})
