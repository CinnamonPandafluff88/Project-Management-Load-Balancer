document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "https://project-management-load-balancer.siphosihle-tsotsa.workers.dev";

  let currentWorkloads = {};
  let selectedPM = "";

  const fySelect = document.getElementById('fySelect');
  const thisYear = new Date().getFullYear();
  for (let i = thisYear; i <= thisYear + 4; i++) {
    const label = `FY ${(i + 1) % 100}`;
    const start = `${i}-03-01`;
    const end = `${i + 1}-02-28`;
    const option = new Option(label, `${start},${end}`);
    fySelect.appendChild(option);
  }

  const pmInput = document.getElementById('pmSelect');
  const pmList = document.getElementById('pmList');

  async function fetchPMs(search = "") {
    try {
      const res = await fetch(`${API_BASE}/api/pms?search=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error("PMs not found");
      const pms = await res.json();

      pmList.innerHTML = "";
      pms.forEach(pm => {
        const option = document.createElement("option");
        option.value = pm;
        pmList.appendChild(option);
      });
    } catch (err) {
      console.error("PM fetch error:", err.message);
    }
  }

  pmInput.addEventListener("input", (e) => {
    fetchPMs(e.target.value);
  });

  document.getElementById("filterForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const pmNames = [pmInput.value.trim()];
    const [start, end] = fySelect.value.split(',');

    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pmNames, start, end })
      });

      if (!res.ok) throw new Error("Failed to fetch projects");

      const projects = await res.json();
      analyzeWorkload(projects);
      renderCharts();
      suggestLowestWorkloadPM();
    } catch (err) {
      alert(`❌ Error loading projects: ${err.message}`);
    }
  });

  function analyzeWorkload(projects) {
    currentWorkloads = {};
    projects.forEach(p => {
      const weeks = (new Date(p.EndDate) - new Date(p.StartDate)) / (1000 * 60 * 60 * 24 * 7);
      const owner = p.OwnerName?.trim();
      currentWorkloads[owner] = (currentWorkloads[owner] || 0) + weeks;
    });
  }

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

  document.getElementById("createForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("projectName").value;

    try {
      const res = await fetch(`${API_BASE}/api/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, owner: selectedPM })
      });

      if (!res.ok) throw new Error("Failed to create project");

      const result = await res.json();
      alert(`✅ "${result.name}" assigned to ${result.owner}`);
    } catch (err) {
      alert(`❌ Error creating project: ${err.message}`);
    }
  });

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
});
