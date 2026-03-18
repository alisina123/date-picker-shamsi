/** @odoo-module **/

import { Component, useState, useRef, onMounted, onWillUnmount } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { deserializeDate, deserializeDateTime } from "@web/core/l10n/dates";
import JalaliUtils from "../js/jalali";

// ── Lang detection: use server-injected variable (most reliable) ─────────────
function isJalaliLang() {
    // window.ODOO_LANG_IS_JALALI is set by views/assets.xml QWeb template
    // before this bundle loads — it reads from request.env.user.lang server-side
    if (typeof window.ODOO_LANG_IS_JALALI !== "undefined") {
        return window.ODOO_LANG_IS_JALALI;
    }
    // Fallback: html lang attribute
    try {
        const lang = document.documentElement.getAttribute("lang") || "";
        return lang.toLowerCase().startsWith("fa");
    } catch (_) { return false; }
}

// ── Outside click hook ───────────────────────────────────────────────────────
function useOutsideClose(onClose) {
    const ref = useRef("root");
    const h = (ev) => { if (ref.el && !ref.el.contains(ev.target)) onClose(); };
    onMounted(() => document.addEventListener("mousedown", h));
    onWillUnmount(() => document.removeEventListener("mousedown", h));
}

// ─────────────────────────────────────────────────────────────────────────────
// Popup with month/year dropdowns
// ─────────────────────────────────────────────────────────────────────────────
export class PersianDatePickerPopup extends Component {
    static template = "persian_date_picker.Popup";
    static props = {
        jalali:           { optional: true },
        type:             String,
        usePersianDigits: Boolean,
        onSelect:         Function,
        onClear:          Function,
    };

    setup() {
        const today = JalaliUtils.today();
        const init  = this.props.jalali || today;
        this.state  = useState({
            viewYear:  init[0],
            viewMonth: init[1],
            hours:     (this.props.jalali && this.props.jalali[3]) || 0,
            minutes:   (this.props.jalali && this.props.jalali[4]) || 0,
            seconds:   (this.props.jalali && this.props.jalali[5]) || 0,
        });
        this.yearSelectRef = useRef("yearSelect");
        // Scroll year dropdown to selected year after each render
        onMounted(() => this._scrollYearToSelected());
    }

    _scrollYearToSelected() {
        const sel = this.yearSelectRef.el;
        if (!sel) return;
        // Find the selected option and scroll it into view
        for (let i = 0; i < sel.options.length; i++) {
            if (parseInt(sel.options[i].value, 10) === this.state.viewYear) {
                sel.selectedIndex = i;
                // Center scroll: put selected option in the middle
                const itemH = sel.scrollHeight / sel.options.length;
                sel.scrollTop = Math.max(0, (i - Math.floor(sel.size / 2)) * itemH);
                break;
            }
        }
    }

    get months() { return JalaliUtils.MONTH_NAMES.map((name, i) => ({ name, i })); }
    get weekdays() { return JalaliUtils.WEEKDAY_SHORT; }

    // Full dynamic year range: 1300 to 1500 (200 years)
    get yearRange() {
        const years = [];
        for (let y = 1300; y <= 1500; y++) years.push(y);
        return years;
    }

    get calendarDays() {
        const { viewYear: jy, viewMonth: jm } = this.state;
        const firstDow    = JalaliUtils.dayOfWeek(jy, jm, 1);
        const daysInMonth = JalaliUtils.monthLength(jy, jm);
        const today       = JalaliUtils.today();
        const sel         = this.props.jalali;
        const cells       = [];
        for (let i = 0; i < firstDow; i++) {
            cells.push({ key: "e" + i, jd: 0, cls: "o_pdp_day o_pdp_empty" });
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const isToday    = today[0]===jy && today[1]===jm && today[2]===d;
            const isSelected = sel && sel[0]===jy && sel[1]===jm && sel[2]===d;
            const col        = (firstDow + d - 1) % 7;
            let cls = "o_pdp_day";
            if (isSelected)               cls += " o_pdp_selected";
            else if (isToday)             cls += " o_pdp_today";
            if (col === 6 && !isSelected) cls += " o_pdp_friday";
            cells.push({ key: "d" + d, jd: d, cls });
        }
        return cells;
    }

    onMonthChange(ev) { this.state.viewMonth = parseInt(ev.target.value, 10); }
    onYearChange(ev)  { this.state.viewYear  = parseInt(ev.target.value, 10); }

    prevMonth() {
        if (this.state.viewMonth === 1) { this.state.viewYear--; this.state.viewMonth = 12; }
        else this.state.viewMonth--;
    }
    nextMonth() {
        if (this.state.viewMonth === 12) { this.state.viewYear++; this.state.viewMonth = 1; }
        else this.state.viewMonth++;
    }

