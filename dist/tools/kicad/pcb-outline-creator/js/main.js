ID = 0

function getLine(x1, y1, x2, y2, layer = "Edge.Cuts") {
    ID++
    return `(gr_line (start ${x1} ${y1}) (end ${x2} ${y2}) (layer "${layer}") (tstamp ${ID}))`
}

function getArc(startx, starty, midx, midy, endx, endy, layer = "Edge.Cuts") {
    ID++
    return `(gr_arc (start ${startx} ${starty}) (mid ${midx} ${midy}) (end ${endx} ${endy}) (layer "${layer}") (tstamp ${ID}))`
}

const WIDTH_ID = 'rect_width'
const HEIGHT_ID = 'rect_height'
const FILLET_ID = 'fillet'
const LAYER_SELECT_ID = 'layer_select'
const SUBMIT_ID = 'submit_btn'

btn = document.getElementById(SUBMIT_ID)
btn.addEventListener("click", () => {
    width = document.getElementById(WIDTH_ID).value
    height = document.getElementById(HEIGHT_ID).value
    fillet = document.getElementById(FILLET_ID).value
    layer = document.getElementById(LAYER_SELECT_ID).value
    arc_delta = Math.sin(Math.PI / 4) * fillet

    ID = 0

    output_text = "(kicad_pcb (version 20211014) (generator pcbnew)"
    output_text += '(net 0 "")'

    output_text += getLine(fillet, 0, width - fillet, 0, layer)
    output_text += getLine(0, fillet, 0, height - fillet, layer)
    output_text += getLine(fillet, height, width - fillet, height, layer)
    output_text += getLine(width, fillet, width, height - fillet, layer)

    output_text += getArc(0, fillet, fillet - arc_delta, fillet - arc_delta, fillet, 0, layer)
    output_text += getArc(0, height - fillet, fillet - arc_delta, height - fillet - arc_delta, fillet, height, layer)
    output_text += getArc(width - fillet, 0, width - fillet + arc_delta, fillet - arc_delta, width, fillet, layer)
    output_text += getArc(width - fillet, height, width - fillet + arc_delta, height - fillet - arc_delta, width, height - fillet, layer)

    output_text += ')'

    document.getElementById('output').value = output_text
    if (window.isSecureContext && navigator.clipboard)
        navigator.clipboard.writeText(output_text);

    setTimeout(function() {
        if (window.isSecureContext && navigator.clipboard) {
            alert("Outline has been copied to clipboard. Just hit Control-V in KiCad to paste.")
        } else {
            alert("Outline has been generated. Copy it from below and paste into kicad.")
        }
    }, 50);
})
