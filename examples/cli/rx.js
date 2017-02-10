import {Species} from '../../lib/metis/species'
import {assign_random_sex, generate_basic_individual} from '../../lib/metis/individual'
import {generate_n_inds} from '../../lib/metis/population'

import {RxOperator} from '../../lib/metis/operator'
import {KillOlderGenerations} from '../../lib/metis/operators/culling'
import {NoGenomeSexualReproduction} from '../../lib/metis/operators/reproduction'
import {SexStatistics} from '../../lib/metis/operators/stats/demo'

import {cycle, do_n_cycles} from '../../lib/metis/simulator'

const size = 20
const species = new Species('test')

let individuals = generate_n_inds(size, () =>
    assign_random_sex(generate_basic_individual(species)))
//console.log(individuals)

let observable = new RxOperator()

let operators = [
    new NoGenomeSexualReproduction(species, size),
    new KillOlderGenerations(),
    new SexStatistics(),
    observable]

observable.subscribe((a) => console.log(1,a))
do_n_cycles(10, individuals, operators)