    pickDay(jd) {
        const { viewYear: jy, viewMonth: jm, hours, minutes, seconds } = this.state;
        this.props.onSelect([jy, jm, jd, hours, minutes, seconds]);
    }

    goToday() {
        const t = JalaliUtils.today();
        this.state.viewYear  = t[0];
        this.state.viewMonth = t[1];
        this.props.onSelect([t[0], t[1], t[2], this.state.hours, this.state.minutes, this.state.seconds]);
    }

    clear() { this.props.onClear(); }

    timeChange(ev, part) {
        this.state[part] = Math.max(0, parseInt(ev.target.value, 10) || 0);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Base Jalali field mixin as plain class (no DateField extension)
// ─────────────────────────────────────────────────────────────────────────────
class PersianDateField extends Component {
    static template   = "persian_date_picker.DateField";
    static components = { PersianDatePickerPopup };
    static props      = { ...standardFieldProps };
    static supportedTypes = ["date"];
    static displayName    = "Persian Date";

    setup() {
        this.state = useState({ open: false });
        useOutsideClose(() => { this.state.open = false; });
    }

    get rawValue() { return this.props.record.data[this.props.name]; }

    get jalali() {
        const v = this.rawValue;
        if (!v) return null;
        try { return JalaliUtils.toJalali(v.year, v.month, v.day); }
        catch (_) { return null; }
    }

    get displayValue() {
        const j = this.jalali;
        return j ? JalaliUtils.format(j[0], j[1], j[2]) : "";
    }

    get isReadonly() { return this.props.readonly; }

    togglePicker() {
        if (!this.isReadonly) this.state.open = !this.state.open;
    }

    onSelect(parts) {
        const [jy, jm, jd] = parts;
        const [gy, gm, gd] = JalaliUtils.toGregorian(jy, jm, jd);
        const pad = n => String(n).padStart(2, "0");
        this.props.record.update({
            [this.props.name]: deserializeDate(`${gy}-${pad(gm)}-${pad(gd)}`),
        });
        this.state.open = false;
    }

    onClear() {
        this.props.record.update({ [this.props.name]: false });
        this.state.open = false;
    }
}

class PersianDatetimeField extends Component {
    static template   = "persian_date_picker.DatetimeField";
    static components = { PersianDatePickerPopup };
    static props      = { ...standardFieldProps };
    static supportedTypes = ["datetime"];
    static displayName    = "Persian Datetime";

    setup() {
        this.state = useState({ open: false });
        useOutsideClose(() => { this.state.open = false; });
    }

    get rawValue() { return this.props.record.data[this.props.name]; }

    get jalali() {
        const v = this.rawValue;
        if (!v) return null;
        try {
            const [jy, jm, jd] = JalaliUtils.toJalali(v.year, v.month, v.day);
            return [jy, jm, jd, v.hour || 0, v.minute || 0, v.second || 0];
        } catch (_) { return null; }
    }

    get displayValue() {
        const j = this.jalali;
        if (!j) return "";
        const [jy, jm, jd, h, mi, s] = j;
        const p = n => String(n).padStart(2, "0");
        return `${JalaliUtils.format(jy, jm, jd)} ${p(h)}:${p(mi)}:${p(s)}`;
    }

    get isReadonly() { return this.props.readonly; }

    togglePicker() {
        if (!this.isReadonly) this.state.open = !this.state.open;
    }

    onSelect(parts) {
        const [jy, jm, jd, h = 0, mi = 0, s = 0] = parts;
        const [gy, gm, gd] = JalaliUtils.toGregorian(jy, jm, jd);
        const pad = n => String(n).padStart(2, "0");
        this.props.record.update({
            [this.props.name]: deserializeDateTime(
                `${gy}-${pad(gm)}-${pad(gd)} ${pad(h)}:${pad(mi)}:${pad(s)}`
            ),
        });
        this.state.open = false;
    }

    onClear() {
        this.props.record.update({ [this.props.name]: false });
        this.state.open = false;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Register — always add standalone widgets
// If server says lang=fa, also replace the default "date"/"datetime" widgets
// ─────────────────────────────────────────────────────────────────────────────
const fieldsReg = registry.category("fields");

fieldsReg.add("persian_date", {
    component: PersianDateField,
    supportedTypes: ["date"],
    displayName: "Persian Date",
});
fieldsReg.add("persian_datetime", {
    component: PersianDatetimeField,
    supportedTypes: ["datetime"],
    displayName: "Persian Datetime",
});

// Override default widgets when Persian language is active
if (isJalaliLang()) {
    fieldsReg.add("date", {
        component: PersianDateField,
        supportedTypes: ["date"],
        displayName: "Date",
    }, { force: true });

    fieldsReg.add("datetime", {
        component: PersianDatetimeField,
        supportedTypes: ["datetime"],
        displayName: "Datetime",
    }, { force: true });
}
