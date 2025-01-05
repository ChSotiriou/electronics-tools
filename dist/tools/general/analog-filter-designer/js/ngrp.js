// Title: differential rc
// Date: Fri Jan  3 23:45:29  2025
// Command: ngspice-44, Build Fri Jan  3 20:55:44 UTC 2025
// Plotname: AC Analysis
// Flags: complex
// No. Variables: 3
// No. Points: 301     
// Variables:
// 	0	frequency	frequency	grid=3
// 	1	v(vout+)	voltage
// 	2	v(vout-)	voltage
// Values:
// 0		1.000000000000000e+00,2.576783217962140e-314
// 	9.999999999210432e-01,-6.283185306187386e-06
// 	7.895683519624650e-11,6.283185306187385e-06
// 1		1.023292992280754e+00,2.576783217962140e-314
// 	9.999999999173221e-01,-6.429539492975107e-06
// 	8.267795619712446e-11,6.429539492975107e-06
// 2		1.047128548050899e+00,2.576783217962140e-314
// 	9.999999999134256e-01,-6.579302706702506e-06
// 	8.657444822783611e-11,6.579302706702506e-06

function ngrp(data) {
    data = data.split('\n')
    function next() {
        ret = data[0]
        data = data.slice(1)
        return ret
    }
    
    out = {}
    
    out['title'] = next().split(': ')[1]
    out['date'] = next().split(': ')[1]
    out['command'] = next().split(': ')[1]
    out['plotName'] = next().split(': ')[1]
    out['flags'] = next().split(': ')[1]
    out['varCount'] = parseInt(next().split(': ')[1])
    out['pointCount'] = parseInt(next().split(': ')[1])

    next()

    out['data'] = []
    for (let i = 0; i < out['varCount']; i++) {
        variable = next().split("\t")
        varidx = parseInt(variable[1])
        varName = variable[2]
        type = variable[3]
        out['data'].push({
            'name': varName,
            'type': type,
            'value': [],
        })
    }

    next()

    for (let i = 0; i < out['pointCount']; i++) {
        for (let j = 0; j < out['varCount']; j++) {
            values = next().split("\t").slice(-1)[0].split(",")
            
            re = parseFloat(values[0])
            im = parseFloat(values[1])
            out['data'][j]['value'].push(Complex(re, im))
        }
    }
    
    return out
}
