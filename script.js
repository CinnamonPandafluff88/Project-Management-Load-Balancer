document.addEventListener('DOMContentLoaded', () => {
  const WORKER_URL = 'https://project-management-load-balancer.siphosihle-tsotsa.workers.dev';
  const searchInput = document.getElementById('managerSearch');
  const dropdownList = document.getElementById('dropdownList');
  const projectDisplay = document.getElementById('projectDisplay');
  const popup = document.getElementById('popup');
  const closeModal = document.getElementById('closeModal');
  const assignedManagerText = document.getElementById('assignedManager');

  let allManagers = [];
  let allProjectStats = [];
  let selectedManagers = [];

  // 🌐 Load project managers
  async function fetchManagers() {
    try {
      const res = await fetch(`${WORKER_URL}/resources`);
      const data = await res.json();
      allManagers = data;
      console.log("✅ Managers loaded:", data);
    } catch (err) {
      alert('❌ Failed to load project managers.');
      console.error("❌ fetchManagers error:", err);
    }
  }

  // 📊 Load project stats
  async function fetchProjectStats() {
    try {
      const res = await fetch(`${WORKER_URL}/projects`);
      allProjectStats = await res.json();
      console.log("✅ Project stats loaded:", allProjectStats);
    } catch (err) {
      alert('❌ Failed to load project stats.');
      console.error("❌ fetchProjectStats error:", err);
    }
  }

  function updateProjectDisplay() {
    projectDisplay.innerHTML = '';

    const countDiv = document.createElement('div');
    countDiv.innerHTML = `<strong>Selected Managers:</strong> ${selectedManagers.length}`;
    projectDisplay.appendChild(countDiv);

    selectedManagers.forEach(manager => {
      const stats = allProjectStats.find(p => p.name === manager);
      if (!stats) return;

      const div = document.createElement('div');
      div.textContent = `${stats.name} — Projects: ${stats.projectCount} — Allocation Weight: ${stats.allocationWeight} (${stats.allocationLabel})`;
      projectDisplay.appendChild(div);
    });
  }

  function filterDropdown(query) {
    dropdownList.innerHTML = '';
    const filtered = allManagers.filter(name =>
      name.toLowerCase().includes(query.toLowerCase()) &&
      !selectedManagers.includes(name)
    );
    filtered.forEach(name => {
      const li = document.createElement('li');
      li.textContent = name;
      li.onclick = () => {
        selectedManagers.push(name);
        searchInput.value = '';
        dropdownList.classList.add('hidden');
        updateProjectDisplay();
      };
      dropdownList.appendChild(li);
    });
    dropdownList.classList.toggle('hidden', filtered.length === 0);
  }

  searchInput.addEventListener('input', () => {
    filterDropdown(searchInput.value);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-dropdown')) {
      dropdownList.classList.add('hidden');
    }
  });

document.getElementById('assignForm').addEventListener('submit', e => {
  e.preventDefault();

  if (selectedManagers.length < 2) {
    alert("Please select at least 2 project managers before assigning.");
    return;
  }

  const candidates = allProjectStats.filter(p =>
    selectedManagers.includes(p.name)
  );

  candidates.sort((a, b) => a.allocationWeight - b.allocationWeight);
  const bestPM = candidates[0]?.name || "Unknown";

  assignedManagerText.textContent = `Assigned to: ${bestPM}`;
  popup.classList.remove('hidden');

  // 🎉 Emoji burst using js-confetti
const jsConfetti = new JSConfetti();

// 🎉 Repeat emoji bursts every 500ms for 3 seconds
let emojiBurstCount = 0;
const emojiBurstInterval = setInterval(() => {
  jsConfetti.addConfetti({
    emojis: ['🎉', '✨', '💖', '🌈', '💫', '🎊'],
    emojiSize: 40,
    confettiNumber: 30,
  });

  emojiBurstCount++;
  if (emojiBurstCount >= 6) { // 6 bursts = 3 seconds
    clearInterval(emojiBurstInterval);
  }
}, 500);

});

  closeModal.addEventListener('click', () => {
    popup.classList.add('hidden');
  });

  // ⏬ Init
  fetchManagers();
  fetchProjectStats();
});
