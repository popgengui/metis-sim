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
     * @param genotype A {@link Marker}
     */
    constructor (name, genotype) {
        this.name = name
        this.genotype = genotype
    }
}
