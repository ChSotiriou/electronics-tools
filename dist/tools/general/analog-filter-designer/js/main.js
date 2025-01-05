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

        freq = data['data'][0]['value'].map(x => x.abs())

        vout_p = data['data'].filter(x => x.name.toLowerCase() == 'v(vout+)')[0]
        vout_n = data['data'].filter(x => x.name.toLowerCase() == 'v(vout-)')[0]
        
        vout = vout_p['value']
        if (vout_n != undefined) vout = vout.map((x, i) => x.sub(vout_n['value'][i]))

        amplitude = vout.map(x => 10*Math.log10(x.abs()))
        phase = vout.map(x => 180 * x.arg() / Math.PI)
        cutoff = freq[amplitude.indexOf(amplitude.reduce((c, v) => Math.abs(v - (-3)) < Math.abs(c - (-3)) ? v : c ))]

        Plotly.newPlot(document.getElementById('plot'), [{
            x: freq,
            y: amplitude
        }, {
            x: freq,
            y: phase,
            yaxis: 'y2',
            line: {
                dash: 'dot',
            }
        }], {
            margin: { t: 0 },
            showlegend: false,
            yaxis: {
                title: {
                    text: "Attenuation (dB)",
                    font: {color: '#1F77B4'}
                },
                tickfont: {color: '#1F77B4'},
            },
            yaxis2: {
                title: {
                    text: 'Phase (deg)',
                    font: {color: '#FF7F0E'}
                },
                tickfont: {color: '#FF7F0E'},
                overlaying: 'y',
                side: 'right'
            },
            xaxis: {
                type: 'log',
                title: "Frequency (Hz)",
            },
            shapes: [
                plottly_xline(cutoff, y_min=Math.min(...amplitude), y_max=Math.max(...amplitude))
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

    Array.from(document.getElementsByClassName('filter-equation')).forEach(x => x.hidden = true)
    document.getElementById(`eq-${sim_name}`).removeAttribute('hidden')

    document.getElementById('filter-img').src = `assets/${sim_name}.svg`

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
