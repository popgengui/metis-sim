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

    /** The size of the marker for the Array */
    get size() {
        return this._size
    }


    /** Possible values for the marker */
    get possible_values() {
        return this._possible_values
    }

    set possible_values(possible_values) {
        this._possible_values = possible_values
    }

    /**
     * Returns genomic data to be transmitted.
     * @param {UInt8Array} data - genomic data
     */
    transmit(data) {
        return data.slice()
    }

}


/**
 * A marker of size 1.
 * @extends Marker
 */
export class SimpleMarker extends Marker {
    constructor(possible_values) {
        super(possible_values)
        this._size = 1
    }
}


/**
 * A Single-Nucleotide Polymorphism (SNP).
 * @extends SimpleMarker
 */
export class SNP extends SimpleMarker {
    /** Default for SNP is bi-allelic */
    constructor(possible_values=[0, 1]) {
        super(possible_values)
    }
}


/**
 * A Microsatelite.
 * @extends SimpleMarker
 */
export class MicroSatellite extends SimpleMarker {
    constructor(possible_values) {
        super()
        this.possible_values = possible_values
    }

}



/**
 * A Complete chromosome. It is itself a marker
 * @extends Marker
 */
export class Chromosome extends Marker {
    constructor (markers, distances=null) {  // distances in cMs
        super()
        if (distances != null && (markers.length != distances.length + 1)) {
            throw new RangeError('If distances are defined, its length has to be markers.length-1')
        }
        this._size = 0
        this._markers = markers
        for (let marker of this._markers) {
            this._size += marker.size
        }
        this._distances = distances
    }

    get distances() {
        return this._distances
    }

    get markers() {
        return this._markers
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
}



export const Mito = Sup => class extends Sup {}


export const YChromosome = Sup => class extends Sup {}


export const XChromosome = Sup => class extends Sup {
    get size() {return 2*super.size} // Always double for now

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