const range = (start, end, step = 1) =>
    Array.from(
        { length: Math.ceil((end - start) / step) },
        (_, i) => i * step + start
    );

function doPlots(cnv) {
    duties = range(0, 1, 1e-3)

    Plotly.newPlot(document.getElementById('plot-duty'), [{
        x: duties.map(x => x * 100),
        y: cnv.calculateOutputVoltage(cnv.Vin, duties),
    }], {
        margin: { t: 0 },
        yaxis: {
            title: "Output Voltage (V)",
            range: cnv.type == 'buck' ? [0, cnv.Vin * 1.1] : [0, cnv.Vin * 10]
        },
        xaxis: {
            title: "Duty Cycle (%)"
        }
    });

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
        }
    });
}

const converterTypeMap = {
    'buck': BuckConverter,
    'boost': BoostConverter
}

Array.from(document.getElementsByClassName('inputField')).forEach((elem) => {
    elem.addEventListener('change', (event) => {
        // Inputs
        type = document.getElementById('select-converter-type').value

        vin = document.getElementById('field_Vin').valueAsNumber
        vout = document.getElementById('field_Vout').valueAsNumber
        vout_ripple = document.getElementById('field_Vout_ripple').valueAsNumber / 1000
        vin_ripple = document.getElementById('field_Vin_ripple').valueAsNumber / 1000

        r_max = document.getElementById('field_r_max').valueAsNumber
        Io_max = document.getElementById('field_Io_max').valueAsNumber
        fs = document.getElementById('field_fs').valueAsNumber * 1000

        Rds_on = document.getElementById('field_switch_RdsOn').valueAsNumber / 1000
        Vd_drop = document.getElementById('field_diode_drop').valueAsNumber

        cnv = new converterTypeMap[type](
            vin, vout, vout_ripple, vin_ripple,
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
    switch (event.target.value) {
        case "buck":
            
            break;
    
        case "boost":
            


            break;

        case "buck-boost":


            break;

        default:
            alert("Invalid Case statement - [1]")
    }
    document.getElementById('field_Vin').dispatchEvent(new Event('change'))
})

document.getElementById('field_Vin').dispatchEvent(new Event('change'))
