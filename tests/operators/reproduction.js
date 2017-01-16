import chai from 'chai'
var assert = chai.assert

import * as reproduction from '../../lib/metis/operators/reproduction.js'
import * as utils from '../utils.js'

describe('Reproduction', () => {
    it('Base Reproduction', () => {
        let rep = new reproduction.BaseReproduction(utils.empty_species, 10)
        assert.equal(rep.species, utils.empty_species)
        assert.equal(rep.size, 10)
    })
})
