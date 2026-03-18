# Persian (Jalali) Date Picker — Odoo 18

A complete Afghan Shamsi (Jalali) calendar widget for Odoo 18.  

---

## ✅ Features

- 🗓️ Afghan Dari month names: حمل، ثور، جوزا، سرطان، اسد، سنبله، میزان، عقرب، قوس، جدی، دلو، حوت

---

## 📦 Installation

1. Copy the `persian_date_picker` folder into your Odoo **addons** directory
2. Restart the Odoo server
3. Go to **Apps** → click **Update Apps List**
4. Search for **Persian Date Picker** → click **Install**

```bash
# After copying the folder, restart Odoo and upgrade the module
./odoo-bin -d YOUR_DB_NAME -u persian_date_picker --stop-after-init
```

---

## 🚀 Usage



Add `widget="persian_date"` or `widget="persian_datetime"` to any field in your view XML:

```xml
<!-- Date field -->
<field name="hire_date" widget="persian_date"/>

<!-- Datetime field -->
<field name="date_order" widget="persian_datetime"/>
```

---

## 🗂️ Module Structure

```
persian_date_picker/
├── __manifest__.py                        ← Module definition
├── __init__.py
├── hooks.py                               ← Auto-clears asset cache on install
├── views/
│   ├── assets.xml                         ← Injects lang flag into HTML head
│   └── usage_example.xml                  ← Commented view examples
└── static/src/
    ├── js/
    │   └── jalali.js                      ← conversion library
    ├── css/
    │   └── persian_datepicker.css         ← RTL calendar styles
    ├── components/
    │   └── persian_date_picker.js         ← OWL field components + popup
    └── xml/
        └── persian_date_picker.xml        ← QWeb templates
```

---

## 🔧 How It Works

| Layer | Behavior |
|---|---|
| **Server (Python)** | `views/assets.xml` injects `window.ODOO_LANG_IS_JALALI = true/false` into the HTML head before JS loads |
| **JS detection** | `persian_date_picker.js` reads `window.ODOO_LANG_IS_JALALI` at bundle load time |
| **Auto mode** | When `true`, overrides the `date` and `datetime` entries in Odoo's field registry |
| **Display** | Gregorian value from DB is converted to Jalali before showing in the input |
| **Selection** | User picks a Jalali date → converted back to Gregorian → saved via `record.update()` |
| **Storage** | Always stored as standard ISO Gregorian — no database changes required |

---

## 📅 Jalali Conversion Library (`jalali.js`)

The `JalaliUtils` object provides:

| Method | Description |
|---|---|
| `toJalali(gy, gm, gd)` | Convert Gregorian → `[jy, jm, jd]` |
| `toGregorian(jy, jm, jd)` | Convert Jalali → `[gy, gm, gd]` |
| `isLeapYear(jy)` | Is Jalali year a leap year? |
| `monthLength(jy, jm)` | Days in month (29 / 30 / 31) |
| `format(jy, jm, jd)` | Format as `YYYY/MM/DD` |
| `parse(str)` | Parse `YYYY/MM/DD` → `[jy, jm, jd]` |
| `dayOfWeek(jy, jm, jd)` | 0 = Saturday … 6 = Friday |
| `today()` | Today as `[jy, jm, jd]` |



---

## 🗓️ Afghan Leap Years

This module uses the **official Afghan Nawruz lookup table** — NOT the Iranian algorithm.
Afghan and Iranian leap years differ:

| Year | Iran | Afghanistan |
|---|---|---|
| 1403 | 365 days (not leap) | **366 days (leap) ✓** |
| حوت 1403 | 29 days | **30 days ✓** |

Leap years near the current period: **1392, 1395, 1399, 1403, 1409, 1412, 1416 ...**

---

## 🎨 UI Features

| Feature | Detail |
|---|---|
| Month dropdown | All 12 Dari month names |
| Year dropdown | 1300–1500, auto-scrolls to current year |
| Navigation | `‹` / `›` buttons to move month by month |
| Today button | امروز — jumps to today and selects it |
| Clear button | پاک کردن — clears the field value |
| RTL layout | Saturday on the right, Friday in red on the left |
| Today highlight | Blue ring around today's date |
| Selected highlight | Blue filled circle on selected date |
| Time picker | Shown for `datetime` fields (hours : minutes : seconds) |

---

## ♻️ Applying Updates

After upgrading the module, always clear the asset cache:


---

## ⚙️ Compatibility

- Odoo **18.0**
- Works with `fields.Date` and `fields.Datetime`
- No Python model changes required
- No database schema changes
- Compatible with form views, list views, and search/filter panels

---

## 📝 Example: Extend an Existing View

```xml
<!-- Inherit sale.order form to use Jalali dates -->
<record id="sale_order_form_jalali" model="ir.ui.view">
    <field name="name">sale.order.form.jalali</field>
    <field name="model">sale.order</field>
    <field name="inherit_id" ref="sale.view_order_form"/>
    <field name="arch" type="xml">
        <field name="date_order" position="attributes">
            <attribute name="widget">persian_datetime</attribute>
        </field>
        <field name="validity_date" position="attributes">
            <attribute name="widget">persian_date</attribute>
        </field>
    </field>
</record>
```

---
# date-picker-shamsi
