document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('assignForm');
  const managersSelect = document.getElementById('managers');
  const popup = document.getElementById('popup');
  const closeModal = document.getElementById('closeModal');
  const assignedManagerText = document.getElementById('assignedManager');

  // 🌐 Load project managers
  async function loadManagers() {
    try {
      const res = await fetch('/api/managers');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }
      const managers = await res.json();
      if (!Array.isArray(managers)) {
        throw new Error("Response is not an array");
      }
      managersSelect.innerHTML = ""; // Clear existing options
      managers.forEach(pm => {
        const option = document.createElement('option');
        option.value = pm.name;
        option.textContent = pm.name;
        managersSelect.appendChild(option);
      });
    } catch (err) {
      alert('❌ Failed to load project managers.');
      console.error("❌ loadManagers error:", err);
    }
  }

  // 📤 Assign project manager
  form.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/assign');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }
      const result = await res.json();
      assignedManagerText.textContent = `Assigned to: ${result.managerName}`;
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
