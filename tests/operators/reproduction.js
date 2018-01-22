const chai = require('chai')
const assert = chai.assert

const all = require('../../../lib/metis-sim/all.js')
const utils = require('../test_utils.js')

//import * as reproduction from '../../lib/metis-sim/operators/reproduction'
//import {assign_random_sex, generate_basic_individual} from '../../lib/metis-sim/individual'
//import {assign_fixed_size_population, generate_n_inds} from '../../lib/metis-sim/population'
//import * as integrated from '../../lib/metis-sim/integrated'


let male1 = all.i_generate_basic_individual(utils.empty_species, 0)
male1.is_female = false
let female1 = all.i_generate_basic_individual(utils.empty_species, 0)
female1.is_female = true

let gmale1 = all.integrated_generate_individual_with_genome(utils.two_SNP_species, 0, all.integrated_create_test_genome)
gmale1.is_female = false
let gfemale1 = all.integrated_generate_individual_with_genome(utils.two_SNP_species, 0, all.integrated_create_test_genome)
gfemale1.is_female = true

let wrapper = new all.ops_rep_WrapperChooser([male1, female1])


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
        let sex_chooser = new all.ops_rep_SexChooser(wrapper, true)
        let choices = sex_chooser.choose()
        let choice = choices.next()
        assert.equal(choice.value.is_female, true)
        choice = choices.next()
        assert.equal(choice.done, true)
    })
    it('RandomChooser', () => {
        //Not perfect
        let random_chooser = new all.ops_rep_RandomChooser(wrapper)
        let choices = random_chooser.choose()
        choices.next()
        choices.next()
        let choice = choices.next()
        assert.equal(choice.done, false)  // infinite
    })
})


describe('Mating', () => {
    it('RandomMater', () => {
        //XXX Insufficient
        let random_mater = new all.ops_rep_RandomMater(null, [female1, male1])
        let mate_generator = random_mater.mate()
        let mates = mate_generator.next()
        assert.equal(mates.value.mother.is_female, true)
        assert.equal(mates.value.father.is_female, false)
    })
})


describe('Individual Generators', () => {
    it('Sexual Generator - no genome', () => {
        let mock_reproductor = {
            species: utils.empty_species,
            cycle: 5
        }
        let generator = new all.ops_rep_NoGenomeSexualGenerator(mock_reproductor, [])
        generator.mother = female1
        generator.father = male1
        let individual = generator.generate()
        assert.equal(individual.cycle_born, 5)
    })  
    it('Standard Sexual Generator - with genome', () => {
        //XXX TBD Very incomplete
        let mock_reproductor = {
            species: utils.two_SNP_species,
            cycle: 5
        }
        let generator = new all.ops_rep_SexualGenerator(mock_reproductor)
        generator.mother = gfemale1
        generator.father = gmale1
        let individual = generator.generate()
        assert.equal(individual.cycle_born, 5)
    })
})


describe('Complete Reproduction', () => {
    it('Base Reproduction', () => {
        let rep = new all.ops_rep_BaseReproduction(utils.empty_species, 10)
        assert.equal(rep.species, utils.empty_species)
        assert.equal(rep.size, 10)
    })
    it('Sexual Reproduction - no genome', () => {
        let rep = new all.ops_rep_NoGenomeSexualReproduction(utils.empty_species, 10)
        assert.equal(rep.species, utils.empty_species)
        assert.equal(rep.size, 10)
        let orig_size = 20
        let individuals = all.p_generate_n_inds(orig_size, () =>
            all.i_assign_random_sex(all.i_generate_basic_individual(utils.empty_species)))
        //let cycle = 2
        let state = {
            cycle: 2,
            individuals
        }
        rep.change(state)
        assert.equal(state.individuals.length, 30)
        assert.equal(state.individuals[state.individuals.length - 1].cycle_born, 2)
        //TBD XXX: Some more testing...
    })
    it('Sexual Reproduction - with genome', () => {
    })
    it('Structured Sexual Reproduction - no genome', () => {
        let rep = new all.ops_rep_NoGenomeStructuredSexualReproduction(
            utils.empty_species, 10, 2)
        assert.equal(rep.species, utils.empty_species)
        assert.equal(rep.deme_size, 10)
        assert.equal(rep.num_pops, 2)
        let orig_size = 20
        let individuals = all.p_generate_n_inds(orig_size, () =>
            all.i_assign_random_sex(all.i_generate_basic_individual(utils.empty_species)))
        all.p_assign_fixed_size_population(individuals, 2)
        let state = {
            cycle: 2,
            individuals
        }
        rep.change(state)
        assert.equal(state.individuals.length, 40)
        assert.equal(state.individuals[state.individuals.length - 1].cycle_born, 2)
        //TBD XXX: Some more testing...
    })
    it('Structured Sexual Reproduction - with genome', () => {
    })
})


describe('Annotators', () => {
    it('Parents', () => {
        let individual = {}
        all.ops_rep_annotate_with_parents(individual, [female1, male1])
        assert.equal(individual.mother, female1.id)
        assert.equal(individual.father, male1.id)
    })
    it('transmit_sexual_genome', () => {
        let individual = all.i_generate_basic_individual(utils.two_SNP_species, 0)
        all.ops_rep_transmit_sexual_genome(individual, [gfemale1, gmale1])
    })
})
