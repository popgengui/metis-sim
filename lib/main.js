import {Species} from './species.js'
import {assign_random_sex, generate_basic_individual} from './individual.js'
import {generate_n_inds} from './population.js'

import {SexualReproduction} from './ops/reproduction.js'

import {cycle} from './simulator.js'

const size = 20
const species = new Species('test')

let individuals = generate_n_inds(size, () =>
    assign_random_sex(generate_basic_individual(species)))
console.log(individuals)

let ops = [new SexualReproduction(size)]

let state = {individuals, ops}

state = cycle(state.individuals, state.ops)
