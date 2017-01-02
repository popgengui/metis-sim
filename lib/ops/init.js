/** Operators
 *
 * @module operators
 */

export class BaseOperator {
    apply(individuals, operators) {
        throw TypeError('This is an abstract method')
    }
}
