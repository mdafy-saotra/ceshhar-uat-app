import { useState } from "react";
import * as XLSX from "xlsx";

const COLORS = {
  primary: "#1e3a5f",
  secondary: "#2b6cb0",
  accent: "#38a169",
  warning: "#e53e3e",
  orange: "#dd6b20",
  light: "#f7fafc",
  border: "#e2e8f0",
  muted: "#718096",
};

const badge = (val, map) => {
  const cfg = map[val] || { bg: "#e2e8f0", color: "#4a5568" };
  return (
    <span style={{ background: cfg.bg, color: cfg.color, padding: "2px 10px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
      {val}
    </span>
  );
};

const statusMap = {
  PASS:         { bg: "#c6f6d5", color: "#22543d" },
  FAIL:         { bg: "#fed7d7", color: "#822727" },
  BLOCKED:      { bg: "#feebc8", color: "#7b341e" },
  "Not Tested": { bg: "#e2e8f0", color: "#4a5568" },
};
const sevMap = {
  Critical: { bg: "#fed7d7", color: "#822727" },
  High:     { bg: "#feebc8", color: "#7b341e" },
  Medium:   { bg: "#fefcbf", color: "#744210" },
  Low:      { bg: "#e9d8fd", color: "#44337a" },
};
const priMap = {
  P1: { bg: "#fed7d7", color: "#822727" },
  P2: { bg: "#feebc8", color: "#7b341e" },
  P3: { bg: "#fefcbf", color: "#744210" },
  P4: { bg: "#e9d8fd", color: "#44337a" },
};

// ─── DATA ────────────────────────────────────────────────────────────────────

const QA_MODULES = [
  { version: "V0", module: "Hotspot Identification", form: "Identify Hotspot", role: "Microplanner", priority: "P1" },
  { version: "V0", module: "Registration", form: "Program Participant Registration", role: "OW / MP", priority: "P1" },
  { version: "V0", module: "Registration", form: "Hotspot Listing / Hotspot Diary", role: "MP", priority: "P1" },
  { version: "V0", module: "Clinical", form: "Demographic", role: "Nurse", priority: "P1" },
  { version: "V0", module: "Clinical", form: "Daily Log", role: "Nurse", priority: "P1" },
  { version: "V0", module: "Clinical", form: "STI Recording", role: "Nurse", priority: "P1" },
  { version: "V0", module: "Clinical", form: "Clinic Visit", role: "Nurse", priority: "P1" },
  { version: "V0", module: "Clinical", form: "PrEP Form", role: "Nurse", priority: "P1" },
  { version: "V0", module: "Clinical", form: "Sisters_Clinic_Referral_Slip", role: "Nurse", priority: "P2" },
  { version: "V0", module: "Clinical", form: "Sisters_Returned_Referral_Slip", role: "Nurse", priority: "P2" },
  { version: "V0", module: "Screening", form: "IPC", role: "MP / OW", priority: "P1" },
  { version: "V0", module: "Screening", form: "GBV Routine Inquiry", role: "OW", priority: "P1" },
  { version: "V0", module: "Screening", form: "Outreach Checklist", role: "OW", priority: "P2" },
  { version: "V0", module: "Screening", form: "Condom & Lubricant Distribution", role: "OW", priority: "P2" },
  { version: "V0", module: "Screening", form: "HIV Self-Test Distribution", role: "OW", priority: "P2" },
  { version: "V0", module: "Screening", form: "COVID-19 Screening Form", role: "OW", priority: "P3" },
  { version: "V0", module: "Hotspot Profiling", form: "KP Microplanning Spot Profiling", role: "MP", priority: "P1" },
  { version: "V1", module: "MP Supervision", form: "KP Internal & External Mobility", role: "OW", priority: "P2" },
  { version: "V1", module: "Tracking", form: "Tracking", role: "MP", priority: "P1" },
  { version: "V1", module: "Tracking", form: "Risk Assessment", role: "MP", priority: "P1" },
  { version: "V1", module: "Tracking", form: "Quarterly Assessment", role: "MP", priority: "P1" },
  { version: "V1", module: "Tracking", form: "Microplanning One-on-One", role: "MP", priority: "P2" },
  { version: "V1", module: "Group Activities", form: "Summary Community Mobilisation", role: "OW/MP", priority: "P2" },
  { version: "V1", module: "Group Activities", form: "Adherence Sister's Follow-up", role: "OW", priority: "P2" },
  { version: "V1", module: "Group Activities", form: "SHG Register", role: "OW", priority: "P2" },
  { version: "V1", module: "Group Activities", form: "SHG Member Register", role: "OW", priority: "P2" },
  { version: "V1", module: "Group Activities", form: "SHG Maturity Index", role: "OW", priority: "P3" },
  { version: "V1", module: "Group Activities", form: "HER Form 1 & 2", role: "Nurse", priority: "P2" },
  { version: "V1", module: "Mental Health", form: "Mental Health Screening", role: "FBB", priority: "P1" },
];

const UAT_SCENARIOS = [
  {
    id: "UAT-MP-01", role: "Microplanner", priority: "P1",
    title: "Hotspot Identification – Create New Hotspot",
    objective: "MP can successfully identify and register a new hotspot with all required details.",
    steps: [
      { n: 1, action: "Open MP Hotspot Registration module", expected: "Module opens without error" },
      { n: 2, action: "Tap 'Identify Hotspot' form", expected: "Form opens on first question" },
      { n: 3, action: "Enter hotspot name: 'Test Hotspot Alpha'", expected: "Name field accepts text" },
      { n: 4, action: "Enter today's date and current time", expected: "Date/time captured correctly" },
      { n: 5, action: "Select hotspot location type: 'Bar'", expected: "Selection saves correctly" },
      { n: 6, action: "Enter FSW volumes: 18–24=5, 25–35=8, 35+=3", expected: "Fields accept numeric input" },
      { n: 7, action: "Verify total FSW volume auto-calculates = 16", expected: "Calculated field shows 16" },
      { n: 8, action: "Enter all KP volumes across all age bands (6 groups × 3 ages)", expected: "All 18 volume fields captured" },
      { n: 9, action: "Enter operating times Monday–Sunday", expected: "All 7 days captured" },
      { n: 10, action: "Answer community needs questions", expected: "Conditional fields appear/hide correctly" },
      { n: 11, action: "Select a CeSHHAR clinic from the list", expected: "Clinic name saved to case" },
      { n: 12, action: "Answer structural issues (security, stigma, violence)", expected: "All 3 fields captured" },
      { n: 13, action: "Confirm submission on summary screen", expected: "Form submits successfully" },
      { n: 14, action: "Verify location fields auto-populated", expected: "Province, District, Facility, Area, Cluster all populated" },
      { n: 15, action: "Sync device", expected: "Data appears in CommCare HQ web" },
    ],
  },
  {
    id: "UAT-MP-02", role: "Microplanner", priority: "P2",
    title: "Hotspot – Social Media Conditional Logic",
    objective: "Verify conditional logic for social media hotspot type.",
    steps: [
      { n: 1, action: "Start 'Identify Hotspot' form", expected: "Form opens" },
      { n: 2, action: "Select location type: 'Social Media'", expected: "Social media platform field appears" },
      { n: 3, action: "Select platform (e.g. WhatsApp)", expected: "Selection captured" },
      { n: 4, action: "Verify physical address field is hidden", expected: "Physical address not shown" },
      { n: 5, action: "Complete and submit form", expected: "Case created successfully" },
    ],
  },
  {
    id: "UAT-MP-03", role: "Microplanner", priority: "P1",
    title: "Risk Assessment on Program Participant",
    objective: "MP can conduct a risk assessment and participant is categorised correctly.",
    steps: [
      { n: 1, action: "Open existing participant case from Hotspot Diary", expected: "Case details load" },
      { n: 2, action: "Select 'Risk Assessment' form", expected: "Form opens with participant details pre-loaded" },
      { n: 3, action: "Complete all risk questions", expected: "All fields accept input" },
      { n: 4, action: "Submit form", expected: "Case updates with risk category (Low/Medium/High/Unknown)" },
      { n: 5, action: "Verify tracking frequency matches risk level (High = weekly)", expected: "Schedule is correct" },
      { n: 6, action: "Verify Quarterly Assessment is scheduled", expected: "Next quarterly date visible" },
    ],
  },
  {
    id: "UAT-MP-04", role: "Microplanner", priority: "P1",
    title: "Offline Data Capture & Sync",
    objective: "MP can submit forms without network connectivity and sync successfully.",
    steps: [
      { n: 1, action: "Turn off WiFi and mobile data", expected: "No connectivity" },
      { n: 2, action: "Open CommCare and navigate to Hotspot module", expected: "App opens from cache" },
      { n: 3, action: "Complete and submit 'Identify Hotspot' form", expected: "Form saved to outbox" },
      { n: 4, action: "Re-enable connectivity and sync", expected: "Form submits; case appears in HQ" },
      { n: 5, action: "Verify no data loss or duplication", expected: "Single submission in HQ" },
    ],
  },
  {
    id: "UAT-OW-01", role: "Outreach Worker", priority: "P1",
    title: "Register New Program Participant",
    objective: "OW can register a new KP as a program participant including deduplication check.",
    steps: [
      { n: 1, action: "Open Program Participant Registration module", expected: "Module opens" },
      { n: 2, action: "Start new registration form", expected: "Form opens on first question" },
      { n: 3, action: "Enter participant details (name, KP type, age, contact)", expected: "All fields accept input" },
      { n: 4, action: "Select KP population type (FSW/MSW/Transgender/PWUD/PWID/HRM)", expected: "Selection saved to case" },
      { n: 5, action: "Submit form", expected: "New case created; appears in OW case list" },
      { n: 6, action: "Search for participant by name", expected: "Participant found in list" },
      { n: 7, action: "Attempt to register same participant again (deduplication test)", expected: "System flags potential duplicate" },
    ],
  },
  {
    id: "UAT-OW-02", role: "Outreach Worker", priority: "P1",
    title: "GBV Routine Inquiry Screening",
    objective: "OW can conduct GBV screening; data restricted from MP view.",
    steps: [
      { n: 1, action: "Select existing participant from case list", expected: "Case opens" },
      { n: 2, action: "Open 'GBV Routine Inquiry' form", expected: "Form opens" },
      { n: 3, action: "Answer all GBV screening questions", expected: "All questions display; logic correct" },
      { n: 4, action: "Record positive GBV finding", expected: "Appropriate follow-up question appears" },
      { n: 5, action: "Submit form", expected: "Case updated with GBV screening result" },
      { n: 6, action: "Log in as MP; verify GBV data not visible", expected: "GBV data hidden from MP" },
    ],
  },
  {
    id: "UAT-OW-03", role: "Outreach Worker", priority: "P2",
    title: "Handover Participant to Nurse",
    objective: "Participant registered by OW appears in Nurse case list.",
    steps: [
      { n: 1, action: "OW registers new participant and submits", expected: "Case created" },
      { n: 2, action: "Log in as Nurse on separate device", expected: "Nurse session opens" },
      { n: 3, action: "Verify new participant appears in Nurse's case list", expected: "Case visible to Nurse" },
      { n: 4, action: "Confirm participant KP details pre-loaded", expected: "No re-entry required" },
    ],
  },
  {
    id: "UAT-N-01", role: "Nurse", priority: "P1",
    title: "Continue Registration – Demographics",
    objective: "Nurse can complete demographic information without re-entering OW data.",
    steps: [
      { n: 1, action: "Open participant from Nurse case list", expected: "Case opens with OW-entered data visible" },
      { n: 2, action: "Open 'Demographic' form", expected: "Form opens; previously entered data pre-filled" },
      { n: 3, action: "Enter remaining demographic fields", expected: "Fields accept input" },
      { n: 4, action: "Submit form", expected: "Demographic data saved to case" },
      { n: 5, action: "Re-open case and verify data persists", expected: "No re-entry required on next visit" },
    ],
  },
  {
    id: "UAT-N-02", role: "Nurse", priority: "P1",
    title: "STI Recording",
    objective: "Nurse can record STI test results with full history.",
    steps: [
      { n: 1, action: "Open participant case", expected: "Case loads" },
      { n: 2, action: "Open 'STI Recording' form", expected: "Form opens with participant details" },
      { n: 3, action: "Record symptoms presented", expected: "Fields captured" },
      { n: 4, action: "Record test results (positive/negative per STI)", expected: "Conditional follow-up fields appear" },
      { n: 5, action: "Record treatment prescribed", expected: "Treatment field saves" },
      { n: 6, action: "Submit form", expected: "Case updated with STI visit record" },
      { n: 7, action: "Verify STI history in chronological order", expected: "Previous records shown" },
    ],
  },
  {
    id: "UAT-N-03", role: "Nurse", priority: "P1",
    title: "PrEP Visit – Initiation",
    objective: "Nurse can record PrEP initiation; participant visible in PrEP report.",
    steps: [
      { n: 1, action: "Open 'PrEP' form on participant case", expected: "Form opens" },
      { n: 2, action: "Select visit type: 'Initiation'", expected: "Initiation-specific fields appear" },
      { n: 3, action: "Record eligibility criteria and PrEP number", expected: "PrEP number saved to case" },
      { n: 4, action: "Set next appointment date", expected: "Follow-up scheduled" },
      { n: 5, action: "Submit form", expected: "Participant shows as Active PrEP" },
      { n: 6, action: "Check PrEP Uptake report in CommCare HQ", expected: "Participant appears with correct status" },
    ],
  },
  {
    id: "UAT-N-04", role: "Nurse", priority: "P2",
    title: "Create & Follow Up Referral",
    objective: "Nurse can create internal/external referral and record outcome.",
    steps: [
      { n: 1, action: "Open 'Sisters_Clinic_Referral_Slip' form", expected: "Form opens" },
      { n: 2, action: "Select referral destination (Internal / External)", expected: "Appropriate fields appear" },
      { n: 3, action: "Enter reason for referral and submit", expected: "Referral case created" },
      { n: 4, action: "Open 'Sisters_Returned_Referral_Slip'", expected: "Form opens" },
      { n: 5, action: "Record referral outcome", expected: "Outcome saved to referral case" },
      { n: 6, action: "Verify referral linked to participant case history", expected: "Referral visible in participant history" },
    ],
  },
  {
    id: "UAT-FBB-01", role: "FBB", priority: "P1",
    title: "Mental Health Screening",
    objective: "FBB can conduct mental health screening; cannot access clinical forms.",
    steps: [
      { n: 1, action: "Log in as FBB user", expected: "Only FBB-permitted modules visible" },
      { n: 2, action: "Verify FBB cannot see Nurse clinical forms", expected: "Nurse forms not accessible" },
      { n: 3, action: "Open participant and start mental health screening", expected: "Form opens" },
      { n: 4, action: "Complete all screening questions", expected: "Fields accept input; logic correct" },
      { n: 5, action: "Submit screening", expected: "Case updated with mental health result" },
      { n: 6, action: "Log in as OW; verify screening result accessible", expected: "Result visible to OW" },
    ],
  },
  {
    id: "UAT-WEB-01", role: "SIE / Web", priority: "P2",
    title: "PrEP Uptake Status Report",
    objective: "SIE user can filter PrEP report by District, Facility, Quarter, Age Group, Gender.",
    steps: [
      { n: 1, action: "Log in to CommCare HQ as SIE user", expected: "Dashboard accessible" },
      { n: 2, action: "Navigate to PrEP Uptake Status report", expected: "Report loads" },
      { n: 3, action: "Filter by District, Facility, Quarter", expected: "Results filter correctly" },
      { n: 4, action: "Filter by Age Group and Gender", expected: "Disaggregated results shown" },
      { n: 5, action: "Verify visit type per participant (initiation/refill/reinitiation)", expected: "All visit types visible" },
      { n: 6, action: "Verify follow-up status (Active/Discontinued)", expected: "Statuses match submitted forms" },
    ],
  },
  {
    id: "UAT-WEB-02", role: "SIE / Web", priority: "P2",
    title: "VL Monitoring Report",
    objective: "VL monitoring due-date logic is correct.",
    steps: [
      { n: 1, action: "Navigate to VL Monitoring report", expected: "Report loads" },
      { n: 2, action: "Verify 'Due for VL': participant on ART 6 months = due", expected: "Correct flag shown" },
      { n: 3, action: "Verify high VL result triggers 3-month re-test due", expected: "3-month date correct" },
      { n: 4, action: "Check last VL result and next VL date fields", expected: "Both fields populated" },
      { n: 5, action: "Filter by Facility and Month", expected: "Correct results returned" },
    ],
  },
];

const INITIAL_ISSUES = [
  { id: "UAT-001", date: "", tester: "", scenario: "", description: "", severity: "High", status: "Open", assignedTo: "", resolution: "" },
];

const ROLE_COLORS = {
  Microplanner:    { bg: "#ebf8ff", color: "#2b6cb0" },
  "Outreach Worker": { bg: "#f0fff4", color: "#276749" },
  Nurse:           { bg: "#fff5f5", color: "#c53030" },
  FBB:             { bg: "#faf5ff", color: "#6b46c1" },
  "SIE / Web":     { bg: "#fffaf0", color: "#c05621" },
};

// ─── EXCEL HELPERS ───────────────────────────────────────────────────────────

function xlsxHeaderStyle() {
  return {
    fill: { fgColor: { rgb: "1E3A5F" } },
    font: { color: { rgb: "FFFFFF" }, bold: true, sz: 11 },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
  };
}

function applyStyles(ws, rows) {
  const range = XLSX.utils.decode_range(ws["!ref"]);
  // Header row
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[addr]) ws[addr].s = xlsxHeaderStyle();
  }
  // Auto column widths
  const keys = Object.keys(rows[0] || {});
  ws["!cols"] = keys.map((k) => ({
    wch: Math.min(55, Math.max(k.length + 2, ...rows.map((r) => String(r[k] ?? "").length + 2))),
  }));
}

