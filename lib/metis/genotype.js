/** @module genotype */

/** A Genomic marker.
 *
 * This is an abstract class.
 */
export class Marker {
    /**
     * Create a marker.
     * @param {list} possible_values - List of possible values (uint8)
     */
    constructor (possible_values) {
        if (this.constructor === Marker)
            throw new TypeError('Cannot construct Marker instances directly')
        this._possible_values = possible_values
    }


    /** Possible values for the marker */
    get possible_values() {
        return this._possible_values
    }

    set possible_values(possible_values) {
        this._possible_values = possible_values
    }

}




/**
 * A Single-Nucleotide Polymorphism (SNP).
 * @extends Marker
 */
export class SNP extends Marker {
    /** Default for SNP is bi-allelic */
    constructor(possible_values=[0, 1]) {
        super(possible_values)
    }
}


/**
 * A Microsatelite.
 * @extends Marker
 */
export class MicroSatellite extends Marker {
}



/**
 * A Complete chromosome.
 */
export class Chromosome {
    constructor (markers, distances=null) {  // distances in cMs
        if (distances != null && (markers.length != distances.length + 1)) {
            throw new RangeError('If distances are defined, its length has to be markers.length-1')
        }
        this._size = markers.length
        this._markers = markers
        this._distances = distances
    }

    get distances() {
        return this._distances
    }

    get markers() {
        return this._markers
    }
    
    get size() {
        return this._size
    }

    transmit(data) {
        return data.slice()
    }

    reproduce(individual, parents, position) {
        for (let i=0; i<this._size; i++) {
            individual.genome[position + i] = parents[0].genome[position + i]
        }
    }
}


/**
 * A Autosome. This version assumes full linkage and
 * transmits one gamete
 */
export const Autosome = Sup => class extends Sup {
    get size() {return 2*super.size}

    transmit(data) {
        if (Math.random() < 0.5) {
            return data.slice(0, data.length / 2)
        }
        return data.slice(data.length / 2, data.length)

    }


    reproduce(individual, parents, position) {
        ///XXX: Change here 
    }


    get markers() {
        let base_markers = super.markers
        return base_markers.concat(base_markers)
    }
}


/**
 * Chromosome pair.
 */
export class ChromosomePair extends Autosome(Chromosome) {
}


/**
 * A fully UnlinkedAutosome.
 * 
 * This could be done with a {@link LinkedAutosome} with
 * proper distances, but much more efficient
 * 
 * XXX: Do this as a mixin
 */
export const UnlinkedAutosome = Sup => class extends Sup {
    get size() {return 2*super.size}

    transmit(data) {
        let new_data = new ArrayBuffer(data.length / 2)
        let data_view = new Uint8Array(new_data)
        for (let i=0; i<data_view.length; i++) {
            if (Math.random() < 0.5) {
                data_view[i] = data[i]
            }
            else {
                data_view[i] = data[i + data_view.length]
            }
        }
        return data_view
    }

    reproduce(individual, parents, position) {
        ///XXX: Change here 
    }

}


/**
 * A LinkedAutosome.
 * Genomic distances come from Sup.
 */
export const LinkedAutosome = Sup => class extends Sup {
    get size() {return 2*super.size}

    transmit(data) {
        //XXX TBD
    }

    reproduce(individual, parents, position) {
        ///XXX: Change here 
    }
}



export const Mito = Sup => class extends Sup {}


export const YChromosome = Sup => class extends Sup {}


export const XChromosome = Sup => class extends Sup {
    get size() {return 2*super.size} // Always double for now

    reproduce(individual, parents, position) {
        ///XXX: Change here 
    }
}


export class Genome {
    constructor (metadata) {
        //metadata is a map of {string} to {@link Marker}
        this._metadata = metadata
        this._compute_marker_positions()
        let last_marker_name = this._marker_order[this._marker_order.length -1]
        let last_marker_size = this._metadata[last_marker_name].size
        this._size = this.get_marker_start(last_marker_name) + last_marker_size
    }

    _compute_marker_positions() {
        this._marker_order = []
        this._marker_start = new Map()
        let start = 0
        for (let name in this._metadata) {
            this._marker_order.push(name)
            this._marker_start.set(name, start)
            start += this._metadata[name].size
        }
    }

    get_marker_start(name) {
        return this._marker_start.get(name)
    }

    get size() {
        return this._size
    }

    get marker_order() {
        return this._marker_order
    }

    get metadata() {
        return this._metadata
    }
}

export function generate_unlinked_genome(num_markers, marker_generator) {
    let metadata = {}
    let markers = []
    for (let i=0; i<num_markers; i++) {
        markers.push(marker_generator())
    }
    metadata.unlinked = new ChromosomePair(markers)
    return new Genome(metadata)
}