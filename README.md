# Project-Management-Load-Balancer
This web app helps teams like ours make smarter, faster project assignment decisions using live workload analysis from PPM Express.
It fetches current projects assigned to selected Project Managers (PMs), analyzes their workload based on project durations, and automatically suggests the most available PM for any new incoming project.
⸻
✨ Features
    ✅ Multi-PM selection via searchable dropdown
    ✅ Fiscal Year (FY) picker that maps correctly to your organization’s March–February financial calendar
    ✅ Visual workload analysis using dynamic bar and pie charts
    ✅ Smart project assignment — automatically picks the PM with the lowest active workload
    ✅ Project creation form that only triggers when the user clicks Create Project
    ✅ Fully integrated with the PPM Express API
⸻
🔧 Technologies Used
    • HTML, CSS, JavaScript (Vanilla)
    • Chart.js (for bar and pie charts)
    • Cloudflare Pages (Frontend hosting)
    • Cloudflare Workers (Backend API calls to PPM Express)
    • PPM Express API (Project data access and creation)
⸻
🚀 How It Works
1. Filter Active Projects
    • User selects Project Managers (multi-select dropdown)
    • Picks a Fiscal Year (e.g., FY26/27 = March 2026 to Feb 2027)
    • App fetches all active projects in that timeframe from PPM Express
2. Analyze Workload
    • For each PM, the app calculates workload by summing the project durations (in weeks)
    • Displays workload using a bar chart (total weeks) and pie chart (% split)
3. Suggest Project Manager
    • App automatically identifies the PM with the least total workload
    • Suggested PM is displayed in a read-only field
4. Create New Project
    • User types in a new project name
    • Clicks “Create Project”
    • The app uses the PPM Express API to create the project with:
    • Provided name
    • Assigned PM (suggested)
    • Default start date = today
    • End date = today + 12 weeks
    • Status = Not Started
⸻
📁 File Structure
/ppm-load-balancer
├── FrontEnd.html         # Frontend UI
├── style.css          # Cute, clean styling
├── script.js          # Charting, PM logic, API calls
├── /worker
│   └── worker.js      # Cloudflare Worker (API backend)
└── README.md          # Project guide (you’re here!)

⸻
⚙️ PPM Express API Notes
    • GET Projects: /api/v1/projects
    • POST Project: /api/v1/projects with attributes
    • Authentication: Bearer YOUR_API_KEY
    • Required scopes: Read Projects, Write Projects
Make sure your API key is added to Cloudflare as a Worker Secret
⸻
🛠️ Setup Instructions
🔹 1. Create the repository on Github
    Create a codespace
🔹 2. Set Up Cloudflare Worker
        npm install -g wrangler
        cd worker
        wrangler secret put PPM_API_KEY
        wrangler publish
🔹 3. Deploy Frontend to Cloudflare Pages
    • Create a new Pages project in Cloudflare
    • Set the directory to root (/)
    • Deploy the site
⸻
💡 Ideas for Future Enhancements
• 📦 Add login & authentication (for PM-specific access)
• 🧠 Improve assignment logic with calendar overlap or effort-based weighting
• 🌐 Add support for Teams notifications when a new project is assigned
• 🧾 Add export/reporting (PDF/Excel)
⸻
👩🏽‍💼 Built by
Siphosihle Tsotsa
Project Manager • Smart Workflow Builder 💼🧠✨
Based in Gauteng, South Africa 🇿🇦