const RESULT_FILL = {
  PASS:         "C6F6D5",
  FAIL:         "FED7D7",
  BLOCKED:      "FEEBC8",
  "Not Tested": "E2E8F0",
};

function exportQAPlan() {
  const rows = QA_MODULES.map((m) => ({
    Version: m.version,
    Module: m.module,
    "Form / Feature": m.form,
    "User Role": m.role,
    Priority: m.priority,
  }));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  applyStyles(ws, rows);
  XLSX.utils.book_append_sheet(wb, ws, "QA Plan");
  XLSX.writeFile(wb, "CeSHHAR_QA_Plan.xlsx");
}

function exportUATResults(scenarios, results, notes) {
  const rows = [];
  scenarios.forEach((s) =>
    s.steps.forEach((st) => {
      const key = `${s.id}-${st.n}`;
      rows.push({
        "Scenario ID": s.id,
        Role: s.role,
        Priority: s.priority || "",
        Title: s.title,
        "Step #": st.n,
        Action: st.action,
        "Expected Result": st.expected,
        Result: results[key] || "Not Tested",
        Notes: notes[key] || "",
      });
    })
  );
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  applyStyles(ws, rows);
  // Colour-code the Result column (index 7)
  rows.forEach((r, i) => {
    const addr = XLSX.utils.encode_cell({ r: i + 1, c: 7 });
    if (ws[addr])
      ws[addr].s = {
        fill: { fgColor: { rgb: RESULT_FILL[r["Result"]] || "FFFFFF" } },
        font: { bold: r["Result"] !== "Not Tested" },
        alignment: { horizontal: "center" },
      };
  });
  XLSX.utils.book_append_sheet(wb, ws, "UAT Results");
  XLSX.writeFile(wb, "CeSHHAR_UAT_Results.xlsx");
}

