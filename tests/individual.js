import chai from 'chai'
var assert = chai.assert

import * as individual from '../lib/metis/individual.js'
import {generate_basic_individual} from '../lib/metis/integrated.js'
import * as utils from './test_utils.js'

describe('Individual object', () => {
    it('Basic creation', () => {
        let ind = new individual.Individual()
        assert.isDefined(ind.id)
        assert.equal(ind.alive, true)
    })
    it('assign_random_sex', () => {
        let ind = new generate_basic_individual()
        individual.assign_random_sex(ind)
        assert.isDefined(ind.is_female)
    })
})
