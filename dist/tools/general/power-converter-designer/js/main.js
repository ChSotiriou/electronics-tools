const range = (start, end, step = 1) =>
    Array.from(
        { length: Math.ceil((end - start) / step) },
        (_, i) => i * step + start
    );

function plottly_xline(x, y_min = -1e10, y_max = 1e10) {
    return {
        type: 'line',
        x0: x,  // X position where the vertical line starts
        x1: x,  // X position where the vertical line ends
        y0: y_min,  // Y position where the line starts
        y1: y_max, // Y position where the line ends
        line: {
            color: 'red',
            width: 1
        }
    }
}

function plottly_yline(y, x_min = -1e10, x_max = 1e10) {
    return {
        type: 'line',
        y0: y,  // X position where the vertical line starts
        y1: y,  // X position where the vertical line ends
        x0: x_min,  // Y position where the line starts
        x1: x_max, // Y position where the line ends
        line: {
            color: 'red',
            width: 1,
        }
    }
}
function doPlots(cnv) {
    duties = range(0, 1, 1e-3)

    Plotly.newPlot(document.getElementById('plot-duty'), [{
        x: cnv.calculateOutputVoltage(duties),
        y: duties.map(x => x * 100),
    }], {
        margin: { t: 0 },
        yaxis: {
            title: "Duty Cycle (%)",
            // range: cnv.type == 'buck' ? [0, cnv.Vin * 1.1] : [0, cnv.Vin * 10]
            range: [0, 110]
        },
        xaxis: {
            title: "Input Voltage (V)",
            range: [0, (cnv.Vin_max + cnv.Vin_min) * 2]
        },
        shapes: [
            {
                type: 'rect',
                x0: cnv.Vin_min,
                x1: cnv.Vin_max,
                y0: 0,
                y1: 1e10,
                fillcolor: 'rgba(255, 0, 0, 0.2)',
                line: {
                    color: 'red',
                    width: 0
                }
            },
            plottly_yline(cnv.duty_Vmin * 100), plottly_yline(cnv.duty_Vmax * 100),
            plottly_xline(cnv.Vin_min), plottly_xline(cnv.Vin_max)
        ]
    }, {responsive: true});

    Plotly.newPlot(document.getElementById('plot-Irms'), [{
        x: duties.map(x => x * 100),
        y: cnv.calculateSwitchRMSCurrent(duties),
        name: 'Switch RMS Current'
    }, {
        x: duties.map(x => x * 100),
        y: cnv.calculateDiodeRMSCurrent(duties),
        name: 'Diode RMS Current'
    }, {
        x: duties.map(x => x * 100),
        y: cnv.calculateCinRMSCurrent(duties),
        name: 'Cin RMS Current'
    }, {
        x: duties.map(x => x * 100),
        y: cnv.calculateCoutRMSCurrent(duties),
        name: 'Cout RMS Current'
    }], {
        margin: { t: 0 },
        yaxis: {
            title: "RMS Current (A)",
            range: cnv.type == 'buck' ? [0, cnv.Io_max * 1.1] : [0, cnv.Io_max * 10]
        },
        xaxis: {
            title: "Duty Cycle (%)"
        },
        shapes: [
            {
                type: 'rect',
                x0: cnv.duty_Vmax * 100,
                x1: cnv.duty_Vmin * 100,
                y0: 0,
                y1: 1e10,
                fillcolor: 'rgba(255, 0, 0, 0.2)',
                line: {
                    color: 'red',
                    width: 0
                }
            }, 
            plottly_xline(cnv.duty_Vmin * 100), plottly_xline(cnv.duty_Vmax * 100),
        ]
    }, {responsive: true});
}

function updateValidityLimits() {
    type = document.getElementById('select-converter-type').value

    vin_min = document.getElementById('field_Vin_min')
    vin_max = document.getElementById('field_Vin_max')

    vout = document.getElementById('field_Vout')

    if (vin_min.validity.valid) {
        vin_max.min = vin_min.valueAsNumber
    }

    if (vin_min.validity.valid && vin_max.validity.valid) {
        if (type == 'buck') {
            vout.removeAttribute('min')
            vout.max = vin_min.valueAsNumber
        } else if (type == 'boost') {
            vout.min = vin_max.valueAsNumber
            vout.removeAttribute('max')
        }
    }
}

const converterTypeMap = {
    'buck': BuckConverter,
    'boost': BoostConverter
}

Array.from(document.getElementsByClassName('inputField')).forEach((elem) => {
    elem.addEventListener('change', (event) => {
        updateValidityLimits()

        if (!Array.from(document.getElementsByClassName('inputField')).every(f => f.validity.valid)) {
            return
        }

        // Inputs
        type = document.getElementById('select-converter-type').value

        vin_min = document.getElementById('field_Vin_min').valueAsNumber
        vin_max = document.getElementById('field_Vin_max').valueAsNumber

        vout = document.getElementById('field_Vout').valueAsNumber
        vout_ripple = document.getElementById('field_Vout_ripple').valueAsNumber / 1000
        vin_ripple = document.getElementById('field_Vin_ripple').valueAsNumber / 1000

        r_max = document.getElementById('field_r_max').valueAsNumber
        Io_max = document.getElementById('field_Io_max').valueAsNumber
        fs = document.getElementById('field_fs').valueAsNumber * 1000

        Rds_on = document.getElementById('field_switch_RdsOn').valueAsNumber / 1000
        Vd_drop = document.getElementById('field_diode_drop').valueAsNumber

        cnv = new converterTypeMap[type](
            vin_min, vin_max, vout, vout_ripple, vin_ripple,
            r_max, Io_max, fs,
            Rds_on, Vd_drop
        )

        // Outputs
        document.getElementById('field_duty').valueAsNumber = cnv.duty.toFixed(3)
        document.getElementById('field_deltaI').valueAsNumber = cnv.deltaI.toFixed(3)
        document.getElementById('field_L').valueAsNumber = (cnv.L * 1e6).toFixed(3)
        document.getElementById('field_switch_drop').valueAsNumber = (cnv.Vsw_drop * 1e3).toFixed(3)

        document.getElementById('field_Cin').valueAsNumber = (cnv.Cin * 1e6).toFixed(3)
        document.getElementById('field_Cout').valueAsNumber = (cnv.Cout * 1e6).toFixed(3)

        document.getElementById('field_switch_rms').valueAsNumber = (cnv.Isw_rms).toFixed(3)
        document.getElementById('field_diode_rms').valueAsNumber = (cnv.Id_rms).toFixed(3)

        document.getElementById('field_cin_rms').valueAsNumber = (cnv.Icin_rms).toFixed(3)
        document.getElementById('field_cout_rms').valueAsNumber = (cnv.Icout_rms).toFixed(3)

        doPlots(cnv)
    })
})

document.getElementById('select-converter-type').addEventListener('change', event => {
    // hide all imgaes
    Array.from(document.getElementsByClassName('converter-img')).forEach(x => x.hidden = true)
    document.getElementById(`img-${document.getElementById('select-converter-type').value}`).removeAttribute('hidden')

    // show correct image
    document.getElementById('field_Vin_min').dispatchEvent(new Event('change'))
})

document.getElementById('field_Vin_min').dispatchEvent(new Event('change'))