function exportIssues(issues) {
  if (!issues.length) return;
  const rows = issues.map((i) => ({
    "Issue ID": i.id,
    Date: i.date,
    Tester: i.tester,
    Scenario: i.scenario,
    Description: i.description,
    Severity: i.severity,
    Status: i.status,
    "Assigned To": i.assignedTo,
    Resolution: i.resolution,
  }));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  applyStyles(ws, rows);
  XLSX.utils.book_append_sheet(wb, ws, "Defect Log");
  XLSX.writeFile(wb, "CeSHHAR_Defect_Log.xlsx");
}

function exportFullWorkbook(results, notes, issues) {
  const wb = XLSX.utils.book_new();

  // Sheet 1 – QA Plan
  const qaRows = QA_MODULES.map((m) => ({
    Version: m.version, Module: m.module,
    "Form / Feature": m.form, "User Role": m.role, Priority: m.priority,
  }));
  const ws1 = XLSX.utils.json_to_sheet(qaRows);
  applyStyles(ws1, qaRows);
  XLSX.utils.book_append_sheet(wb, ws1, "QA Plan");

  // Sheet 2 – UAT Results
  const uatRows = [];
  UAT_SCENARIOS.forEach((s) =>
    s.steps.forEach((st) => {
      const key = `${s.id}-${st.n}`;
      uatRows.push({
        "Scenario ID": s.id, Role: s.role, Priority: s.priority || "",
        Title: s.title, "Step #": st.n, Action: st.action,
        "Expected Result": st.expected,
        Result: results[key] || "Not Tested",
        Notes: notes[key] || "",
      });
    })
  );
  const ws2 = XLSX.utils.json_to_sheet(uatRows);
  applyStyles(ws2, uatRows);
  uatRows.forEach((r, i) => {
    const addr = XLSX.utils.encode_cell({ r: i + 1, c: 7 });
    if (ws2[addr])
      ws2[addr].s = {
        fill: { fgColor: { rgb: RESULT_FILL[r["Result"]] || "FFFFFF" } },
        font: { bold: r["Result"] !== "Not Tested" },
        alignment: { horizontal: "center" },
      };
  });
  XLSX.utils.book_append_sheet(wb, ws2, "UAT Results");

  // Sheet 3 – Defect Log
  const issueRows = issues.map((i) => ({
    "Issue ID": i.id, Date: i.date, Tester: i.tester,
    Scenario: i.scenario, Description: i.description,
    Severity: i.severity, Status: i.status,
    "Assigned To": i.assignedTo, Resolution: i.resolution,
  }));
  const ws3 = XLSX.utils.json_to_sheet(issueRows);
  applyStyles(ws3, issueRows);
  XLSX.utils.book_append_sheet(wb, ws3, "Defect Log");

  XLSX.writeFile(wb, "CeSHHAR_Full_Workbook.xlsx");
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function Tab({ label, active, onClick, count }) {
  return (
    <button onClick={onClick} style={{
      padding: "10px 20px", border: "none",
      borderBottom: active ? `3px solid ${COLORS.secondary}` : "3px solid transparent",
      background: "none", cursor: "pointer", fontWeight: active ? 700 : 500,
      color: active ? COLORS.secondary : COLORS.muted, fontSize: 13,
      display: "flex", alignItems: "center", gap: 6,
    }}>
      {label}
      {count !== undefined && (
        <span style={{
          background: active ? COLORS.secondary : "#e2e8f0",
          color: active ? "white" : COLORS.muted,
          borderRadius: 10, padding: "1px 7px", fontSize: 11,
        }}>{count}</span>
      )}
    </button>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: "white", borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: 20, ...style }}>
      {children}
    </div>
  );
}

