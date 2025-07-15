document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('assignForm');
  const managersSelect = document.getElementById('managers');
  const popup = document.getElementById('popup');
  const closeModal = document.getElementById('closeModal');
  const assignedManagerText = document.getElementById('assignedManager');

  // 🌐 Your deployed Worker URL
  const WORKER_URL = 'https://project-management-load-balancer.siphosihle-tsotsa.workers.dev'; // 🔁 Replace with your actual Worker URL

  // 🌐 Load project managers and best PM
  async function loadManagers() {
    try {
      const res = await fetch(WORKER_URL);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      const { managers, bestPM } = data;

      if (!Array.isArray(managers)) {
        throw new Error("Response 'managers' is not an array");
      }

      managersSelect.innerHTML = ""; // Clear existing options
      managers.forEach(pm => {
        const option = document.createElement('option');
        option.value = pm;
        option.textContent = pm;
        managersSelect.appendChild(option);
      });

      // Pre-fill the best PM in the popup (optional)
      assignedManagerText.textContent = `Best PM (based on workload): ${bestPM}`;

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
      assignedManagerText.textContent = `Assigned to: ${result.bestPM}`;
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
