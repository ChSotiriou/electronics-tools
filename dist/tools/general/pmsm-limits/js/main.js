const range = (start, end, step = 1) =>
    Array.from(
        { length: Math.ceil((end - start) / step) },
        (_, i) => i * step + start
    );


function linspace(start, end, num) {
    let arr = [];
    let step = (end - start) / (num - 1);
    for (let i = 0; i < num; i++) {
        arr.push(start + step * i);
    }
    return arr;
}


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

function doPlots(plot_data) {
    colors = [
        'rgb(0, 0.4470, 0.7410)',
        'rgb(0.8500, 0.3250, 0.0980)',
        'rgb(0.9290, 0.6940, 0.1250)',
        'rgb(0.4940, 0.1840, 0.5560)',
        'rgb(0.4660, 0.6740, 0.1880)',
        'rgb(0.3010, 0.7450, 0.9330)',
        'rgb(0.6350, 0.0780, 0.1840)',
    ]

    data = plot_data.map( (data, i) => {
        color = colors[i % colors.length]
        if (data.type == "line") {
            return {
                name: data.label,
                x: data.x,
                y: data.y,
                line: {
                    color: color
                }
            }   
        } else if (data.type == "contour") {
            return [{
                type: 'contour',
                name: data.label,
                x: data.x,
                y: data.y,
                z: data.z,
                showscale: false,
                contours: {
                    start: 0,
                    end: 0,
                    size: 1,
                    coloring: 'lines' // Only show contour lines, not filled
                },
                line: {
                    width: 2,
                },
                colorscale: [[0, color], [1, color]],
                showlegend: true
            }]
        }
    }).flat()

    Plotly.newPlot(document.getElementById('plot-circles'), data, {
        title: 'PMSM Circle Limits',
        xaxis: {
            title: '$i_d$',
            scaleanchor: 'y'  // 👈 Make X scale match Y
        },
        yaxis: {
            title: '$i_q$'
        },

        margin: { t: 0 },
        legend: {
            x: 1,
            y: 0.95,  // Slightly lower to avoid the modebar
            xanchor: 'left',
            yanchor: 'top'
        }

    }, {responsive: true});

}

function updateValidityLimits() {
    Ld = document.getElementById('field_Ld')
    Lq = document.getElementById('field_Lq')

    if (Ld.validity.valid) {
        Lq.min = Ld.valueAsNumber
    }
}

