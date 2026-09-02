"""Patch the source scheduling workbook into the SimpleRosterAI duty roster template.

Keeps every formula, named range, data validation and conditional format; rewrites
inputs, sample data, shift codes and copy for Indian hospitals on three 8-hour shifts.
Run: python scripts/build-template.py
"""
import os
import re
from datetime import datetime
from pathlib import Path
import openpyxl
from openpyxl.worksheet.datavalidation import DataValidation

SRC = Path(
    os.environ.get(
        "ROSTER_TEMPLATE_SRC",
        "../sibling-site/public/downloads/SimpleScheduleAI-Nurse-Schedule-Template.xlsx",
    )
)
OUT = Path("public/downloads/SimpleRosterAI-Nurse-Duty-Roster-Template.xlsx")
BRAND = "SimpleRosterAI · simplerosterai.com"

if not SRC.exists():
    raise SystemExit(
        f"source workbook not found at {SRC}. Set ROSTER_TEMPLATE_SRC to the sibling "
        "US site's downloads/SimpleScheduleAI-Nurse-Schedule-Template.xlsx."
    )

wb = openpyxl.load_workbook(SRC)

# 1. Branding strings and formula role literals everywhere.
for ws in wb.worksheets:
    for row in ws.iter_rows():
        for c in row:
            v = c.value
            if not isinstance(v, str):
                continue
            if "simplescheduleai" in v.lower() and not v.startswith("="):
                c.value = BRAND
            elif v.startswith("="):
                c.value = v.replace('"RN"', '"SN"').replace('"LPN"', '"NA"').replace('"CNA"', '"NA"')
    for dv in list(ws.data_validations.dataValidation):
        if dv.formula1 and "RN" in dv.formula1 and "LPN" in dv.formula1:
            dv.formula1 = '"SN,NA"'

# 2. Rules.
rules = wb["Rules"]
rules["B2"] = 48
rules["B3"] = 12
rules["B4"] = 6
rules["B5"] = 8
rules["A7"] = "Shift_Basis_Hours = the shift length the requirement math divides by (8 for three 8-hour shifts)."

# 3. Shift codes.
shifts = wb["Shifts"]
codes = [
    ("M8", "Morning 8hr", "Day", 8, 7, 15),
    ("E8", "Evening 8hr", "Day", 8, 15, 23),
    ("N8", "Night 8hr", "Night", 8, 23, 31),
    ("WO", "Weekly Off", "Off", 0, 0, 0),
    ("CL", "Casual Leave", "Off", 0, 0, 0),
    ("SL", "Sick Leave", "Off", 0, 0, 0),
    ("EL", "Earned Leave", "Off", 0, 0, 0),
    ("NH", "National Holiday", "Off", 0, 0, 0),
]
for r in range(2, 15):
    for col in "ABCDEF":
        shifts[f"{col}{r}"] = None
for i, row in enumerate(codes, start=2):
    for col, val in zip("ABCDEF", row):
        shifts[f"{col}{i}"] = val
shifts["A16"] = "Day codes (M8, E8) drive day coverage; N8 drives night coverage; Off codes count as 0 hours."
shifts["A17"] = "End_Abs = Start_Hour + Hours. Over 24 means the shift ends next morning (N8 ends at 31 = 07:00)."
shifts["A18"] = "Rows 10-14 are open for custom codes (e.g. a 12-hour shift). Custom codes count toward hours, rest and consecutive-day checks."

# 4. Staff sample.
staff = wb["Staff"]
for col, h in zip("DEFGHI", ["ICU", "Emergency", "OT", "Dialysis", "NICU", "Paediatrics"]):
    staff[f"{col}1"] = h
names = [
    ("Menon, Anjali", "SN"), ("Nair, Priya", "SN"), ("Sharma, Rekha", "SN"), ("Thomas, Joseph", "SN"), ("Patil, Sunita", "SN"),
    ("Krishnan, Deepa", "SN"), ("Iyer, Meena", "SN"), ("Verma, Ritu", "SN"), ("Pillai, Arun", "SN"), ("Reddy, Kavitha", "SN"),
    ("Joshi, Sneha", "SN"), ("Das, Lakshmi", "SN"), ("Gupta, Neha", "SN"), ("Khan, Farida", "SN"), ("Rao, Vijaya", "SN"),
    ("Kumar, Ramesh", "NA"), ("Yadav, Geeta", "NA"), ("Babu, Suresh", "NA"), ("Singh, Pooja", "NA"), ("Nathan, Divya", "NA"),
]
for r in range(2, 32):
    staff[f"A{r}"] = None
    staff[f"B{r}"] = None
