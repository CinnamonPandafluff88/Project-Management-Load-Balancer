// script.js
const API_BASE = 'https://project-management-load-balancer.siphosihle-tsotsa.workers.dev/api';
const pmSelect = document.getElementById('pmSelect');
const fySelect = document.getElementById('fySelect');
const projectsContainer = document.getElementById('projectsContainer');
const newProjectNameInput = document.getElementById('newProjectName');
const newProjectPmSelect = document.getElementById('newProjectPmSelect');
const createProjectBtn = document.getElementById('createProjectBtn');
const statusMessage = document.getElementById('statusMessage');
const workloadPieCanvas = document.getElementById('workloadPieChart').getContext('2d');
const workloadBarCanvas = document.getElementById('workloadBarChart').getContext('2d');
let allProjects = [];
let pieChart, barChart;
function getFiscalYearRange(fy) {
 const match = fy.match(/FY (\d{2})\/(\d{2})/);
 if (!match) return [null, null];
 const startYear = 2000 + parseInt(match[1]);
 const endYear = 2000 + parseInt(match[2]);
 return [`${startYear}-03-01`, `${endYear}-02-28`];
}
async function fetchPMs() {
 const res = await fetch(`${API_BASE}/pms`);
 const pmList = await res.json();
 pmSelect.innerHTML = '';
 newProjectPmSelect.innerHTML = '';
 pmList.forEach(pm => {
   const opt1 = new Option(pm, pm);
   const opt2 = new Option(pm, pm);
   pmSelect.appendChild(opt1);
   newProjectPmSelect.appendChild(opt2);
 });
}
async function fetchProjects() {
 const selectedPm = pmSelect.value;
 const fy = fySelect.value;
 const [start, end] = getFiscalYearRange(fy);
 statusMessage.textContent = 'Fetching projects...';
 const res = await fetch(`${API_BASE}/projects`, {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({
     pmNames: [selectedPm],
     start,
     end,
   }),
 });
 const data = await res.json();
 allProjects = data;
 renderProjectsList(data);
 renderWorkloadCharts(data);
 statusMessage.textContent = `${data.length} projects loaded for ${selectedPm}`;
}
async function createProject() {
 const name = newProjectNameInput.value.trim();
 const owner = newProjectPmSelect.value;
 if (!name || !owner) {
   alert('Enter both project name and PM.');
   return;
 }
 statusMessage.textContent = 'Creating project...';
 const res = await fetch(`${API_BASE}/create`, {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({ name, owner }),
 });
 const created = await res.json();
 statusMessage.textContent = `✅ Project "${created.name}" created successfully`;
 await fetchProjects();
 newProjectNameInput.value = '';
}
function populateFiscalYears() {
 const currentYear = new Date().getFullYear() % 100;
 for (let i = currentYear - 2; i <= currentYear + 3; i++) {
   const next = (i + 1).toString().padStart(2, '0');
   const label = `FY ${i}/${next}`;
   const option = new Option(label, label);
   fySelect.appendChild(option);
 }
 fySelect.value = `FY ${currentYear}/${(currentYear + 1).toString().padStart(2, '0')}`;
}
function renderProjectsList(projects) {
 projectsContainer.innerHTML = '';
 if (!projects.length) {
   projectsContainer.innerHTML = '<em>No projects found.</em>';
   return;
 }
 const ul = document.createElement('ul');
 projects.forEach(p => {
   const li = document.createElement('li');
   li.textContent = `${p.Name} | Start: ${p.StartDate?.slice(0, 10)} | Status: ${p.OverallStatus}`;
   ul.appendChild(li);
 });
 projectsContainer.appendChild(ul);
}
function renderWorkloadCharts(projects) {
 const pmWorkload = {};
 projects.forEach(p => {
   const start = new Date(p.StartDate);
   const end = new Date(p.EndDate);
   const days = (end - start) / (1000 * 60 * 60 * 24) + 1;
   const owner = p.OwnerName?.trim() || 'Unassigned';
   pmWorkload[owner] = (pmWorkload[owner] || 0) + days;
 });
 const labels = Object.keys(pmWorkload);
 const data = Object.values(pmWorkload);
 if (pieChart) pieChart.destroy();
 if (barChart) barChart.destroy();
 pieChart = new Chart(workloadPieCanvas, {
   type: 'pie',
   data: {
     labels,
     datasets: [{
       data,
       backgroundColor: labels.map(() => randomColor()),
     }],
   },
   options: { plugins: { legend: { position: 'bottom' } } },
 });
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
     scales: { y: { beginAtZero: true } },
     plugins: { legend: { display: false } },
   },
 });
}
function randomColor() {
 const r = Math.floor(150 + Math.random() * 100);
 const g = Math.floor(150 + Math.random() * 100);
 const b = Math.floor(150 + Math.random() * 100);
 return `rgba(${r},${g},${b},0.7)`;
}
pmSelect.addEventListener('change', fetchProjects);
fySelect.addEventListener('change', fetchProjects);
createProjectBtn.addEventListener('click', createProject);
async function init() {
 populateFiscalYears();
 await fetchPMs();
 await fetchProjects();
}
init();