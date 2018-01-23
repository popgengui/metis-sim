const chai = require('chai')
const assert = chai.assert

const all = require('../../../lib/metis-sim/all.js')
const utils = require('../test_utils.js')

let i1 = all.integrated_generate_individual_with_genome(
    utils.two_SNP_species, 0, all.integrated_create_test_genome)
let i2 = all.integrated_generate_individual_with_genome(
    utils.two_SNP_species, 0, all.integrated_create_test_genome)


describe('Genepop', () => {
    it('Basic example', () => {
        const saver = new all.ops_stats_utils_SaveGenepop()
	const state = {individuals: [i1, i2], global_parameters: {}}
        saver.change(state)
        console.log(state.global_parameters.SaveGenepop) // eslint-disable-line no-console
	assert.equal(1, 1)
    })
})
