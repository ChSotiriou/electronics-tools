class Parameter {
    // Constructor method to initialize object properties
    constructor(designator, values) {
        this.designator = designator; // Initialize property1
        this.values = values; // Initialize property2
    }

    totalValues() {
        return this.values.length
    }

    // Static method (called on the class, not on an instance)
    static createFromListSweep(inputs) {
        return new Parameter(inputs[0], inputs[1].replaceAll(' ', '').split(','))
    }
}