for i, (n, role) in enumerate(names, start=2):
    staff[f"A{i}"] = n
    staff[f"B{i}"] = role
staff["A34"] = "Need more than 30 staff, or a version adapted to your hospital? See simplerosterai.com."

# 5. Units.
units = wb["Units"]
units["A1"] = "Ward"
units["D1"] = "SN_Share_Day"
units["E1"] = "SN_Share_Night"
units["A2"], units["A3"], units["A4"] = "General Ward", "ICU", "HDU"
units["A6"] = "HPPD = nursing hours per patient day. Day_Share = fraction of hours on day shift. SN_Share = fraction that must be a staff nurse."

# 6. Schedule sample codes, week start, leave and holidays.
sched = wb["Schedule"]
sched["A1"] = "Select ward:"
sched["A6"] = "Staff nurses required - Day"
sched["A7"] = "Staff nurses required - Night"
sched["B1"] = "General Ward"
sched["B2"] = datetime(2026, 9, 7)
code_map = {"D12": "M8", "N12": "N8", "D8": "M8", "E8": "E8", "P4D": "M8", "P4N": "N8", "PTO": "CL", "SICK": "SL", "VAC": "EL", "WO": "WO"}
for r in range(12, 42):
    for col in "DEFGHIJ":
        v = sched[f"{col}{r}"].value
        if isinstance(v, str) and v in code_map:
            sched[f"{col}{r}"] = code_map[v]
sched["A43"] = "Assigned SN - Day"
sched["A44"] = "Assigned SN - Night"
sched["A45"] = "Coverage gap - Day (SN, + = short)"
sched["A46"] = "Coverage gap - Night (SN, + = short)"
leave = wb["Leave"]
leave["A2"], leave["B2"], leave["C2"], leave["D2"] = "Menon, Anjali", datetime(2026, 9, 7), datetime(2026, 9, 8), "CL"
leave["A3"], leave["B3"], leave["C3"], leave["D3"] = "Nair, Priya", datetime(2026, 9, 9), datetime(2026, 9, 9), "SL"
leave["A4"], leave["B4"], leave["C4"], leave["D4"] = "Krishnan, Deepa", datetime(2026, 9, 12), datetime(2026, 9, 13), "EL"
hol = wb["Holidays"]
hol["A2"], hol["B2"] = datetime(2026, 10, 2), "Gandhi Jayanti"
census = wb["Census"]
census["A1"] = "Ward \\ Date"
census["A6"] = "Enter the projected patient census per ward for each day of the week."

