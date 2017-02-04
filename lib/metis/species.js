/** Species
 * 
 * Where a species genotype is specified
 *
 * @module species
 */


/** A species */
export class Species {
    /**
     * A species.
     * @param {string} name
     * @param genome A {@link Genome}
     */
    constructor (name, genome) {
        this.name = name
        this._genome = genome
    }

    get genome() {
        return this._genome
    }
}
