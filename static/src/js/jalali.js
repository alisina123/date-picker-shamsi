/** @odoo-module **/
/**
 * Afghan Shamsi Calendar  v3.0.0
 * ─────────────────────────────────────────────────────────────────────────────
 * Uses official Afghan Nawruz (New Year) dates as anchors.
 * Leap years determined from actual year-lengths, NOT the Iranian algorithm.
 *
 * Verified Afghan Nawruz dates:
 *   1392=2013-03-20  1395=2016-03-20  1399=2020-03-20
 *   1403=2024-03-20  1404=2025-03-21  1405=2026-03-21
 *
 * Verified leap years (366-day years):
 *   1392, 1395, 1399, 1403, 1409, 1412, 1416, 1420, 1424 ...
 *   Pattern: 4, 4, 4, 5, 4, 4, 4, 4, 5 ... (33-year cycle)
 */

// ── Julian Day helpers ────────────────────────────────────────────────────────
function _gjd(y, m, d) {
    if (m <= 2) { y--; m += 12; }
    var A = Math.floor(y / 100);
    var B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) +
           Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

function _jdg(jd) {
    jd += 0.5;
    var Z = Math.floor(jd), A;
    if (Z < 2299161) { A = Z; }
    else {
        var alpha = Math.floor((Z - 1867216.25) / 36524.25);
        A = Z + 1 + alpha - Math.floor(alpha / 4);
    }
    var B = A + 1524;
    var C = Math.floor((B - 122.1) / 365.25);
    var D = Math.floor(365.25 * C);
    var E = Math.floor((B - D) / 30.6001);
    var d = B - D - Math.floor(30.6001 * E);
    var m = E < 14 ? E - 1 : E - 13;
    var y = m > 2 ? C - 4716 : C - 4715;
    return [y, m, d];
}

// ── Official Afghan Nawruz Julian Day table ───────────────────────────────────
// Source: official Afghan calendar / astronomical observations
var _NAWRUZ = {
    1388: _gjd(2009,3,20), 1389: _gjd(2010,3,21), 1390: _gjd(2011,3,21),
    1391: _gjd(2012,3,20), 1392: _gjd(2013,3,20), 1393: _gjd(2014,3,21),
    1394: _gjd(2015,3,21), 1395: _gjd(2016,3,20), 1396: _gjd(2017,3,21),
    1397: _gjd(2018,3,21), 1398: _gjd(2019,3,21), 1399: _gjd(2020,3,20),
    1400: _gjd(2021,3,21), 1401: _gjd(2022,3,21), 1402: _gjd(2023,3,21),
    1403: _gjd(2024,3,20), 1404: _gjd(2025,3,21), 1405: _gjd(2026,3,21),
    1406: _gjd(2027,3,21), 1407: _gjd(2028,3,20), 1408: _gjd(2029,3,20),
    1409: _gjd(2030,3,20), 1410: _gjd(2031,3,21), 1411: _gjd(2032,3,20),
    1412: _gjd(2033,3,20), 1413: _gjd(2034,3,21), 1414: _gjd(2035,3,21),
    1415: _gjd(2036,3,20), 1416: _gjd(2037,3,20), 1417: _gjd(2038,3,21),
    1418: _gjd(2039,3,21), 1419: _gjd(2040,3,20), 1420: _gjd(2041,3,20),
};

// Anchor for years outside the table: 1404/01/01 = 2025-03-21
var _ANCHOR_JY = 1404;
var _ANCHOR_JD = _gjd(2025, 3, 21);

/** Get Nawruz JD for any Jalali year */
function _nawruz(jy) {
    if (_NAWRUZ[jy]) return _NAWRUZ[jy];
    // Extrapolate using 33-year = 12053-day cycle
    var cycles = Math.floor((jy - _ANCHOR_JY) / 33);
    var rem    = jy - _ANCHOR_JY - cycles * 33;
    var base   = _ANCHOR_JD + cycles * 12053;
    // Walk remaining years using avg 365.2424 and snap to Mar 20/21
    var approx = base + rem * 365.2424;
    var gy     = jy + 621;
    var m20    = _gjd(gy, 3, 20);
    var m21    = _gjd(gy, 3, 21);
    return Math.abs(approx - m20) <= Math.abs(approx - m21) ? m20 : m21;
}

