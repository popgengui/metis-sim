//Unlinked makers
import {Species} from '../lib/metis/species'
import {assign_random_sex} from '../lib/metis/individual'
import {generate_n_inds} from '../lib/metis/population'
import {generate_individual_with_genome, create_randomized_genome} from '../lib/metis/integrated'
import * as genotype from '../lib/metis/genotype'

import * as reproduction from '../lib/metis/operators/reproduction'

import {KillOlderGenerations} from '../lib/metis/operators/culling'
import {ExpHe} from '../lib/metis/operators/stats/hz'
import {SexStatistics} from '../lib/metis/operators/stats/demo'

import {RxOperator} from '../lib/metis/operator'

import {do_n_cycles} from '../lib/metis/simulator'


export let simulate = (observer, pop_size=50, genome_size=10, cycles=50) => {
    let unlinked_genome = genotype.generate_unlinked_genome(genome_size,
        () => {return new genotype.SNP()})

    const species = new Species('unlinked', unlinked_genome)

    let individuals = generate_n_inds(pop_size, () =>
        assign_random_sex(generate_individual_with_genome(species, 0, create_randomized_genome)))

    let observable = new RxOperator()
    observable.subscribe(observer)

    let operators = [
        new reproduction.SexualReproduction(species, pop_size),
        new KillOlderGenerations(),
        new SexStatistics(),
        new ExpHe(),
        observable]
    do_n_cycles(cycles, individuals, operators)
}

