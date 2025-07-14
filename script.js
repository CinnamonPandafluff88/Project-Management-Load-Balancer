const backendURL = "https://project-management-load-balancer.siphosihle-tsotsa.workers.dev";

// Elements
const pmSelect = document.getElementById("pmSelect");
const fySelect = document.getElementById("fySelect");
const canvas = document.getElementById("projectPieChart");
const ctx = canvas.getContext("2d");

let pieChart;

// 1️⃣ Fetch Project Managers
async function fetchPMs() {
  const res = await fetch(`${backendURL}/api/pms?search=`);
  const data = await res.json();
  pmSelect.innerHTML = '<option value="">Select Project Manager</option>';

  data.forEach(pm => {
    const option = document.createElement("option");
    option.value = pm;
    option.textContent = pm;
    pmSelect.appendChild(option);
  });
}

// 2️⃣ Build FY Options (March–Feb)
function buildFYOptions() {
  const currentYear = new Date().getFullYear();
  for (let i = -1; i <= 2; i++) {
    const start = new Date(currentYear + i, 2, 1);  // March 1
    const end = new Date(currentYear + i + 1, 1, 28); // Feb 28
    const label = `FY ${start.getFullYear()}/${end.getFullYear().toString().slice(-2)}`;
    const option = document.createElement("option");
    option.value = JSON.stringify({ start: start.toISOString(), end: end.toISOString() });
    option.textContent = label;
    fySelect.appendChild(option);
  }
}

// 3️⃣ Fetch Projects and Build Chart
async function fetchAndRenderProjects() {
  const selectedPM = pmSelect.value;
  const fyRange = fySelect.value;

  if (!selectedPM || !fyRange) return;

  const { start, end } = JSON.parse(fyRange);
  const res = await fetch(`${backendURL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pmNames: [selectedPM],
      start,
      end,
    }),
  });

  const data = await res.json();

  const projectCounts = {};
  data.forEach(proj => {
    const owner = proj.owner || "Unassigned";
    projectCounts[owner] = (projectCounts[owner] || 0) + 1;
  });

  const labels = Object.keys(projectCounts);
  const values = Object.values(projectCounts);
  const colors = labels.map((_, i) => `hsl(${i * 70}, 70%, 60%)`);

  const chartData = {
    labels,
    datasets: [{
      label: "Project Load",
      data: values,
      backgroundColor: colors,
      borderColor: "#fff",
      borderWidth: 2,
    }],
  };

  if (pieChart) {
    pieChart.data = chartData;
    pieChart.update();
  } else {
    pieChart = new Chart(ctx, {
      type: "pie",
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.raw} project(s)`,
            },
          },
        },
      },
    });
  }
}

// 4️⃣ Event Listeners
pmSelect.addEventListener("change", fetchAndRenderProjects);
fySelect.addEventListener("change", fetchAndRenderProjects);

// 5️⃣ Init
fetchPMs();
buildFYOptions();