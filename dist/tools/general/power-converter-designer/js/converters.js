class BuckConverter {
    constructor(Vin_min, Vin_max, Vout, Vout_ripple, Vin_ripple, r_max, Io_max, fs, Rds_on, Vd_drop) {
        this.Vin_min = Vin_min
        this.Vin_max = Vin_max

        this.Vout = Vout
        this.Vout_ripple = Vout_ripple
        this.Vin_ripple = Vin_ripple
        this.r_max = r_max
        this.Io_max = Io_max
        this.fs = fs
        this.Rds_on = Rds_on
        this.Vd_drop = Vd_drop

        this.duty;
        this.deltaI;
        this.Vsw_drop;
        this.L;
        this.Cin;
        this.Cout;
        this.Icor;

        this.Isw_rms;
        this.Id_rms;

        this.type = 'buck'

        this.update()
    }

    calculateOutputVoltage(duties) {
        const ret = duties.map(d => {
            return (this.Vout + this.Vd_drop * (1 - d) - d * this.Vsw_drop) / d
        });
        return ret
    }

    calculateSwitchRMSCurrent(duties) {
        return duties.map(d => {
            return this.Io_max * Math.sqrt(d * (1 + this.r_max ** 2 / 12))
        });
    }

    calculateDiodeRMSCurrent(duties) {
        return duties.map(d => {
            return this.Io_max * Math.sqrt((1 - d) * (1 + this.r_max ** 2 / 12))
        });
    }

    calculateCinRMSCurrent(duties) {
        return duties.map(d => {
            return this.Io_max * Math.sqrt(d * (1 - d + this.r_max ** 2 / 12))
        });
    }

    calculateCoutRMSCurrent(duties) {
        return duties.map(d => {
            return this.Io_max * this.r_max / Math.sqrt(12)
        });
    }

    update() {
        // designing at minimum voltage
        this.Vin = this.Vin_min

        this.Icor = this.Io_max
        this.Vsw_drop = this.Io_max * this.Rds_on;

        this.duty = (this.Vout + this.Vd_drop) / (this.Vin - this.Vsw_drop + this.Vd_drop)
        this.duty_Vmin = (this.Vout + this.Vd_drop) / (this.Vin_min - this.Vsw_drop + this.Vd_drop)
        this.duty_Vmax = (this.Vout + this.Vd_drop) / (this.Vin_max - this.Vsw_drop + this.Vd_drop)

        this.deltaI = this.Icor * this.r_max
        this.L = (this.Vout + this.Vd_drop) * (1 - this.duty) / (this.deltaI * this.fs)

        this.Cout = this.deltaI / (8 * this.fs * this.Vout_ripple)
        this.Cin = (1 - this.duty) * this.Icor * this.duty / this.fs / this.Vin_ripple

        this.Isw_rms = this.calculateSwitchRMSCurrent([this.duty])[0]
        this.Id_rms = this.calculateDiodeRMSCurrent([this.duty])[0]

        this.Icin_rms = this.calculateCinRMSCurrent([this.duty])[0]
        this.Icout_rms = this.calculateCoutRMSCurrent([this.duty])[0]
    }
}

class BoostConverter {
    constructor(Vin_min, Vin_max, Vout, Vout_ripple, Vin_ripple, r_max, Io_max, fs, Rds_on, Vd_drop) {
        this.Vin_min = Vin_min
        this.Vin_max = Vin_max

        this.Vout = Vout
        this.Vout_ripple = Vout_ripple
        this.Vin_ripple = Vin_ripple
        this.r_max = r_max
        this.Io_max = Io_max
        this.fs = fs
        this.Rds_on = Rds_on
        this.Vd_drop = Vd_drop

        this.duty;
        this.deltaI;
        this.Vsw_drop;
        this.L;
        this.Cin;
        this.Cout;
        this.Icor;

        this.type = 'boost'

        this.update()
    }

    calculateOutputVoltage(duties) {
        const ret = duties.map(d => {
            return this.Vout + this.Vd_drop - d * (this.Vout - this.Vsw_drop + this.Vd_drop)
        });
        return ret
    }

    calculateSwitchRMSCurrent(duties) {
        return duties.map(d => {
            return this.Io_max / (1 - d) * Math.sqrt(d * (1 + this.r_max ** 2 / 12))
        });
    }

    calculateDiodeRMSCurrent(duties) {
        return duties.map(d => {
            return this.Io_max * Math.sqrt((1 + this.r_max ** 2 / 12) / (1 - d))
        });
    }

    calculateCinRMSCurrent(duties) {
        return duties.map(d => {
            return this.Io_max / (1 - d) * this.r_max / Math.sqrt(12)
        });
    }

    calculateCoutRMSCurrent(duties) {
        return duties.map(d => {
            return this.Io_max * Math.sqrt((d + this.r_max ** 2 / 12) / (1 - d))
        });
    }

    update() {
        this.Vin = this.Vin_min

        this.Vsw_drop = this.Io_max * this.Rds_on;

        this.duty = (this.Vout + this.Vd_drop - this.Vin) / (this.Vout - this.Vsw_drop + this.Vd_drop)
        this.duty_Vmin = (this.Vout + this.Vd_drop - this.Vin_min) / (this.Vout - this.Vsw_drop + this.Vd_drop)
        this.duty_Vmax = (this.Vout + this.Vd_drop - this.Vin_max) / (this.Vout - this.Vsw_drop + this.Vd_drop)

        this.Icor = this.Io_max / (1 - this.duty)

        this.deltaI = this.Icor * this.r_max
        this.L = (this.Vout + this.Vd_drop) * (1 - this.duty) / (this.deltaI * this.fs)

        this.Cout = this.duty * this.Io_max / this.fs / this.Vout_ripple
        // this.Cin = (1 - this.duty) * this.Io_max / this.fs / this.Vout_ripple 
        this.Cin = this.Io_max * this.r_max / (8 * this.fs * this.Vin_ripple * (1 - this.duty))

        this.Isw_rms = this.calculateSwitchRMSCurrent([this.duty])[0]
        this.Id_rms = this.calculateDiodeRMSCurrent([this.duty])[0]

        this.Icin_rms = this.calculateCinRMSCurrent([this.duty])[0]
        this.Icout_rms = this.calculateCoutRMSCurrent([this.duty])[0]
    }
}