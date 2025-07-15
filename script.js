document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('assignForm');

  const managersSelect = document.getElementById('managers');

  const popup = document.getElementById('popup');

  const closeModal = document.getElementById('closeModal');

  const assignedManagerText = document.getElementById('assignedManager');

  // 🌐 Fetch project managers on load

  async function loadManagers() {

    try {

      const res = await fetch('/api/managers');

      const managers = await res.json();

      managers.forEach(pm => {

        const option = document.createElement('option');

        option.value = pm.name;

        option.textContent = pm.name;

        managersSelect.appendChild(option);

      });

    } catch (err) {

      alert('Failed to load project managers.');

      console.error(err);

    }

  }

  // 📤 Handle form submission

  form.addEventListener('submit', async e => {

    e.preventDefault();

    try {

      const res = await fetch('/api/assign');

      const result = await res.json();

      assignedManagerText.textContent = `Assigned to: ${result.managerName}`;

      popup.classList.remove('hidden');

    } catch (err) {

      alert('Could not assign project manager.');

      console.error(err);

    }

  });

  // ❌ Close popup

  closeModal.addEventListener('click', () => {

    popup.classList.add('hidden');

  });

  // ⏬ Init

  loadManagers();

});
 