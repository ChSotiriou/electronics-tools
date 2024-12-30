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

// Function to add a new task to the table
document.getElementById('addTaskButton').addEventListener('click', function() {
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
});

// Function to remove a task from the table
function removeTask(button) {
    const row = button.parentElement.parentElement;
    row.remove();
}

document.getElementById('generateCommandsBtn').addEventListener('click', function(event) {
    table_list = Array.from(document.getElementById(`mode-list-table`).rows).slice(1)

    table_list = table_list.map(function (row, row_idx) {
        return Array.from(row.cells).slice(0, -1).map(function (cell) {
            return cell.textContent
        })
    })

    params = table_list.map(function (x) {
        return Parameter.createFromListSweep(x)
    })

    totalRuns = params.reduce((iterCount, param) => {
        return iterCount * param.totalValues()
    }, 1)

//     .step param Rx list 1 2 3
// .param R1 table(Rx,1,1k,2,1Meg,3,1k)
// .param R2 table(Rx,1,10k,2,1Meg,3,10Meg)

    command = ""
    command += `.step param run_idx 1 ${totalRuns} 1\n`
    params.forEach((param) => {
        values = param.values.reduce((str, v, i) => {
            return `${str},${i+1},${v}`
        }, "")
        command += `.param ${param.designator} table(run_idx,${values})\n`
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

    debugger
})