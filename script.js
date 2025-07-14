let currentWorkloads = {}; // Store PM: workload mapping
let selectedPM = "";        // Auto-selected PM
// FY dropdown (same as before)
const fySelect = document.getElementById('fySelect');
const thisYear = new Date().getFullYear();
for (let i = thisYear; i <= thisYear + 4; i++) {
 const label = `FY ${i % 100}/${(i + 1) % 100}`;
 const start = `${i}-03-01`;
 const end = `${i + 1}-02-28`;
 const option = new Option(label, `${start},${end}`);
 fySelect.appendChild(option);
}
const pmSelect = document.getElementById('pmSelect');
const pmSearch = document.getElementById('pmSearch');

// Fetch PMs and populate dropdown
async function fetchPMs(search = "") {
    const res = await fetch(`/api/pms?search=${encodeURIComponent(search)}`);
    const pms = await res.json();
    pmSelect.innerHTML = "";
    pms.forEach(pm => {
        const option = new Option(pm, pm);
        pmSelect.appendChild(option);
    });
}

// Initial load
fetchPMs();

// Search handler
pmSearch.addEventListener("input", (e) => {
    fetchPMs(e.target.value);
});
// Load Projects & Analyze
document.getElementById("filterForm").addEventListener("submit", async (e) => {
 e.preventDefault();
 const pmNames = Array.from(pmSelect.selectedOptions).map(o => o.value);
 const [start, end] = fySelect.value.split(',');
 const res = await fetch("/api/projects", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({ pmNames, start, end })
 });
 const projects = await res.json();
 analyzeWorkload(projects);
 renderCharts();
 suggestLowestWorkloadPM();
});
// Analyze workload
function analyzeWorkload(projects) {
 currentWorkloads = {};
 projects.forEach(p => {
   const weeks = (new Date(p.EndDate) - new Date(p.StartDate)) / (1000 * 60 * 60 * 24 * 7);
   const owner = p.OwnerName?.trim();
   currentWorkloads[owner] = (currentWorkloads[owner] || 0) + weeks;
 });
}
// Suggest lowest workload PM
function suggestLowestWorkloadPM() {
 let min = Infinity;
 selectedPM = "";
 for (const [pm, workload] of Object.entries(currentWorkloads)) {
   if (workload < min) {
     min = workload;
     selectedPM = pm;
   }
 }
 document.getElementById("pmAuto").value = selectedPM || "No PM found";
}
// Create project
document.getElementById("createForm").addEventListener("submit", async (e) => {
 e.preventDefault();
 const name = document.getElementById("projectName").value;
 const res = await fetch("/api/create", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({ name, owner: selectedPM })
 });
 const result = await res.json();
 alert(`✅ "${result.name}" assigned to ${result.owner}`);
});
// Render workload charts
function renderCharts() {
 const labels = Object.keys(currentWorkloads);
 const data = Object.values(currentWorkloads);
 new Chart(document.getElementById("barChart"), {
   type: "bar",
   data: {
     labels,
     datasets: [{
       label: "Workload (weeks)",
       data,
       backgroundColor: "#9370DB"
     }]
   }
 });
 new Chart(document.getElementById("pieChart"), {
   type: "pie",
   data: {
     labels,
     datasets: [{
       data,
       backgroundColor: ['#ff5c8d', '#3abefc', '#ffc658', '#82ca9d']
     }]
   }
 });
}