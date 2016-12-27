
import {Species} from './species.js'
import {generate_basic_individual} from './individual.js'
import {generate_n_inds} from './population.js'

let species = new Species('test')
console.log(generate_basic_individual(species))
let pop = generate_n_inds(5, () => generate_basic_individual(species))
console.log(pop)
