// script.js
// Elements
const pmSelect = document.getElementById('pmSelect');
const fySelect = document.getElementById('fySelect');
const projectsContainer = document.getElementById('projectsContainer');
const workloadPieCanvas = document.getElementById('workloadPieChart').getContext('2d');
const workloadBarCanvas = document.getElementById('workloadBarChart').getContext('2d');
const newProjectNameInput = document.getElementById('newProjectName');
const newProjectPmSelect = document.getElementById('newProjectPmSelect');
const createProjectBtn = document.getElementById('createProjectBtn');
const statusMessage = document.getElementById('statusMessage');
// Globals
let allProjects = [];
let allManagers = [];
let pieChart, barChart;
// API Base URL
const API_BASE = 'https://project-management-load-balancer.siphosihle-tsotsa.workers.dev/api';
// Helper: Fetch JSON with error handling
async function fetchJSON(url, options = {}) {
 try {
   const res = await fetch(url, options);
   if (!res.ok) {
     const errorData = await res.json().catch(() => ({}));
     throw new Error(`Error ${res.status}: ${errorData.message || res.statusText}`);
   }
   return await res.json();
 } catch (err) {
   throw new Error(`Network or server error: ${err.message}`);
 }
}
// Initialize Managers dropdowns with search capability
function populateManagersDropdown(managers, selectElement) {
 // Clear current options
 selectElement.innerHTML = '';
 managers.forEach(pm => {
   const option = document.createElement('option');
   option.value = pm;
   option.textContent = pm;
   selectElement.appendChild(option);
 });
}
// Fetch managers from backend (or static list if needed)
async function loadManagers() {
 // For demo, static list - replace with API call if available
 allManagers = ['Sihle Tsotsa', 'Doris', 'Koketso', 'Other PM'];
 populateManagersDropdown(pmSelect, pmSelect);
 populateManagersDropdown(newProjectPmSelect, newProjectPmSelect);
}
// Build fiscal year filter string, e.g. "FY 26/27"
function buildFiscalYearString(yearStart) {
 const yearEnd = (yearStart + 1) % 100;
 return `FY ${yearStart}/${yearEnd.toString().padStart(2, '0')}`;
}
// Load fiscal years dropdown dynamically (e.g. FY 22/23 to FY 30/31)
function populateFiscalYears() {
 const currentYear = new Date().getFullYear() % 100;
 fySelect.innerHTML = '';
 for (let start = currentYear - 3; start <= currentYear + 5; start++) {
   const fyString = buildFiscalYearString(start);
   const option = document.createElement('option');
   option.value = fyString;
   option.textContent = fyString;
   fySelect.appendChild(option);
 }
 fySelect.value = buildFiscalYearString(currentYear);
}
// Filter projects by PM and fiscal year
function filterProjects(pm, fiscalYear) {
 return allProjects.filter(project => {
   return project.manager === pm && project.fiscalYear === fiscalYear;
 });
}
// Render projects list to container
function renderProjectsList(projects) {
 projectsContainer.innerHTML = '';
 if (projects.length === 0) {
   projectsContainer.textContent = 'No projects found for selected PM and Fiscal Year.';
   return;
 }
 const ul = document.createElement('ul');
 projects.forEach(p => {
   const li = document.createElement('li');
   li.textContent = `${p.name} | Start: ${p.startDate} | End: ${p.endDate} | Status: ${p.status}`;
   ul.appendChild(li);
 });
 projectsContainer.appendChild(ul);
}
// Calculate workload by PM (sum of project durations in days)
function calculateWorkload(projects) {
 const workload = {};
 projects.forEach(p => {
   const start = new Date(p.startDate);
   const end = new Date(p.endDate);
   const days = (end - start) / (1000 * 60 * 60 * 24) + 1;
   workload[p.manager] = (workload[p.manager] || 0) + days;
 });
 return workload;
}
// Render pie chart for workload distribution
function renderPieChart(workload) {
 if (pieChart) pieChart.destroy();
 const labels = Object.keys(workload);
 const data = Object.values(workload);
 pieChart = new Chart(workloadPieCanvas, {
   type: 'pie',
   data: {
     labels,
     datasets: [{
       data,
       backgroundColor: labels.map(() => randomColor()),
     }],
   },
   options: {
     responsive: true,
     plugins: { legend: { position: 'bottom' } },
   },
 });
}
// Render bar chart for workload per PM
function renderBarChart(workload) {
 if (barChart) barChart.destroy();
 const labels = Object.keys(workload);
 const data = Object.values(workload);
 barChart = new Chart(workloadBarCanvas, {
   type: 'bar',
   data: {
     labels,
     datasets: [{
       label: 'Workload (days)',
       data,
       backgroundColor: labels.map(() => randomColor()),
     }],
   },
   options: {
     responsive: true,
     scales: {
       y: { beginAtZero: true }
     },
     plugins: { legend: { display: false } },
   },
 });
}
// Generate a random pastel color for charts
function randomColor() {
 const r = Math.floor(150 + Math.random() * 100);
 const g = Math.floor(150 + Math.random() * 100);
 const b = Math.floor(150 + Math.random() * 100);
 return `rgba(${r},${g},${b},0.7)`;
}
// Load projects from API with filtering by managers & fiscal year
async function loadProjects(pmList, fiscalYear) {
 // Example API URL: /api/projects?managers=Sihle,Doris&fiscalYear=FY 26/27
 const managersParam = pmList.join(',');
 const url = `${API_BASE}/projects?managers=${encodeURIComponent(managersParam)}&fiscalYear=${encodeURIComponent(fiscalYear)}`;
 statusMessage.textContent = 'Loading projects...';
 try {
   const data = await fetchJSON(url);
   allProjects = data.projects || [];
   statusMessage.textContent = `Loaded ${allProjects.length} projects.`;
   // Render filtered projects for selected PM + FY
   updateProjectsView();
 } catch (err) {
   statusMessage.textContent = `Error loading projects: ${err.message}`;
   projectsContainer.innerHTML = '';
 }
}
// Update projects list and charts based on selected filters
function updateProjectsView() {
 const selectedPm = pmSelect.value;
 const selectedFy = fySelect.value;
 const filteredProjects = filterProjects(selectedPm, selectedFy);
 renderProjectsList(filteredProjects);
 // Calculate workload for all managers for pie/bar charts
 const workload = calculateWorkload(allProjects);
 renderPieChart(workload);
 renderBarChart(workload);
}
// Create a new project via API POST
async function createProject() {
 const projectName = newProjectNameInput.value.trim();
 const projectManager = newProjectPmSelect.value;
 const fiscalYear = fySelect.value;
 if (!projectName) {
   alert('Please enter a project name.');
   return;
 }
 if (!projectManager) {
   alert('Please select a project manager.');
   return;
 }
 const newProject = {
   name: projectName,
   manager: projectManager,
   fiscalYear,
   // Default start/end dates or prompt for these? For demo, today + 30 days:
   startDate: new Date().toISOString().slice(0, 10),
   endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
   status: 'New',
 };
 statusMessage.textContent = 'Creating project...';
 try {
   const created = await fetchJSON(`${API_BASE}/projects`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(newProject),
   });
   statusMessage.textContent = `Project "${created.name}" created successfully!`;
   // Add new project locally and refresh views
   allProjects.push(created);
   updateProjectsView();
   // Reset form
   newProjectNameInput.value = '';
 } catch (err) {
   statusMessage.textContent = `Error creating project: ${err.message}`;
 }
}
// Event Listeners
pmSelect.addEventListener('change', updateProjectsView);
fySelect.addEventListener('change', () => {
 // On FY change, reload all projects for all managers in current PM select?
 // For simplicity, reload projects filtered by all managers for selected FY:
 loadProjects(allManagers, fySelect.value);
});
createProjectBtn.addEventListener('click', createProject);
// Initialize
async function init() {
 populateFiscalYears();
 await loadManagers();
 // Load projects for all managers and default FY on start
 await loadProjects(allManagers, fySelect.value);
}
init();