# 7. Instructions and Beyond tabs.
ins = wb["Instructions"]
ins["B8"] = "Nurse Duty Roster Template"
ins["B9"] = "A free weekly duty roster worksheet for one hospital ward on three 8-hour shifts. Built by SimpleRosterAI."
ins["B12"] = "You enter your staff, your ward's staffing rules, and each day's patient census. The template calculates how many nurses each shift needs, gives you a clean weekly grid to assign shifts, and then flags overtime and coverage gaps for you automatically."
ins["B15"] = "    •  Staff:  Your roster: name, role (SN = staff nurse, NA = nursing assistant), FTE, and area skills."
ins["B17"] = "    •  Rules:  Your weekly hours cap (48), minimum rest between duties (12), max consecutive duty days (6), and shift length (8)."
ins["B16"] = "    •  Units:  Each ward's HPPD (nursing hours per patient day), day/night split, and the share of staff that must be SN."
ins["B18"] = "    •  Census:  The patient census for each ward, for each of the 7 days."
ins["B19"] = "    •  Holidays / Leave:  National holidays, and any approved CL / SL / EL for the week."
ins["B22"] = "    •  Required staff per day & night:  Calculated from census x HPPD x SN ratio, so you know the target before you assign."
ins["B23"] = "    •  A weekly duty grid:  Pick M8, E8, N8, WO or a leave code per nurse per day from the dropdown."
ins["B24"] = "    •  Weekly hours + 48h flag:  Each nurse's total hours, flagged OVER when they cross the weekly cap."
ins["B25"] = "    •  Coverage gap check:  Assigned nurses vs required nurses each day and night. A positive gap (red) means you are short."
ins["B28"] = "    1.  Fill the Staff, Units and Rules tabs with your own values (sample data is provided so you can see the shape; the tab is named Units, its column A header reads Ward)."
ins["B29"] = "    2.  On the Schedule tab, pick your ward and set the Week start date (a Monday)."
ins["B33"] = "Notes: names on the Leave tab must match the Staff tab exactly. The roster holds up to 30 staff. Consecutive-day and rest checks look at the displayed week only."
ins["B36"] = "It will not build the roster for you, balance night rotation and weekend fairness across weeks, or find a qualified replacement when a nurse is absent. That is what SimpleRosterAI does."
ins["B38"] = "Not medical, legal or compliance advice. Verify all figures against your own hospital policy and applicable law."
ins["B39"] = BRAND
beyond = wb["Beyond this template"]
beyond["B3"] = "A spreadsheet can hold the inputs and do the maths. It cannot make the judgement calls below. That is where rostering software takes over."
beyond["B5"] = "•  Skill requirement per shift and per nurse (ICU, Emergency, OT, Dialysis cover guaranteed every shift)."
beyond["B6"] = "•  Night rotation, weekend and holiday fairness tracked across weeks, not just the current one."
beyond["B7"] = "•  Preventing rest-hour, weekly-off and consecutive-day breaks while the roster is built, and remembering them across weeks."
beyond["B8"] = "•  Finding a qualified, under-48-hour replacement in minutes when a nurse is absent."
beyond["B9"] = "•  Float pool levels (home ward only vs cross-trained) and hard blocks for critical-care areas."
beyond["B10"] = "•  Leave, holidays and census flowing in from HRMS instead of manual entry."
beyond["B12"] = "SimpleRosterAI does these automatically, then hands the finished roster to your nursing office to approve. See how it works at simplerosterai.com."

OUT.parent.mkdir(parents=True, exist_ok=True)
wb.save(OUT)

# 8. Verify: no old brand or role literals remain in any cell.
# D12/N12/PTO are checked only outside formulas: those tokens also occur as cell
# references (e.g. "D12:J12") inside untouched formulas that legitimately survive.
chk = openpyxl.load_workbook(OUT)
bad = []
always_bad = ("SimpleScheduleAI", "simplescheduleai", '"RN"', "LPN", "CNA")
data_only_bad = ("PTO", "D12", "N12")
for ws in chk.worksheets:
    for row in ws.iter_rows():
        for c in row:
            v = c.value
            if not isinstance(v, str):
                continue
            is_formula = v.startswith("=")
            terms = always_bad if is_formula else always_bad + data_only_bad
            if any(t in v for t in terms):
                bad.append((ws.title, c.coordinate, v[:60]))
if bad:
    raise SystemExit(f"leftover source strings: {bad}")

# 9. Verify: no stray "RN"/"unit" wording remains in plain copy. The Units
# sheet is never renamed (formulas reference it by name), so cells that
# name the tab itself are allowlisted.
role_or_unit_re = re.compile(r"\bRNs?\b|\bunits?\b", re.I)
tab_name_allowlist = {
    ("Instructions", "B15"),
    ("Instructions", "B16"),
    ("Instructions", "B28"),
}
role_or_unit_bad = []
for ws in chk.worksheets:
    for row in ws.iter_rows():
        for c in row:
            v = c.value
            if not isinstance(v, str) or v.startswith("="):
                continue
            if (ws.title, c.coordinate) in tab_name_allowlist:
                continue
            if role_or_unit_re.search(v):
                role_or_unit_bad.append((ws.title, c.coordinate, v[:60]))
if role_or_unit_bad:
    raise SystemExit(f"leftover RN/unit wording: {role_or_unit_bad}")

print(f"wrote {OUT} ({OUT.stat().st_size} bytes), {len(chk.worksheets)} sheets, validations preserved: "
      f"{sum(len(ws.data_validations.dataValidation) for ws in chk.worksheets)}")
