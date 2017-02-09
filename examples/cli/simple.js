import {Species} from '../../lib/metis/species'
import {assign_random_sex, generate_basic_individual} from '../../lib/metis/individual'
import {generate_n_inds} from '../../lib/metis/population'

import {NoGenomeSexualReproduction} from '../../lib/metis/operators/reproduction'
import {SexStatistics} from '../../lib/metis/operators/stats/demo'

import {cycle} from '../../lib/metis/simulator'

const size = 20
const species = new Species('test')

let individuals = generate_n_inds(size, () =>
    assign_random_sex(generate_basic_individual(species)))
//console.log(individuals)

let operators = [new NoGenomeSexualReproduction(species, size), new SexStatistics()]

let state = cycle(individuals, operators)

//console.log(state.individuals)