Array.from(document.getElementsByClassName('inputField')).forEach((elem) => {
    elem.addEventListener('change', (event) => {
        updateValidityLimits()

        if (!Array.from(document.getElementsByClassName('inputField')).every(f => f.validity.valid)) {
            return
        }

        inputs = {}
        inputs["Ld"] = document.getElementById('field_Ld').valueAsNumber * 1e-6
        inputs["Lq"] = document.getElementById('field_Lq').valueAsNumber * 1e-6
        inputs["Rs"] = document.getElementById('field_Rs').valueAsNumber * 1e-3
        inputs["P"] = document.getElementById('field_polePairs').valueAsNumber
        inputs["Ke"] = document.getElementById('field_Ke').valueAsNumber
        inputs["lambda_m"] = inputs["Ke"] * 60 / (1000 * inputs["P"] * 2 * Math.PI)

        inputs["currentLimit"] = document.getElementById('field_currentLimit').valueAsNumber
        inputs["Vdc"] = document.getElementById('field_Vdc').valueAsNumber

        inputs["voltageCurvesRPMs"] = document.getElementById('field_voltageCurvesRPM').value.split(",").map(x => Number(x))
        inputs["torqueCurves"] = document.getElementById('field_torqueCurves').value.split(",").map(x => Number(x))

        ax_lims = inputs["currentLimit"] * 1.2

        plot_data = []

        id = linspace(-ax_lims, ax_lims, 100)
        iq = linspace(-ax_lims, ax_lims, 100)

        // current limit circle
        plot_data.push({
            type: "contour",
            x: id,
            y: iq,
            z: iq.map(IQ => id.map(ID => ID ** 2 + IQ ** 2 - inputs["currentLimit"]**2)),
            label: "Current Limit"
        })

        // MTPA Curve
        plot_data.push({
            type: "contour",
            x: id,
            y: iq,
            z: iq.map(IQ => id.map(ID => ID ** 2 - IQ ** 2 + ID*inputs["lambda_m"]/(inputs["Ld"]-inputs["Lq"]))),
            label: "MTPA"
        })

        // Torque Curves
        inputs.torqueCurves.map(Te => 
            plot_data.push({
                type: "contour",
                x: id,
                y: iq,
                z: iq.map(IQ => id.map(ID => 3/2 * inputs.P * (inputs.lambda_m + (inputs.Ld - inputs.Lq)*ID) * IQ - Te  )),
                label: `Te=${Te}`
            })
        )

        // Voltage Curves
        inputs.voltageCurvesRPMs.map(rpm => {
            omega = rpm / 60 * inputs.P * 2 * Math.PI
            vlim = inputs.Vdc
            z = iq.map(IQ => id.map(ID => {
                vd = inputs.Rs*ID - omega*inputs.Lq*IQ
                vq = inputs.Rs*IQ + omega*inputs.Ld*ID + omega*inputs.lambda_m
                return (vlim**2 - (vd*vd + vq*vq))
            }))
            plot_data.push({
                type: "contour",
                x: id,
                y: iq,
                z: z,
                label: `${rpm} rpm`
            })
        })



        doPlots(plot_data)

        // Inputs
        // type = document.getElementById('select-converter-type').value

        // vin_min = document.getElementById('field_Vin_min').valueAsNumber
        // vin_max = document.getElementById('field_Vin_max').valueAsNumber

        // vout = document.getElementById('field_Vout').valueAsNumber
        // vout_ripple = document.getElementById('field_Vout_ripple').valueAsNumber / 1000
        // vin_ripple = document.getElementById('field_Vin_ripple').valueAsNumber / 1000

        // r_max = document.getElementById('field_r_max').valueAsNumber
        // Io_max = document.getElementById('field_Io_max').valueAsNumber
        // fs = document.getElementById('field_fs').valueAsNumber * 1000

        // Rds_on = document.getElementById('field_switch_RdsOn').valueAsNumber / 1000
        // Vd_drop = document.getElementById('field_diode_drop').valueAsNumber

        // cnv = new converterTypeMap[type](
        //     vin_min, vin_max, vout, vout_ripple, vin_ripple,
        //     r_max, Io_max, fs,
        //     Rds_on, Vd_drop
        // )

        // // Outputs
        // document.getElementById('field_duty').valueAsNumber = cnv.duty.toFixed(3)
        // document.getElementById('field_deltaI').valueAsNumber = cnv.deltaI.toFixed(3)
        // document.getElementById('field_L').valueAsNumber = (cnv.L * 1e6).toFixed(3)
        // document.getElementById('field_switch_drop').valueAsNumber = (cnv.Vsw_drop * 1e3).toFixed(3)

        // document.getElementById('field_Cin').valueAsNumber = (cnv.Cin * 1e6).toFixed(3)
        // document.getElementById('field_Cout').valueAsNumber = (cnv.Cout * 1e6).toFixed(3)

        // document.getElementById('field_switch_rms').valueAsNumber = (cnv.Isw_rms).toFixed(3)
        // document.getElementById('field_diode_rms').valueAsNumber = (cnv.Id_rms).toFixed(3)

        // document.getElementById('field_cin_rms').valueAsNumber = (cnv.Icin_rms).toFixed(3)
        // document.getElementById('field_cout_rms').valueAsNumber = (cnv.Icout_rms).toFixed(3)

        // doPlots(cnv)
    })
})

document.getElementById('field_Ld').dispatchEvent(new Event('change'))
