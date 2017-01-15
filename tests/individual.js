import chai from 'chai'
var assert = chai.assert

import * as individual from '../lib/metis/individual.js'

describe('Individual object', () => {
    it('Basic creation', () => {
        let ind = new individual.Individual()
        assert.equal(ind.id, 0)
        assert.equal(ind.alive, true)
    })
    it('generate_basic_individual', () => {
        let ind = new individual.generate_basic_individual()
        assert.equal(ind.id, 1)
    })
    it('assign_random_sex', () => {
        let ind = new individual.generate_basic_individual()
        individual.assign_random_sex(ind)
        assert.isDefined(ind.is_female)
    })
})
