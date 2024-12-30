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

    static createFromToleranceSweep(inputs) {
        const tolerance = parseFloat(inputs[2])
        const baseValStr = inputs[1].toLowerCase()
        const units = baseValStr.split('').filter((x) => {
            return 'abcdefghijklmnopqrstuvwxyz'.includes(x)
        }).join('')

        const baseVal = parseFloat(baseValStr)
        return new Parameter(inputs[0], 
            [
                `${baseVal*(1-tolerance/100)}${units}`, 
                `${baseVal}${units}`, 
                `${baseVal*(1+tolerance/100)}${units}`
            ])
    }
}