function KpiCard({ label, value, sub, color }) {
  return (
    <div style={{ background: "white", borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: 20, borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: 11, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: COLORS.primary, margin: "6px 0 2px" }}>{value}</div>
      <div style={{ fontSize: 12, color: COLORS.muted }}>{sub}</div>
    </div>
  );
}

/**
 * FilterBadge – coloured pill that lights up when active.
 * Shows an optional count bubble on the right.
 */
function FilterBadge({ label, active, bg, color, onClick, count }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "4px 12px", borderRadius: 16, cursor: "pointer",
        border: `2px solid ${active ? bg : COLORS.border}`,
        background: active ? bg : "white",
        color: active ? color : COLORS.muted,
        fontWeight: 700, fontSize: 12,
        boxShadow: active ? `0 0 0 3px ${bg}66` : "none",
        transition: "all 0.15s",
      }}
    >
      {label}
      {count !== undefined && (
        <span style={{
          background: active ? `${color}33` : "#e2e8f0",
          color: active ? color : "#718096",
          borderRadius: 8, padding: "0 5px", fontSize: 10, fontWeight: 800,
        }}>{count}</span>
      )}
    </button>
  );
}

function ExportBtn({ label, onClick, variant = "green" }) {
  return (
    <button onClick={onClick} style={{
      background: variant === "blue" ? COLORS.secondary : "#22543d",
      color: "white", border: "none", padding: "7px 16px",
      borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12,
      display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
    }}>
      ⬇ {label}
    </button>
  );
}

// ─── PAGES ───────────────────────────────────────────────────────────────────

function Overview({ results, issues, onExportAll }) {
  const total = UAT_SCENARIOS.reduce((a, s) => a + s.steps.length, 0);
  const passed = Object.values(results).filter((v) => v === "PASS").length;
  const failed = Object.values(results).filter((v) => v === "FAIL").length;
  const openIssues = issues.filter((i) => i.status === "Open").length;
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;

  const byRole = {};
  UAT_SCENARIOS.forEach((s) => {
    if (!byRole[s.role]) byRole[s.role] = { total: s.steps.length, pass: 0, fail: 0 };
    else byRole[s.role].total += s.steps.length;
    s.steps.forEach((st) => {
      const v = results[`${s.id}-${st.n}`];
      if (v === "PASS") byRole[s.role].pass++;
      if (v === "FAIL") byRole[s.role].fail++;
    });
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <ExportBtn label="Export Full Workbook (.xlsx)" onClick={onExportAll} variant="blue" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <KpiCard label="Total Test Steps" value={total} sub="Across all UAT scenarios" color={COLORS.secondary} />
        <KpiCard label="Passed" value={passed} sub={`${pct}% completion`} color={COLORS.accent} />
        <KpiCard label="Failed" value={failed} sub="Require investigation" color={COLORS.warning} />
        <KpiCard label="Open Issues" value={openIssues} sub="In issue log" color={COLORS.orange} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 14 }}>Progress by Role</div>
          {Object.entries(byRole).map(([role, d]) => {
            const p = d.total > 0 ? Math.round((d.pass / d.total) * 100) : 0;
            const fp = d.total > 0 ? Math.round((d.fail / d.total) * 100) : 0;
            const rc = ROLE_COLORS[role] || { bg: "#e2e8f0", color: "#4a5568" };
            return (
              <div key={role} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ background: rc.bg, color: rc.color, padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{role}</span>
                  <span style={{ fontSize: 12, color: COLORS.muted }}>
                    <span style={{ color: "#22543d", fontWeight: 700 }}>{d.pass}✓</span>
                    {d.fail > 0 && <span style={{ color: "#c53030", fontWeight: 700 }}> {d.fail}✗</span>}
                    <span> / {d.total}</span>
                  </span>
                </div>
                <div style={{ background: "#edf2f7", borderRadius: 4, height: 8, overflow: "hidden", display: "flex" }}>
                  <div style={{ width: `${p}%`, height: "100%", background: COLORS.accent, transition: "width 0.5s" }} />
                  <div style={{ width: `${fp}%`, height: "100%", background: COLORS.warning }} />
                </div>
              </div>
            );
          })}
        </Card>

        <Card>
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 14 }}>QA Scope Coverage</div>
          {["V0", "V1"].map((v) => {
            const mods = QA_MODULES.filter((m) => m.version === v);
            return (
              <div key={v} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: COLORS.primary, marginBottom: 6 }}>
                  {v === "V0" ? "Version 0 — Oct 2025" : "Version 1 — Nov 2025"}
                </div>
                {mods.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12 }}>
                    <span>{m.form}</span>
                    <span style={{ display: "flex", gap: 6 }}>
                      {badge(m.priority, priMap)}
                      <span style={{ color: COLORS.muted, fontSize: 11 }}>{m.role}</span>
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </Card>
      </div>

      <Card>
        <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Sign-Off Checklist</div>
        {[
          "All MP scenarios tested", "All OW scenarios tested", "All Nurse scenarios tested",
          "FBB scenario tested", "Web/reporting scenarios tested",
          "Role-based access verified", "Offline sync tested", "All Critical/High issues resolved",
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13 }}>
            <span style={{ fontSize: 16 }}>☐</span> {item}
          </div>
        ))}
      </Card>
    </div>
  );
}