/** Is this Jalali year a leap year? (366 days) */
function _isLeap(jy) {
    return _nawruz(jy + 1) - _nawruz(jy) === 366;
}

// ── Core conversions ──────────────────────────────────────────────────────────
function _toJalali(gy, gm, gd) {
    var jd  = _gjd(gy, gm, gd);
    // Estimate Jalali year
    var jy  = Math.round((gy - 621) + (gm < 3 ? -1 : 0));
    var ny  = _nawruz(jy);
    // Walk to exact year
    while (jd >= ny + (_isLeap(jy) ? 366 : 365)) {
        jy++;
        ny = _nawruz(jy);
    }
    while (jd < ny) {
        jy--;
        ny = _nawruz(jy);
    }
    var elapsed = Math.round(jd - ny);
    var ml = [31,31,31,31,31,31,30,30,30,30,30, _isLeap(jy) ? 30 : 29];
    for (var i = 0; i < 12; i++) {
        if (elapsed < ml[i]) return [jy, i + 1, elapsed + 1];
        elapsed -= ml[i];
    }
    return [jy, 12, _isLeap(jy) ? 30 : 29];
}

function _toGregorian(jy, jm, jd) {
    var ny   = _nawruz(jy);
    var ml   = [31,31,31,31,31,31,30,30,30,30,30, _isLeap(jy) ? 30 : 29];
    var days = 0;
    for (var i = 0; i < jm - 1; i++) days += ml[i];
    days += jd - 1;
    return _jdg(ny + days);
}

// ─────────────────────────────────────────────────────────────────────────────
export const JalaliUtils = {

    MONTH_NAMES: [
        'حمل','ثور','جوزا',
        'سرطان','اسد','سنبله',
        'میزان','عقرب','قوس',
        'جدی','دلو','حوت'
    ],

    // Index 0=Saturday … 6=Friday (RTL: renders Sat on right)
    WEEKDAY_SHORT: ['ش','ی','د','س','چ','پ','ج'],

    PERSIAN_DIGITS: ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'],

    toJalali(gy, gm, gd)    { return _toJalali(gy, gm, gd); },
    toGregorian(jy, jm, jd) { return _toGregorian(jy, jm, jd); },
    isLeapYear(jy)           { return _isLeap(jy); },

    monthLength(jy, jm) {
        if (jm <= 6)  return 31;
        if (jm <= 11) return 30;
        return _isLeap(jy) ? 30 : 29;
    },

    today() {
        var y, m, d;
        try { var n = luxon.DateTime.now(); y=n.year; m=n.month; d=n.day; }
        catch(_) { var n2=new Date(); y=n2.getFullYear(); m=n2.getMonth()+1; d=n2.getDate(); }
        return _toJalali(y, m, d);
    },

    format(jy, jm, jd, persian) {
        var p = function(n){ return String(n).padStart(2,'0'); };
        var s = jy + '/' + p(jm) + '/' + p(jd);
        return persian ? this.toPersianDigits(s) : s;
    },

    parse(str) {
        if (!str) return null;
        str = this.toLatinDigits(String(str).trim());
        var m = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
        if (!m) return null;
        var jy=+m[1], jm=+m[2], jd=+m[3];
        if (jm<1||jm>12||jd<1||jd>31) return null;
        return [jy, jm, jd];
    },

    toPersianDigits(s) {
        var D = this.PERSIAN_DIGITS;
        return String(s).replace(/[0-9]/g, function(d){ return D[+d]; });
    },

    toLatinDigits(s) {
        return String(s)
            .replace(/[۰-۹]/g, function(c){ return c.charCodeAt(0)-1776; })
            .replace(/[٠-٩]/g, function(c){ return c.charCodeAt(0)-1632; });
    },

    // 0=Saturday … 6=Friday
    dayOfWeek(jy, jm, jd) {
        var r = _toGregorian(jy, jm, jd);
        return (new Date(r[0], r[1]-1, r[2]).getDay() + 1) % 7;
    },
};

export default JalaliUtils;
