import chai from 'chai'
var assert = chai.assert

import * as reproduction from '../../lib/metis/operators/reproduction'
import {assign_random_sex} from '../../lib/metis/individual'
import {generate_n_inds} from '../../lib/metis/population'
import {generate_basic_individual} from '../../lib/metis/integrated'

import * as test_utils from '../test_utils'


let male1 = generate_basic_individual(test_utils.empty_species, 0)
male1.is_female = false
let female1 = generate_basic_individual(test_utils.empty_species, 0)
female1.is_female = true


describe('Individual Choosers', () => {
    it('Wrapper', () => {
        let wrapper = new reproduction.WrapperChooser([male1, female1])
        let choices = wrapper.choose()
        let choice = choices.next()
        assert.equal(choice.value.is_female, false)
        choice = choices.next()
        assert.equal(choice.value.is_female, true)
        choice = choices.next()
        assert.equal(choice.done, true)
    })
})


describe('Mating', () => {
})


describe('Individual Generators', () => {
})


describe('Complete Reproduction', () => {
    it('Base Reproduction', () => {
        let rep = new reproduction.BaseReproduction(test_utils.empty_species, 10)
        assert.equal(rep.species, test_utils.empty_species)
        assert.equal(rep.size, 10)
    })
    it('Sexual Reproduction - no genome', () => {
        let rep = new reproduction.SexualReproduction(test_utils.empty_species, 10)
        assert.equal(rep.species, test_utils.empty_species)
        assert.equal(rep.size, 10)
        let orig_size = 20
        let individuals = generate_n_inds(orig_size, () =>
            assign_random_sex(generate_basic_individual(test_utils.empty_species)))
        let cycle = 2
        let after_change = rep.change({}, cycle, individuals, {})
        let new_individuals = after_change.individuals
        assert.equal(new_individuals.length, 30)
        assert.equal(new_individuals[new_individuals.length - 1].cycle_born, 2)
        //TBD XXX: Some more testing...
    })
})
