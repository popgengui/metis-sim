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

let wrapper = new reproduction.WrapperChooser([male1, female1])


describe('Individual Choosers', () => {
    it('Wrapper', () => {
        let choices = wrapper.choose()
        let choice = choices.next()
        assert.equal(choice.value.is_female, false)
        choice = choices.next()
        assert.equal(choice.value.is_female, true)
        choice = choices.next()
        assert.equal(choice.done, true)
    })
    it('SexChooser', () => {
        let sex_chooser = new reproduction.SexChooser(wrapper, true)
        let choices = sex_chooser.choose()
        let choice = choices.next()
        assert.equal(choice.value.is_female, true)
        choice = choices.next()
        assert.equal(choice.done, true)
    })
    it('RandomChooser', () => {
        //Not perfect
        let random_chooser = new reproduction.RandomChooser(wrapper)
        let choices = random_chooser.choose()
        choices.next()
        choices.next()
        let choice = choices.next()
        assert.equal(choice.done, false)  // infinite
    })
})


describe('Mating', () => {
    it('RandomMater', () => {
        //Insufficient
        let random_mater = new reproduction.RandomMater(null, [female1, male1])
        let mate_generator = random_mater.mate()
        let mates = mate_generator.next()
        assert.equal(mates.value.mother.is_female, true)
        assert.equal(mates.value.father.is_female, false)
    })
})


describe('Individual Generators', () => {
    it('Standard Sexual Generator - no genome', () => {
        let mock_reproductor = {
            species: test_utils.empty_species,
            cycle: 0
        }
        let generator = new reproduction.StandardSexualGenerator(mock_reproductor)
    })  
    it('Standard Sexual Generator - with genome', () => {
    })
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
    it('Sexual Reproduction - with genome', () => {
    })
})

describe('Annotators', () => {
    it('Parents', () => {
        let individual = {}
        reproduction.annotate_with_parents(individual, [female1, male1])
        assert.equal(individual.mother, female1.id)
        assert.equal(individual.father, male1.id)
    })
})
