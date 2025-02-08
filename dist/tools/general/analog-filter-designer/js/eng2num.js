spiceUnitsMap = {
    'f': 1e-15,
    'p': 1e-12,
    'n': 1e-9,
    'u': 1e-6,
    'm': 1e-3,
    '': 1,
    'k': 1e3,
    'meg': 1e6,
    'g': 1e9,
    't': 1e12
}

unitsMapInverted = Object.create(null)
unitsMapInverted[-15] = 'f'
unitsMapInverted[-12] = 'p'
unitsMapInverted[-9] = 'n'
unitsMapInverted[-6] = 'u'
unitsMapInverted[-3] = 'm'
unitsMapInverted[0] = ''
unitsMapInverted[3] = 'k'
unitsMapInverted[6] = 'M'
unitsMapInverted[9] = 'G'
unitsMapInverted[12] = 'T'

function eng2num(eng) {
    eng = eng.toLowerCase()

    result = eng.match(/\d+/g)
    num = result[0]
    dec = result.length == 2 ? result[1] : 0

    units = eng.match(/[a-z]+/)
    units = units == null ? '' : units[0]
    multiplier = spiceUnitsMap[units]

    return parseFloat(num + '.' + dec) * multiplier
}

function num2eng(num) {
    const toOptionalFixed = (num, digits) =>
        `${Number.parseFloat(num.toFixed(digits))}`;

    scale = Math.floor(Math.log10(num) / 3) * 3
    unit = unitsMapInverted[scale]
    return `${toOptionalFixed(num / 10**scale, 3)} ${unit}`
}
