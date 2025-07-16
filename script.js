document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('assignForm');
  const managersSelect = document.getElementById('managers');
  const popup = document.getElementById('popup');
  const closeModal = document.getElementById('closeModal');
  const assignedManagerText = document.getElementById('assignedManager');

  // ✅ Your deployed Worker endpoint
  const WORKER_URL = 'https://project-management-load-balancer.siphosihle-tsotsa.workers.dev/resources';

// 🌐 Load project managers and display allocation
async function loadManagers() {
  try {
    const res = await fetch(WORKER_URL);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }
    const { pmList, managerMap } = await res.json();
    managersSelect.innerHTML = "";
    pmList.forEach(pm => {
      const option = document.createElement('option');
      option.value = pm;
      option.textContent = pm;
      managersSelect.appendChild(option);
    });
    managersSelect.addEventListener('change', () => {
      const selectedManagers = Array.from(managersSelect.selectedOptions).map(opt => opt.value);
      const displayDiv = document.getElementById('projectDisplay');
      displayDiv.innerHTML = "";
      selectedManagers.forEach(pm => {
        const projects = managerMap[pm] || [];
        const totalDuration = projects.reduce((acc, p) => acc + (p.duration || 0), 0);
        let weight = "LOW";
        if (totalDuration > 365) weight = "HIGH";
        else if (totalDuration > 180) weight = "MEDIUM";
        else if (totalDuration > 90) weight = "FAIR";
        const entry = document.createElement("div");
        entry.textContent = `${pm} | Projects: ${projects.length} | Allocation Weight: ${weight}`;
        displayDiv.appendChild(entry);
      });
    });
    console.log("✅ Managers loaded:", pmList);
  } catch (err) {
    alert('❌ Failed to load project managers.');
    console.error("❌ loadManagers error:", err);
  }
}

  // 📤 Assign project manager (simulated logic)
  form.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      const res = await fetch(WORKER_URL);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const result = await res.json();
      assignedManagerText.textContent = `Assigned to: ${result.bestPM || 'Unknown'}`;
      popup.classList.remove('hidden');
    } catch (err) {
      alert('❌ Could not assign project manager.');
      console.error("❌ assign error:", err);
    }
  });

  // ❌ Close modal
  closeModal.addEventListener('click', () => {
    popup.classList.add('hidden');
  });

  // ⏬ Init
  loadManagers();
});
