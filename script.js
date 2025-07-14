const backendURL = "https://project-management-load-balancer.siphosihle-tsotsa.workers.dev";

// DOM elements
const pmSelect = document.getElementById("pmSelect");
const fySelect = document.getElementById("fySelect");
const barCanvas = document.getElementById("barChart");
const pieCanvas = document.getElementById("pieChart");
const createForm = document.getElementById("createForm");
const pmAuto = document.getElementById("pmAuto");

let barChart, pieChart;

// 🎯 1. Fetch PMs for filters and project creation
async function loadPMs() {
  const res = await fetch(`${backendURL}/api/pms?search=`);
  const pms = await res.json();

  pmSelect.innerHTML = "";
  pmAuto.innerHTML = "<option value=''>Select a PM</option>";

  pms.forEach(pm => {
    const opt1 = document.createElement("option");
    opt1.value = pm;
    opt1.textContent = pm;
    pmSelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = pm;
    opt2.textContent = pm;
    pmAuto.appendChild(opt2);
  });
}

function buildFYDropdown() {
  const now = new Date();
  const baseYear = now.getFullYear();

  fySelect.innerHTML = "";

  for (let i = -1; i <= 2; i++) {
    const fiscalStartYear = baseYear + i;
    const fyLabel = `FY${(fiscalStartYear + 1).toString().slice(-2)}`; // FY26, FY27...

    const start = new Date(fiscalStartYear, 2, 1);      // March 1
    const end = new Date(fiscalStartYear + 1, 1, 28);   // Feb 28 of next year

    const option = document.createElement("option");
    option.value = JSON.stringify({
      start: start.toISOString(),
      end: end.toISOString()
    });
    option.textContent = fyLabel;

    fySelect.appendChild(option);
  }
}

// 📊 3. Fetch and render project data
async function loadProjects(pmNames, dateRange) {
  const res = await fetch(`${backendURL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pmNames, ...dateRange })
  });

  const projects = await res.json();
  const countMap = {};

  projects.forEach(proj => {
    const owner = proj.owner || "Unassigned";
    countMap[owner] = (countMap[owner] || 0) + 1;
  });

  const labels = Object.keys(countMap);
  const data = Object.values(countMap);
  const colors = labels.map((_, i) => `hsl(${i * 60}, 70%, 60%)`);

  const chartData = {
    labels,
    datasets: [{
      label: "Projects",
      data,
      backgroundColor: colors
    }]
  };

  // Render bar chart
  if (barChart) barChart.destroy();
  barChart = new Chart(barCanvas.getContext("2d"), {
    type: "bar",
    data: chartData,
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });

  // Render pie chart
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(pieCanvas.getContext("2d"), {
    type: "pie",
    data: chartData,
    options: { responsive: true }
  });
}

// 🔍 4. Form to load projects
document.getElementById("filterForm").addEventListener("submit", e => {
  e.preventDefault();
  const selectedPMs = Array.from(pmSelect.selectedOptions).map(opt => opt.value);
  const fy = JSON.parse(fySelect.value);
  loadProjects(selectedPMs, fy);
});

// ✅ 5. Form to create a project
createForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("projectName").value;
  const owner = pmAuto.value;

  if (!name || !owner) return alert("Please provide both name and PM.");

  const res = await fetch(`${backendURL}/api/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, owner })
  });

  if (res.ok) {
    alert("✅ Project created successfully!");
    createForm.reset();
  } else {
    alert("❌ Failed to create project.");
  }
});

// 🚀 Init
document.addEventListener("DOMContentLoaded", () => {
  loadPMs();
  buildFYDropdown();
});