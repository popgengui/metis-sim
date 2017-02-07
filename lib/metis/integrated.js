import {Individual, generate_basic_individual} from './individual'
import {random_choice} from './utils'


/** Create an individual for a species in a cycle */
export let generate_individual_with_genome = (species, cycle=0,
    genome_generator) => {
    let ind = generate_basic_individual(species, cycle)
    genome_generator(ind)
    return ind
}

export function create_randomized_genome(individual) {
    let species = individual.species
    let genome = species.genome
    let metadata = genome.metadata
    let position = 0
    let genome_buffer = new ArrayBuffer(genome.size)
    let genome_data = new Uint8Array(genome_buffer)
    for (let marker_name of genome.marker_order) {
        let marker = metadata[marker_name]
        let features = marker.markers
        for (let i=0; i<features.length; i++) {
            let possible_values = features[i].possible_values
            genome_data[position + i] = random_choice(possible_values)
        }
        position += marker.size
    }
    individual.genome = genome_data
}