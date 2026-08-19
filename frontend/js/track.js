const API_URL = window.API_BASE_URL;
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "/login";
}

const applicationsList = document.getElementById("applicationsList");
let allApplications = [];
let resumeChart = null;


// =====================================================
// LOAD DASHBOARD ANALYTICS (stat cards + resume trend)
// =====================================================

async function loadAnalytics() {

    try {

        const res = await fetch(`${API_URL}/analytics/dashboard`, {
            headers: { Authorization: "Bearer " + token }
        });

        if (!res.ok) return;

        const data = await res.json();

        document.getElementById("statApplied").innerText = data.applied;
        document.getElementById("statShortlisted").innerText = data.shortlisted;
        document.getElementById("statSelected").innerText = data.selected;
        document.getElementById("statRejected").innerText = data.rejected;
        document.getElementById("statBestMatch").innerText =
            data.best_match_percentage + "%";
        document.getElementById("statSaved").innerText = data.saved_jobs_count;

        renderResumeTrendChart(data.resume_score_trend || []);

    } catch (error) {
        console.error("Analytics load error:", error);
    }
}


function renderResumeTrendChart(trend) {

    const ctx = document.getElementById("resumeTrendChart");

    if (!ctx) return;

    const labels = trend.length
        ? trend.map(t => t.date)
        : ["No data yet"];

    const scores = trend.length
        ? trend.map(t => t.score)
        : [0];

    if (resumeChart) {
        resumeChart.destroy();
    }

    resumeChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "ATS Score",
                data: scores,
                borderColor: "#6366f1",
                backgroundColor: "rgba(99,102,241,0.15)",
                fill: true,
                tension: 0.3,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: { color: "#94a3b8" },
                    grid: { color: "rgba(148,163,184,0.1)" }
                },
                x: {
                    ticks: { color: "#94a3b8" },
                    grid: { display: false }
                }
            }
        }
    });
}


// =====================================================
// LOAD APPLICATIONS
// =====================================================

async function loadApplications() {

    try {

        const res = await fetch(`${API_URL}/applications/me`, {
            headers: { Authorization: "Bearer " + token }
        });

        if (!res.ok) {
            throw new Error("Unable to load applications");
        }

        allApplications = await res.json();

        renderApplications("");

    } catch (error) {
        console.error("Applications load error:", error);

        applicationsList.innerHTML = `
            <div class="job-card">
                <h2>❌ Unable to load applications</h2>
                <p>Make sure the backend is running.</p>
            </div>
        `;
    }
}


function statusBadge(status) {

    const map = {
        applied: { label: "🚀 Applied", color: "#6366f1" },
        shortlisted: { label: "⭐ Shortlisted", color: "#f59e0b" },
        selected: { label: "✅ Selected", color: "#22c55e" },
        rejected: { label: "❌ Rejected", color: "#ef4444" }
    };

    const info = map[status] || map.applied;

    return `<span style="
        background:${info.color};
        color:#fff;
        padding:5px 12px;
        border-radius:20px;
        font-size:12px;
        font-weight:600;
    ">${info.label}</span>`;
}


function renderApplications(filter) {

    const filtered = filter
        ? allApplications.filter(a => a.status === filter)
        : allApplications;

    if (!filtered.length) {
        applicationsList.innerHTML = `
            <div class="job-card">
                <h2>📭 No applications here</h2>
                <p>Jobs you apply to will show up in this tracker.</p>
                <br>
                <a href="/jobs-page" class="btn">🔍 Discover Jobs</a>
            </div>
        `;
        return;
    }

    applicationsList.innerHTML = filtered.map(app => `
        <div class="job-card" style="margin-bottom:16px;">

            <div class="job-top">
                <div class="company">
                    <h2>${app.company || "Company"}</h2>
                    <h4>${app.job_title || "Job"}</h4>
                </div>

                <div class="match-badge">
                    🎯 ${app.match_percentage}% Match
                </div>
            </div>

            <div class="job-info">
                <span>📍 ${app.location || "—"}</span>
                <span>💰 ${app.salary || "—"}</span>
                <span>🕒 Applied ${new Date(app.applied_at).toLocaleDateString()}</span>
            </div>

            <div style="margin-top:12px;">
                ${statusBadge(app.status)}
            </div>

        </div>
    `).join("");
}


// =====================================================
// FILTER TABS
// =====================================================

document.querySelectorAll(".filter-tab").forEach(tab => {

    tab.addEventListener("click", () => {

        document.querySelectorAll(".filter-tab")
            .forEach(t => t.classList.remove("active"));

        tab.classList.add("active");

        renderApplications(tab.dataset.status);
    });
});


// =====================================================
// LOGOUT
// =====================================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "/login";
    });
}


// =====================================================
// START
// =====================================================

loadAnalytics();
loadApplications();
