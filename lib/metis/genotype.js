/** @module genotype */

/** A Genomic marker.
 *
 * This is an abstract class.
 */
class Marker {
    constructor () {
        if (new.target === 'Marker')
            throw new TypeError('Cannot construct Marker instances directly')
    }

    /** The size of the marker for the Array */
    get size() {
        throw new TypeError('This needs to be specified')
    }
}


/**
 * A marker of size 1.
 * @extends Marker
 */
class SimpleMarker extends Marker{
    get size() {return 1}
}


/**
 * A Single-Nucleotide Polymorphism (SNP).
 * @extends SimpleMarker
 */
class SNP extends SimpleMarker {

}


/**
 * A Microsatelite.
 * @extends SimpleMarker
 */
class MicroSatellite extends SimpleMarker {

}


/**
 * A Complete linked chromosome.
 * @extends Marker
 */
class LinkedChromosome extends Marker {
    constructor (markers, distances) {  // distances in cMs
        super()
        this.size = 0
        for (let marker of this.markers) {
            this.size += marker.size
        }

    }

    get size() {
        return this.size
        //XXX Size is wrong (what about distances?)
    }
}


const Autosome = Sup => class extends Sup {
    get size() {return 2*super.size}
}


const Mito = Sup => class extends Sup {}


const YChromosome = Sup => class extends Sup {}


const XChromosome = Sup => class extends Sup {
    get size() {return 2*super.size} // Always double for now

}



class Genotype {
    constructor (array, metadata) {
        //Autosome is a map of chromosomes
        this.array = array
        this.metadata = metadata
    }
}
