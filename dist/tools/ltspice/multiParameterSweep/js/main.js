document.getElementById('sweepMode').addEventListener('change', function(event) {
    all_mode_elem = Array.from(document.getElementsByClassName(`mode-specific`))
    elem = Array.from(document.getElementsByClassName(`mode-${event.target.value}`))

    all_mode_elem.forEach(element => {
        element.style.display = 'none'; // Hide the element
    });
    elem.forEach(element => {
        element.style.display = ''; // Hide the element
    });
})

// Force run sweepMode onChange
document.getElementById('sweepMode').dispatchEvent(new Event("change"))

function cellPreventNewLine(cell) {
    cell.addEventListener('keydown', function(event) {
        if (event.key == 'Enter')
            event.preventDefault()
    })
}

function addParameter() {
    const mode = document.getElementById('sweepMode').value
    const designator = document.getElementById('designator').value.trim()
    
    table = document.getElementById(`mode-${mode}-table`)

    args = Array.from(document.getElementsByClassName(`mode-${mode}`))
    args = args.map(function (x) {return x.value})

    if (designator !== '') {
        // Create a new row for the task
        const row = table.insertRow();

        cell = row.insertCell();
        cell.setAttribute("contenteditable", "plaintext-only");
        cellPreventNewLine(cell)
        cell.textContent = designator;

        args.forEach(function (x, i) {
            cell = row.insertCell();
            cell.setAttribute("contenteditable", "plaintext-only");
            cellPreventNewLine(cell)
            cell.textContent = x;
        })

        // Create delete button cell
        const actionsCell = row.insertCell();
        actionsCell.innerHTML = `
            <button class="btn btn-danger btn-sm" onclick="removeTask(this)">Delete</button>
        `;
    }
}

document.getElementById('addTaskButton').addEventListener('click', addParameter);

// Function to remove a task from the table
function removeTask(button) {
    const row = button.parentElement.parentElement;
    row.remove();
}


function processTable(table_id) {
    table = Array.from(document.getElementById(table_id).rows).slice(1)
    table = table.map(function (row, row_idx) {
        return Array.from(row.cells).slice(0, -1).map(function (cell) {
            return cell.textContent
        })
    })
    return table
}

function generateRunStates(...args) {
    var r = [], max = args.length-1;
    function helper(arr, i) {
        for (var j=0, l=args[i].values.length; j<l; j++) {
            var a = arr.slice(0); // clone arr
            a.push(args[i].values[j]);
            if (i==max)
                r.push(a);
            else
                helper(a, i+1);
        }
    }
    helper([], 0);
    return r;
}

document.getElementById('generateCommandsBtn').addEventListener('click', function(event) {
    table_list = processTable('mode-list-table')
    tolerance_list = processTable('mode-tolerance-table')

    params = []
    params = params.concat(table_list.map(function (x) {
        return Parameter.createFromListSweep(x)
    }))
    params = params.concat(tolerance_list.map(function (x) {
        return Parameter.createFromToleranceSweep(x)
    }))

    runStates = generateRunStates(...params)

    command = ""
    command += `.step param run_idx 1 ${runStates.length} 1\n`
    params.forEach((param, param_idx) => {
        values = runStates.reduce((str, v, i) => {
            return `${str},${i+1},${v[param_idx]}`
        }, "")
        command += `.param ${param.designator} table(run_idx${values})\n`
    })


    document.getElementById('commandOutput').value = command
    if (window.isSecureContext && navigator.clipboard)
        navigator.clipboard.writeText(command);

    setTimeout(function() {
        if (window.isSecureContext && navigator.clipboard) {
            alert("Command has been copied to clipboard.")
        } else {
            alert("Command has been generated. Copy it from below and paste into LTSpice.")
        }
    }, 50);
})