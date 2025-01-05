createFormattedString = function(template, values) {
    return template.replace(/{(\d+)}/g, (match, index) => {
        return typeof values[index] !== 'undefined' ? values[index] : match;
    });
}

downloadBlob = function(data, fileName='out.raw', mimeType='application/octet-stream') {
  var blob, url;
  blob = new Blob([data], {
    type: mimeType
  });
  url = window.URL.createObjectURL(blob);
  downloadURL(url, fileName);
  setTimeout(function() {
    return window.URL.revokeObjectURL(url);
  }, 1000);
};

downloadURL = function(data, fileName) {
  var a;
  a = document.createElement('a');
  a.href = data;
  a.download = fileName;
  document.body.appendChild(a);
  a.style = 'display: none';
  a.click();
  a.remove();
};


const sim_command = `.ac dec 500 1 {0}`

const sim_models = {
    // ----------------------------------------
    'se_rc': `Single Ended RC LPF
R1 Vin Vout+ {1}
C1 Vout+ 0 {2}
VCC Vin 0 AC 1.

${sim_command}
.save V(vout+)

.end`,

    // ----------------------------------------
    'se_rc_hpf': `Single Ended RC HPF
C1 Vin Vout+ {2}
R1 Vout+ 0 {1}
VCC Vin 0 AC 1.

${sim_command}
.save V(vout+)

.end`,

    // ----------------------------------------
    'diff_rc': `Differential RC

R1 Vin Vout+ {1}
R2 0 Vout- {1}
C1 Vout+ Vout- {2}

VCC Vin 0 AC 1.

${sim_command}
.save V(Vout+, Vout-)

.end`,

    // ----------------------------------------
    'lrc_lpf': `LRC LPF 1
L1 Vin 1 {1}
R1 1 Vout+ {2}
C1 Vout+ 0 {3}
VCC Vin 0 AC 1.

${sim_command}
.save V(vout+)

.end`,
}

const spiceinit = `
set filetype=ascii
`