function QAPlanPage() {
  const [filterRole, setFilterRole] = useState("All");
  const [filterPri,  setFilterPri]  = useState("All");
  const [filterVer,  setFilterVer]  = useState("All");

  const roles = ["All", "Microplanner", "Outreach Worker", "Nurse", "FBB", "SIE / Web"];
  const pris  = ["All", "P1", "P2", "P3"];
  const vers  = ["All", "V0", "V1"];

  // Counts for each filter pill
  const roleCounts = Object.fromEntries(roles.map((r) => [r,
    r === "All" ? QA_MODULES.length
    : QA_MODULES.filter((m) => m.role.includes(r === "Outreach Worker" ? "OW" : r === "Microplanner" ? "MP" : r)).length,
  ]));
  const priCounts = Object.fromEntries(pris.map((p) => [p,
    p === "All" ? QA_MODULES.length : QA_MODULES.filter((m) => m.priority === p).length,
  ]));
  const verCounts = Object.fromEntries(vers.map((v) => [v,
    v === "All" ? QA_MODULES.length : QA_MODULES.filter((m) => m.version === v).length,
  ]));

  const filtered = QA_MODULES.filter((m) => {
    const roleOk = filterRole === "All" || m.role.includes(filterRole === "Outreach Worker" ? "OW" : filterRole === "Microplanner" ? "MP" : filterRole);
    const priOk  = filterPri  === "All" || m.priority === filterPri;
    const verOk  = filterVer  === "All" || m.version  === filterVer;
    return roleOk && priOk && verOk;
  });

  const clearAll = () => { setFilterRole("All"); setFilterPri("All"); setFilterVer("All"); };
  const anyActive = filterRole !== "All" || filterPri !== "All" || filterVer !== "All";

  return (
    <div>
      {/* Summary strip */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>QA Plan — CeSHHAR Zimbabwe Case Management System</div>
        <div style={{ fontSize: 12, color: COLORS.muted }}>CommCare HQ: ceshhar-zim-dev | Advanced Plan | Aug 2025 – Jul 2026 | Language: English</div>
        <div style={{ display: "flex", gap: 24, marginTop: 16, flexWrap: "wrap" }}>
          {[
            { l: "Total Forms in Scope", v: QA_MODULES.length },
            { l: "Version 0 Forms",      v: QA_MODULES.filter((m) => m.version === "V0").length },
            { l: "Version 1 Forms",      v: QA_MODULES.filter((m) => m.version === "V1").length },
            { l: "P1 Critical",          v: QA_MODULES.filter((m) => m.priority === "P1").length },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", background: COLORS.light, padding: "10px 20px", borderRadius: 8 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.primary }}>{s.v}</div>
              <div style={{ fontSize: 11, color: COLORS.muted }}>{s.l}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filter bar */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            {/* Priority */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase" }}>Priority:</span>
              {pris.map((p) => (
                <FilterBadge key={p} label={p} active={filterPri === p}
                  bg={priMap[p]?.bg || "#e2e8f0"} color={priMap[p]?.color || "#4a5568"}
                  count={priCounts[p]} onClick={() => setFilterPri(p)} />
              ))}
            </div>
            {/* Version */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase" }}>Version:</span>
              {vers.map((v) => (
                <FilterBadge key={v} label={v} active={filterVer === v}
                  bg={v === "V0" ? "#bee3f8" : "#c6f6d5"} color={v === "V0" ? "#2b6cb0" : "#276749"}
                  count={verCounts[v]} onClick={() => setFilterVer(v)} />
              ))}
            </div>
            {/* Role */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase" }}>Role:</span>
              {roles.map((r) => {
                const rc = ROLE_COLORS[r] || { bg: "#e2e8f0", color: "#4a5568" };
                return (
                  <FilterBadge key={r} label={r} active={filterRole === r}
                    bg={rc.bg} color={rc.color} count={roleCounts[r]}
                    onClick={() => setFilterRole(r)} />
                );
              })}
            </div>
          </div>
          <ExportBtn label="Export QA Plan (.xlsx)" onClick={exportQAPlan} />
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: COLORS.muted, display: "flex", alignItems: "center", gap: 8 }}>
          Showing <strong>{filtered.length}</strong> of {QA_MODULES.length} forms
          {anyActive && (
            <button onClick={clearAll} style={{ fontSize: 11, color: COLORS.secondary, background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>
              ✕ Clear filters
            </button>
          )}
        </div>
      </Card>

      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: COLORS.light }}>
              {["Version", "Module", "Form / Feature", "User Role", "Priority"].map((h) => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", borderBottom: `2px solid ${COLORS.border}`, color: COLORS.muted, fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}`, background: i % 2 === 0 ? "white" : "#fafafa" }}>
                <td style={{ padding: "9px 12px" }}>
                  <span style={{ background: m.version === "V0" ? "#ebf8ff" : "#f0fff4", color: m.version === "V0" ? "#2b6cb0" : "#276749", padding: "2px 8px", borderRadius: 6, fontWeight: 700, fontSize: 11 }}>{m.version}</span>
                </td>
                <td style={{ padding: "9px 12px", color: COLORS.muted }}>{m.module}</td>
                <td style={{ padding: "9px 12px", fontWeight: 500 }}>{m.form}</td>
                <td style={{ padding: "9px 12px", color: COLORS.muted }}>{m.role}</td>
                <td style={{ padding: "9px 12px" }}>{badge(m.priority, priMap)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Severity matrix + test types (unchanged) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Defect Severity Matrix</div>
          {[
            { sev: "P1 – Critical", def: "App crash, data loss, case not created",             sla: "1 business day" },
            { sev: "P2 – High",     def: "Skip logic failure, wrong case update, role violation", sla: "3 business days" },
            { sev: "P3 – Medium",   def: "Non-critical validation missing, UI display issue",   sla: "5 business days" },
            { sev: "P4 – Low",      def: "Cosmetic, label typo, minor UX",                      sla: "Next sprint" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{r.sev}</div>
                <div style={{ color: COLORS.muted }}>{r.def}</div>
              </div>
              <div style={{ color: COLORS.secondary, fontWeight: 600, whiteSpace: "nowrap", marginLeft: 12 }}>{r.sla}</div>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Key Test Types</div>
          {[
            { type: "Functional",     desc: "Form fields, skip logic, validations, case updates" },
            { type: "Role Access",    desc: "Each user sees only permitted modules and cases" },
            { type: "Offline / Sync", desc: "Submit offline, sync online, verify integrity" },
            { type: "Case Management",desc: "Cases open, update, transfer, close correctly" },
            { type: "KP Volume",      desc: "Age-disaggregated volume totals calculate correctly" },
            { type: "Performance",    desc: ">3,000 records on device (known critical risk)" },
            { type: "Regression",     desc: "Re-test after each version release" },
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12 }}>
              <span style={{ background: "#ebf8ff", color: "#2b6cb0", padding: "2px 8px", borderRadius: 6, fontWeight: 700, whiteSpace: "nowrap", fontSize: 11 }}>{t.type}</span>
              <span style={{ color: COLORS.muted }}>{t.desc}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function UATPage({ results, setResults, notes, setNotes }) {
  const [filterRole,   setFilterRole]   = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPri,    setFilterPri]    = useState("All");
  const [expanded,     setExpanded]     = useState(null);

  const roles    = ["All", "Microplanner", "Outreach Worker", "Nurse", "FBB", "SIE / Web"];
  const statuses = ["All", "PASS", "FAIL", "BLOCKED", "Not Tested"];
  const pris     = ["All", "P1", "P2", "P3"];

  // Step-level counts for the status badges
  const allStepResults = UAT_SCENARIOS.flatMap((s) =>
    s.steps.map((st) => results[`${s.id}-${st.n}`] || "Not Tested")
  );
  const statusCounts = Object.fromEntries(
    statuses.map((s) => [s, s === "All" ? allStepResults.length : allStepResults.filter((r) => r === s).length])
  );
  // Scenario-level counts for role / priority badges
  const roleCounts = Object.fromEntries(roles.map((r) => [r,
    r === "All" ? UAT_SCENARIOS.length : UAT_SCENARIOS.filter((s) => s.role === r).length,
  ]));
  const priCounts = Object.fromEntries(pris.map((p) => [p,
    p === "All" ? UAT_SCENARIOS.length : UAT_SCENARIOS.filter((s) => (s.priority || "") === p).length,
  ]));

  const filtered = UAT_SCENARIOS.filter((s) => {
    const roleOk = filterRole   === "All" || s.role === filterRole;
    const priOk  = filterPri    === "All" || (s.priority || "") === filterPri;
    if (filterStatus === "All") return roleOk && priOk;
    return roleOk && priOk && s.steps.some((st) => (results[`${s.id}-${st.n}`] || "Not Tested") === filterStatus);
  });

  const setStep = (scenId, stepN, val) => setResults((r) => ({ ...r, [`${scenId}-${stepN}`]: val }));
  const setNote = (key, val) => setNotes((n) => ({ ...n, [key]: val }));
  const clearAll = () => { setFilterRole("All"); setFilterStatus("All"); setFilterPri("All"); };
  const anyActive = filterRole !== "All" || filterStatus !== "All" || filterPri !== "All";

  return (
    <div>
      {/* Filter bar */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            {/* Result filter */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase" }}>Result:</span>
              {statuses.map((s) => (
                <FilterBadge key={s} label={s} active={filterStatus === s}
                  bg={statusMap[s]?.bg || "#e2e8f0"} color={statusMap[s]?.color || "#4a5568"}
                  count={statusCounts[s]} onClick={() => setFilterStatus(s)} />
              ))}
            </div>
            {/* Priority filter */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase" }}>Priority:</span>
              {pris.map((p) => (
                <FilterBadge key={p} label={p} active={filterPri === p}
                  bg={priMap[p]?.bg || "#e2e8f0"} color={priMap[p]?.color || "#4a5568"}
                  count={priCounts[p]} onClick={() => setFilterPri(p)} />
              ))}
            </div>
            {/* Role filter */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase" }}>Role:</span>
              {roles.map((r) => {
                const rc = ROLE_COLORS[r] || { bg: "#e2e8f0", color: "#4a5568" };
                return (
                  <FilterBadge key={r} label={r} active={filterRole === r}
                    bg={rc.bg} color={rc.color} count={roleCounts[r]}
                    onClick={() => setFilterRole(r)} />
                );
              })}
            </div>
          </div>
          <ExportBtn label="Export UAT Results (.xlsx)" onClick={() => exportUATResults(filtered, results, notes)} />
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: COLORS.muted, display: "flex", alignItems: "center", gap: 8 }}>
          Showing <strong>{filtered.length}</strong> of {UAT_SCENARIOS.length} scenarios
          {anyActive && (
            <button onClick={clearAll} style={{ fontSize: 11, color: COLORS.secondary, background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>
              ✕ Clear filters
            </button>
          )}
        </div>
      </Card>

      {filtered.map((s) => {
        const rc = ROLE_COLORS[s.role] || { bg: "#e2e8f0", color: "#4a5568" };
        const stepResults = s.steps.map((st) => results[`${s.id}-${st.n}`] || "Not Tested");
        const passed  = stepResults.filter((v) => v === "PASS").length;
        const failed  = stepResults.filter((v) => v === "FAIL").length;
        const blocked = stepResults.filter((v) => v === "BLOCKED").length;
        const isOpen  = expanded === s.id;
        const allPass = passed === s.steps.length;
        const hasFail = failed > 0;

        return (
          <Card key={s.id} style={{ marginBottom: 12, borderLeft: `4px solid ${allPass ? COLORS.accent : hasFail ? COLORS.warning : COLORS.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
              onClick={() => setExpanded(isOpen ? null : s.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 800, color: COLORS.secondary, fontSize: 13 }}>{s.id}</span>
                <span style={{ background: rc.bg, color: rc.color, padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{s.role}</span>
                {s.priority && badge(s.priority, priMap)}
                <span style={{ fontWeight: 600, fontSize: 13 }}>{s.title}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {passed  > 0 && <span style={{ background: "#c6f6d5", color: "#22543d", padding: "2px 8px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>✓ {passed}</span>}
                {failed  > 0 && <span style={{ background: "#fed7d7", color: "#822727", padding: "2px 8px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>✗ {failed}</span>}
                {blocked > 0 && <span style={{ background: "#feebc8", color: "#7b341e", padding: "2px 8px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>⊘ {blocked}</span>}
                <span style={{ fontSize: 12, color: COLORS.muted }}>{s.steps.length} steps</span>
                <span style={{ color: COLORS.muted, fontSize: 18 }}>{isOpen ? "▲" : "▼"}</span>
              </div>
            </div>

            {isOpen && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 14, padding: "8px 12px", background: COLORS.light, borderRadius: 8 }}>
                  <strong>Objective:</strong> {s.objective}
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: COLORS.light }}>
                      {["#", "Action", "Expected Result", "Result", "Actual / Notes"].map((h) => (
                        <th key={h} style={{ padding: "8px 10px", textAlign: "left", borderBottom: `2px solid ${COLORS.border}`, color: COLORS.muted, fontWeight: 700, fontSize: 11 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.steps.map((st) => {
                      const key = `${s.id}-${st.n}`;
                      const val = results[key] || "Not Tested";
                      const rowBg = val === "PASS" ? "#f0fff4" : val === "FAIL" ? "#fff5f5" : val === "BLOCKED" ? "#fffaf0" : "white";
                      return (
                        <tr key={st.n} style={{ borderBottom: `1px solid ${COLORS.border}`, background: rowBg }}>
                          <td style={{ padding: "8px 10px", color: COLORS.muted, fontWeight: 700 }}>{st.n}</td>
                          <td style={{ padding: "8px 10px" }}>{st.action}</td>
                          <td style={{ padding: "8px 10px", color: COLORS.muted }}>{st.expected}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <select value={val} onChange={(e) => setStep(s.id, st.n, e.target.value)} style={{
                              padding: "4px 8px", borderRadius: 6, border: `1px solid ${COLORS.border}`,
                              fontFamily: "inherit", fontSize: 11, fontWeight: 700,
                              background: statusMap[val]?.bg || "#e2e8f0",
                              color:      statusMap[val]?.color || "#4a5568",
                            }}>
                              {["Not Tested", "PASS", "FAIL", "BLOCKED"].map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            <input
                              value={notes[key] || ""}
                              onChange={(e) => setNote(key, e.target.value)}
                              placeholder="Notes..."
                              style={{ width: "100%", padding: "4px 8px", border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: 11, fontFamily: "inherit" }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div style={{ marginTop: 12, display: "flex", gap: 16, fontSize: 12, color: COLORS.muted }}>
                  <span>Usability Rating (1–5): <input type="number" min={1} max={5} style={{ width: 50, padding: "2px 6px", border: `1px solid ${COLORS.border}`, borderRadius: 4, fontSize: 12 }} /></span>
                  <span>Tester Name: <input placeholder="Name..." style={{ padding: "2px 8px", border: `1px solid ${COLORS.border}`, borderRadius: 4, fontSize: 12, fontFamily: "inherit" }} /></span>
                  <span>Date: <input type="date" style={{ padding: "2px 6px", border: `1px solid ${COLORS.border}`, borderRadius: 4, fontSize: 12 }} /></span>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function IssueLogPage({ issues, setIssues }) {
  const [filterSev,    setFilterSev]    = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const sevOptions    = ["All", "Critical", "High", "Medium", "Low"];
  const statusOptions = ["All", "Open", "In Progress", "Resolved", "Closed"];

  const issueStatusColors = {
    Open:         { bg: "#fed7d7", color: "#822727" },
    "In Progress":{ bg: "#feebc8", color: "#7b341e" },
    Resolved:     { bg: "#c6f6d5", color: "#22543d" },
    Closed:       { bg: "#e2e8f0", color: "#4a5568" },
  };

  const sevCounts = Object.fromEntries(sevOptions.map((s) => [s,
    s === "All" ? issues.length : issues.filter((i) => i.severity === s).length,
  ]));
  const stCounts = Object.fromEntries(statusOptions.map((s) => [s,
    s === "All" ? issues.length : issues.filter((i) => i.status === s).length,
  ]));

  const filtered = issues.filter((i) => {
    const sevOk = filterSev    === "All" || i.severity === filterSev;
    const stOk  = filterStatus === "All" || i.status   === filterStatus;
    return sevOk && stOk;
  });

  const add = () => setIssues((prev) => [...prev, {
    id: `UAT-${String(prev.length + 1).padStart(3, "0")}`,
    date: "", tester: "", scenario: "", description: "",
    severity: "Medium", status: "Open", assignedTo: "", resolution: "",
  }]);
  const upd = (i, k, v) => setIssues((prev) => prev.map((row, idx) => idx === i ? { ...row, [k]: v } : row));
  const del = (i) => setIssues((prev) => prev.filter((_, idx) => idx !== i));

  const inp = (val, i, k, type = "text") => (
    <input type={type} value={val} onChange={(e) => upd(i, k, e.target.value)}
      style={{ width: "100%", padding: "4px 6px", border: `1px solid ${COLORS.border}`, borderRadius: 4, fontSize: 11, fontFamily: "inherit" }} />
  );
  const sel = (val, i, k, opts) => (
    <select value={val} onChange={(e) => upd(i, k, e.target.value)}
      style={{ width: "100%", padding: "4px 6px", border: `1px solid ${COLORS.border}`, borderRadius: 4, fontSize: 11, fontFamily: "inherit" }}>
      {opts.map((o) => <option key={o}>{o}</option>)}
    </select>
  );

  return (
    <div>
      {/* Filter bar */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase" }}>Severity:</span>
              {sevOptions.map((s) => (
                <FilterBadge key={s} label={s} active={filterSev === s}
                  bg={sevMap[s]?.bg || "#e2e8f0"} color={sevMap[s]?.color || "#4a5568"}
                  count={sevCounts[s]} onClick={() => setFilterSev(s)} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase" }}>Status:</span>
              {statusOptions.map((s) => (
                <FilterBadge key={s} label={s} active={filterStatus === s}
                  bg={issueStatusColors[s]?.bg || "#e2e8f0"} color={issueStatusColors[s]?.color || "#4a5568"}
                  count={stCounts[s]} onClick={() => setFilterStatus(s)} />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <ExportBtn label="Export Defect Log (.xlsx)" onClick={() => exportIssues(issues)} />
            <button onClick={add} style={{ background: COLORS.secondary, color: "white", border: "none", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
              + Add Issue
            </button>
          </div>
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: COLORS.muted }}>
          Showing <strong>{filtered.length}</strong> of {issues.length} issues &nbsp;|&nbsp;
          <span style={{ color: "#822727", fontWeight: 700 }}>Open: {issues.filter((i) => i.status === "Open").length}</span> &nbsp;|&nbsp;
          <span style={{ color: "#22543d", fontWeight: 700 }}>Resolved: {issues.filter((i) => i.status === "Resolved").length}</span>
          {(filterSev !== "All" || filterStatus !== "All") && (
            <button onClick={() => { setFilterSev("All"); setFilterStatus("All"); }}
              style={{ marginLeft: 8, fontSize: 11, color: COLORS.secondary, background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>
              ✕ Clear filters
            </button>
          )}
        </div>
      </Card>

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: COLORS.light }}>
                {["ID", "Date", "Tester", "Scenario", "Description", "Severity", "Status", "Assigned To", "Resolution", ""].map((h) => (
                  <th key={h} style={{ padding: "9px 8px", textAlign: "left", borderBottom: `2px solid ${COLORS.border}`, color: COLORS.muted, fontWeight: 700, fontSize: 10, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, fi) => {
                // map back to real index for mutations
                const i = issues.indexOf(row);
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: "7px 8px", fontWeight: 700, color: COLORS.secondary }}>{row.id}</td>
                    <td style={{ padding: "7px 8px", minWidth: 100 }}>{inp(row.date,        i, "date",        "date")}</td>
                    <td style={{ padding: "7px 8px", minWidth: 100 }}>{inp(row.tester,      i, "tester")}</td>
                    <td style={{ padding: "7px 8px", minWidth: 110 }}>{inp(row.scenario,    i, "scenario")}</td>
                    <td style={{ padding: "7px 8px", minWidth: 180 }}>{inp(row.description, i, "description")}</td>
                    <td style={{ padding: "7px 8px", minWidth: 90  }}>{sel(row.severity,    i, "severity",  ["Critical","High","Medium","Low"])}</td>
                    <td style={{ padding: "7px 8px", minWidth: 90  }}>{sel(row.status,      i, "status",    ["Open","In Progress","Resolved","Closed"])}</td>
                    <td style={{ padding: "7px 8px", minWidth: 110 }}>{inp(row.assignedTo,  i, "assignedTo")}</td>
                    <td style={{ padding: "7px 8px", minWidth: 160 }}>{inp(row.resolution,  i, "resolution")}</td>
                    <td style={{ padding: "7px 8px" }}>
                      <button onClick={() => del(i)} style={{ background: "#fed7d7", color: "#822727", border: "none", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontWeight: 700, fontSize: 11 }}>✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function SignOffPage() {
  const testers = [
    { role: "Microplanner",          org: "CeSHHAR Zimbabwe" },
    { role: "Microplanner",          org: "CeSHHAR Zimbabwe" },
    { role: "Outreach Worker",       org: "CeSHHAR Zimbabwe" },
    { role: "Outreach Worker",       org: "CeSHHAR Zimbabwe" },
    { role: "Nurse",                  org: "CeSHHAR Zimbabwe" },
    { role: "Nurse",                  org: "CeSHHAR Zimbabwe" },
    { role: "Friendship Bench Buddy", org: "FBB / CeSHHAR" },
    { role: "SIE Officer (Web)",      org: "CeSHHAR Zimbabwe" },
  ];
  const approvers = [
    { name: "Jeffrey Dirawo", role: "Data Lead",       org: "CeSHHAR Zimbabwe" },
    { name: "",               role: "SIE Officer",     org: "CeSHHAR Zimbabwe" },
    { name: "",               role: "Program Manager", org: "CeSHHAR Zimbabwe" },
    { name: "",               role: "QA Lead",         org: "Dimagi" },
  ];
  const [decision, setDecision] = useState("");

  return (
    <div>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>UAT Tester Register</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: COLORS.light }}>
              {["Tester ID", "Name", "Role", "Organisation", "Site / Facility", "Device", "Date"].map((h) => (
                <th key={h} style={{ padding: "8px 10px", textAlign: "left", borderBottom: `2px solid ${COLORS.border}`, color: COLORS.muted, fontWeight: 700, fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {testers.map((t, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: "8px 10px", fontWeight: 700, color: COLORS.secondary }}>T-{String(i + 1).padStart(2, "0")}</td>
                <td style={{ padding: "8px 10px" }}><input style={{ width: "100%", border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "3px 6px", fontSize: 11 }} /></td>
                <td style={{ padding: "8px 10px" }}>
                  <span style={{ background: (ROLE_COLORS[t.role] || ROLE_COLORS["SIE / Web"])?.bg, color: (ROLE_COLORS[t.role] || ROLE_COLORS["SIE / Web"])?.color, padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{t.role}</span>
                </td>
                <td style={{ padding: "8px 10px", color: COLORS.muted }}>{t.org}</td>
                <td style={{ padding: "8px 10px" }}><input style={{ width: "100%", border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "3px 6px", fontSize: 11 }} /></td>
                <td style={{ padding: "8px 10px" }}><input style={{ width: "100%", border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "3px 6px", fontSize: 11 }} /></td>
                <td style={{ padding: "8px 10px" }}><input type="date" style={{ border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "3px 6px", fontSize: 11 }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Final Go-Live Decision</div>
        {[
          { val: "approved",    label: "✅ APPROVED FOR GO-LIVE",  desc: "All critical scenarios passed, no open critical/high issues", color: COLORS.accent },
          { val: "conditional", label: "⚠️ CONDITIONAL APPROVAL",  desc: "Minor issues open; go-live approved with agreed resolution plan", color: COLORS.orange },
          { val: "rejected",    label: "❌ NOT APPROVED",           desc: "Critical issues remain; re-test required after fixes", color: COLORS.warning },
        ].map((opt) => (
          <div key={opt.val} onClick={() => setDecision(opt.val)} style={{
            display: "flex", alignItems: "center", gap: 14, padding: 14, borderRadius: 10, marginBottom: 10, cursor: "pointer",
            border: `2px solid ${decision === opt.val ? opt.color : COLORS.border}`,
            background: decision === opt.val ? `${opt.color}18` : "white",
          }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${opt.color}`, background: decision === opt.val ? opt.color : "white", flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: opt.color, fontSize: 13 }}>{opt.label}</div>
              <div style={{ fontSize: 12, color: COLORS.muted }}>{opt.desc}</div>
            </div>
          </div>
        ))}
      </Card>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Approver Sign-Off</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: COLORS.light }}>
              {["Name", "Role", "Organisation", "Signature", "Date"].map((h) => (
                <th key={h} style={{ padding: "8px 10px", textAlign: "left", borderBottom: `2px solid ${COLORS.border}`, color: COLORS.muted, fontWeight: 700, fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {approvers.map((a, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <td style={{ padding: "10px" }}>{a.name || <input style={{ border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "3px 6px", fontSize: 11, width: "100%" }} />}</td>
                <td style={{ padding: "10px", color: COLORS.muted }}>{a.role}</td>
                <td style={{ padding: "10px", color: COLORS.muted }}>{a.org}</td>
                <td style={{ padding: "10px" }}><div style={{ borderBottom: `1px solid ${COLORS.muted}`, width: 160, height: 28 }} /></td>
                <td style={{ padding: "10px" }}><input type="date" style={{ border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "3px 6px", fontSize: 11 }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [tab,     setTab]     = useState("overview");
  const [results, setResults] = useState({});
  const [notes,   setNotes]   = useState({});
  const [issues,  setIssues]  = useState(INITIAL_ISSUES);

  const tabs = [
    { id: "overview", label: "UAT Summary" },
    { id: "qa",       label: "Test Cases",    count: QA_MODULES.length },
    { id: "uat",      label: "UAT Scenarios", count: UAT_SCENARIOS.length },
    { id: "issues",   label: "Defect Log",    count: issues.length },
    { id: "signoff",  label: "Sign-off Tracker" },
  ];

  const totalSteps = UAT_SCENARIOS.reduce((a, s) => a + s.steps.length, 0);
  const passed  = Object.values(results).filter((v) => v === "PASS").length;
  const failed  = Object.values(results).filter((v) => v === "FAIL").length;
  const blocked = Object.values(results).filter((v) => v === "BLOCKED").length;
  const remaining = totalSteps - passed - failed - blocked;
  const pct = totalSteps > 0 ? Math.round((passed / totalSteps) * 100) : 0;
  const critical = QA_MODULES.filter((m) => m.priority === "P1").length;
  const high     = QA_MODULES.filter((m) => m.priority === "P2").length;
  const medium   = QA_MODULES.filter((m) => m.priority === "P3").length;

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", minHeight: "100vh", background: COLORS.light }}>
      {/* ── Header ── */}
      <div style={{ background: COLORS.primary, color: "white", padding: "0 32px" }}>
        <div style={{ paddingTop: 20, paddingBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>Dimagi / CeSHHAR Zimbabwe</div>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>QA Plan & UAT Workbook</h1>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Case Management System — CommCare HQ: ceshhar-zim-dev</div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {[{ l: "Version", v: "1.0" }, { l: "Date", v: "March 2026" }, { l: "Language", v: "English" }, { l: "Plan", v: "Advanced" }].map((t, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.1)", padding: "6px 14px", borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{t.l}</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{t.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 8 }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "12px 20px", border: "none", background: "none",
              color: tab === t.id ? "white" : "rgba(255,255,255,0.55)",
              cursor: "pointer", fontWeight: tab === t.id ? 700 : 400, fontSize: 13,
              borderBottom: tab === t.id ? "3px solid #63b3ed" : "3px solid transparent",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {t.label}
              {t.count !== undefined && (
                <span style={{ background: tab === t.id ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)", borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Progress strip */}
        <div style={{ background: "rgba(0,0,0,0.25)", padding: "10px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>Progress:</span>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.15)", borderRadius: 6, height: 10, overflow: "hidden", display: "flex" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#48bb78" : "#63b3ed", borderRadius: 6, transition: "width 0.5s" }} />
              {failed > 0 && <div style={{ width: `${Math.round((failed / totalSteps) * 100)}%`, height: "100%", background: "#fc8181" }} />}
            </div>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 700, whiteSpace: "nowrap" }}>{pct}%</span>
            <span style={{ fontSize: 12, color: "#68d391", whiteSpace: "nowrap" }}>✓ {passed} pass</span>
            <span style={{ fontSize: 12, color: "#fc8181", whiteSpace: "nowrap" }}>✗ {failed} fail</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>{remaining} remaining</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: `Critical: ${critical}`, bg: "#fed7d7", color: "#822727" },
              { label: `High: ${high}`,         bg: "#feebc8", color: "#7b341e" },
              { label: `Medium: ${medium}`,     bg: "#fefcbf", color: "#744210" },
              { label: `Pending: ${remaining}`, bg: "#e2e8f0", color: "#4a5568" },
              { label: `Pass: ${passed}`,       bg: "#c6f6d5", color: "#22543d" },
              { label: `Fail: ${failed}`,       bg: "#fed7d7", color: "#822727" },
              { label: `Blocked: ${blocked}`,   bg: "#e9d8fd", color: "#44337a" },
            ].map((b, i) => (
              <span key={i} style={{ background: b.bg, color: b.color, padding: "2px 12px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>{b.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Page content ── */}
      <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
        {tab === "overview" && <Overview results={results} issues={issues} onExportAll={() => exportFullWorkbook(results, notes, issues)} />}
        {tab === "qa"       && <QAPlanPage />}
        {tab === "uat"      && <UATPage results={results} setResults={setResults} notes={notes} setNotes={setNotes} />}
        {tab === "issues"   && <IssueLogPage issues={issues} setIssues={setIssues} />}
        {tab === "signoff"  && <SignOffPage />}
      </div>
    </div>
  );
}