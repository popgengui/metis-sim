import {Species} from './species.js'
import {assign_random_sex, generate_basic_individual} from './individual.js'
import {generate_n_inds} from './population.js'

import {SexualReproduction} from './operators/reproduction.js'

import {cycle} from './simulator.js'

const size = 20
const species = new Species('test')

let individuals = generate_n_inds(size, () =>
    assign_random_sex(generate_basic_individual(species)))
console.log(individuals)

let operators = [new SexualReproduction(species, size)]

let state = {individuals, operators}

state = cycle(state.individuals, state.operators)

console.log(state.individuals)
