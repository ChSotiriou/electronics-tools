var sim_model = ""

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

let rawData = ''

function processSimulation() {
    runSpiceSim(sim_model).then(raw => {
        rawData = raw
        data = ngrp(raw)

        freq = data['data'][0]['v1']
        vout_p = data['data'].filter(x => x.name.toLowerCase() == 'v(vout+)')[0]
        vout_n = data['data'].filter(x => x.name.toLowerCase() == 'v(vout-)')[0]
        
        y_data = vout_p['v1']
        if (vout_n != undefined) y_data = y_data.map((x, i) => x - vout_n['v1'][i])

        y_data = y_data.map(x => 10*Math.log10(x))
        cutoff = freq[y_data.indexOf(y_data.reduce((c, v) => Math.abs(v - (-3)) < Math.abs(c - (-3)) ? v : c ))]

        Plotly.newPlot(document.getElementById('plot'), [{
            x: freq,
            y: y_data
        }], {
            margin: { t: 0 },
            yaxis: {
                title: "Attenuation (dB)",
            },
            xaxis: {
                type: 'log',
                title: "Frequency (Hz)",
            },
            shapes: [
                plottly_xline(cutoff, y_min=Math.min(...y_data), y_max=0)
            ]
        }, {
            responsive: true
        });

    })
}

function update() {
    sim_name = document.getElementById('select-filter-type').value

    Array.from(document.getElementsByClassName('type-input-group')).forEach(x => x.hidden = true)
    Array.from(document.getElementsByClassName(`div-type-${sim_name}`)).forEach(x => x.removeAttribute('hidden'))


    args_elem = Array.from(document.getElementsByClassName(`type-${sim_name}`))
    if (!args_elem.every(x => x.validity.valid)) return

    args = args_elem.map(x => x.value)

    sim_model = createFormattedString(sim_models[sim_name], args)
    document.getElementById('spice-input').textContent = sim_model

    processSimulation()
}

Array.from(document.getElementsByClassName('input-field')).forEach(x => x.addEventListener('change', update))
setTimeout(() => update(), 1000)

document.getElementById('downloadRawData').addEventListener('click', x => downloadBlob(rawData, 'out.raw'))