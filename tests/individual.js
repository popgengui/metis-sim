import chai from 'chai'
var assert = chai.assert

import * as individual from '../lib/metis/individual.js'
import * as test_utils from './test_utils.js'

describe('Individual object', () => {
    it('Basic creation', () => {
        let ind = new individual.Individual()
        assert.isDefined(ind.id)
        assert.equal(ind.alive, true)
    })
    it('assign_random_sex', () => {
        let ind = new individual.generate_basic_individual()
        individual.assign_random_sex(ind)
        assert.isDefined(ind.is_female)
    })
    it('generate_basic_individual', () => {
        let ind = new individual.generate_basic_individual(test_utils.empty_species, 5)
        assert.equal(ind.cycle_born, 5)
        assert.isDefined(ind.id)
    })

})
