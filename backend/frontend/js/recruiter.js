// =====================================================
// SWIPEX - RECRUITER DASHBOARD
// REAL BACKEND DATA
// Jobs + Applications + Candidates
// =====================================================

const API_URL = window.API_BASE_URL;
console.log("🔥 SWIPEX RECRUITER.JS LOADED 🔥");


// =====================================================
// DOM ELEMENTS
// =====================================================

const jobsContainer =
    document.getElementById("jobsContainer");

const applicationsContainer =
    document.getElementById("applicationsContainer");


// =====================================================
// AUTHENTICATION
// =====================================================

function getToken() {

    const token = localStorage.getItem("token");

    console.log(
        "🔐 RECRUITER TOKEN EXISTS:",
        !!token
    );

    return token;
}


function authHeaders() {

    const token = getToken();

    return {
        "Authorization": "Bearer " + token
    };
}


// =====================================================
// LOAD RECRUITER DASHBOARD
// =====================================================

async function loadRecruiterJobs() {

    console.log("🚀 Loading recruiter dashboard...");

    const token = getToken();

    if (!token) {

        alert("Please login as recruiter.");

        window.location.href = "/login";

        return;
    }

    try {

        // =================================================
        // LOAD JOBS
        // =================================================

        console.log("📥 Loading jobs...");

        const jobsResponse = await fetch(
            `${API_URL}/jobs`,
            {
                method: "GET",
                headers: authHeaders()
            }
        );

        console.log(
            "📡 Jobs status:",
            jobsResponse.status
        );

        if (!jobsResponse.ok) {

            const errorData =
                await jobsResponse.json().catch(() => ({}));

            throw new Error(
                errorData.detail ||
                "Unable to load jobs."
            );
        }

        const jobs =
            await jobsResponse.json();

        console.log(
            "💼 JOBS FROM BACKEND:",
            jobs
        );


        // =================================================
        // TOTAL JOBS
        // =================================================

        const totalJobs =
            document.getElementById("totalJobs");

        if (totalJobs) {

            totalJobs.innerText =
                jobs.length;
        }


        // =================================================
        // LOAD APPLICATIONS
        // =================================================

        console.log(
            "📥 Loading recruiter applications..."
        );

        const applications =
            await loadRecruiterApplications();


        console.log(
            "🔥🔥 APPLICATIONS FROM BACKEND:",
            applications
        );

        console.log(
            "🔥🔥 APPLICATION COUNT:",
            applications.length
        );


        // =================================================
        // TOTAL APPLICATIONS
        // =================================================

        const totalApplications =
            document.getElementById(
                "totalApplications"
            );

        if (totalApplications) {

            totalApplications.innerText =
                applications.length;
        }


        // =================================================
        // UNIQUE CANDIDATES
        // =================================================

        const uniqueCandidates =
            new Set();

        applications.forEach(
            application => {

                if (
                    application.candidate_email
                ) {

                    uniqueCandidates.add(
                        application.candidate_email
                    );

                }
                else if (
                    application.candidate_name
                ) {

                    uniqueCandidates.add(
                        application.candidate_name
                    );

                }
                else if (
                    application.user_id
                ) {

                    uniqueCandidates.add(
                        String(application.user_id)
                    );
                }

            }
        );


        const totalCandidates =
            document.getElementById(
                "totalCandidates"
            );

        if (totalCandidates) {

            totalCandidates.innerText =
                uniqueCandidates.size;
        }


        // =================================================
        // SHORTLISTED
        // =================================================

        const shortlisted =
            applications.filter(
                application => {

                    return normalizeStatus(
                        application.status
                    ) === "shortlisted";

                }
            );


        const shortlistedElement =
            document.getElementById(
                "shortlisted"
            );

        if (shortlistedElement) {

            shortlistedElement.innerText =
                shortlisted.length;
        }


        // =================================================
        // BEST MATCH
        // =================================================

        let bestMatch = 0;

        applications.forEach(
            application => {

                const match =
                    Number(
                        application.match_percentage
                    ) || 0;

                if (match > bestMatch) {

                    bestMatch = match;
                }

            }
        );


        const bestMatchElement =
            document.getElementById(
                "bestMatch"
            );

        if (bestMatchElement) {

            bestMatchElement.innerText =
                bestMatch + "%";
        }


        // =================================================
        // RENDER JOBS
        // =================================================

        renderJobs(jobs);


        // =================================================
        // RENDER APPLICATIONS
        // =================================================

        console.log(
            "🎨 Calling renderApplications..."
        );

        renderApplications(
            applications
        );


        console.log(
            "✅ RECRUITER DASHBOARD LOADED"
        );

    }

    catch (error) {

        console.error(
            "❌ RECRUITER DASHBOARD ERROR:",
            error
        );


        if (jobsContainer) {

            jobsContainer.innerHTML = `

                <div class="job-card">

                    <h2>
                        ❌ Unable to load recruiter dashboard
                    </h2>

                    <p>
                        ${escapeHtml(error.message)}
                    </p>

                </div>

            `;
        }


        if (applicationsContainer) {

            applicationsContainer.innerHTML = `

                <div class="job-card">

                    <h2>
                        ❌ Unable to load applications
                    </h2>

                    <p>
                        ${escapeHtml(error.message)}
                    </p>

                </div>

            `;
        }

    }
}


// =====================================================
// LOAD REAL RECRUITER APPLICATIONS
// =====================================================

async function loadRecruiterApplications() {

    console.log(
        "📥 REQUESTING /applications/recruiter"
    );


    const token =
        getToken();


    if (!token) {

        console.error(
            "❌ NO TOKEN FOUND"
        );

        return [];
    }


    try {

        const response =
            await fetch(
                `${API_URL}/applications/recruiter`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        console.log(
            "📡 APPLICATIONS HTTP STATUS:",
            response.status
        );


        const rawText =
            await response.text();


        console.log(
            "📄 RAW APPLICATION RESPONSE:",
            rawText
        );


        if (!response.ok) {

            let message =
                "Unable to load applications.";

            try {

                const errorData =
                    JSON.parse(rawText);

                message =
                    errorData.detail ||
                    message;

            }

            catch (error) {

                console.error(
                    "Could not parse error response.",
                    error
                );
            }


            throw new Error(message);
        }


        let applications = [];


        try {

            applications =
                JSON.parse(rawText);

        }

        catch (error) {

            console.error(
                "❌ APPLICATION JSON PARSE ERROR:",
                error
            );

            return [];
        }


        // =================================================
        // SAFETY CHECK
        // =================================================

        if (!Array.isArray(applications)) {

            console.error(
                "❌ Expected applications array but received:",
                applications
            );

            return [];
        }


        console.log(
            "👥 PARSED APPLICATIONS:",
            applications
        );

        console.log(
            "👥 APPLICATION COUNT:",
            applications.length
        );


        // =================================================
        // DEBUG EACH CANDIDATE
        // =================================================

        applications.forEach(
            application => {

                console.log(
                    "👤 CANDIDATE:",
                    application.candidate_name,
                    "| EMAIL:",
                    application.candidate_email,
                    "| JOB:",
                    application.job_title,
                    "| STATUS:",
                    application.status,
                    "| MATCH:",
                    application.match_percentage
                );

            }
        );


        return applications;

    }

    catch (error) {

        console.error(
            "❌ APPLICATION LOAD ERROR:",
            error
        );


        if (applicationsContainer) {

            applicationsContainer.innerHTML = `

                <div class="job-card">

                    <h2>
                        ❌ Unable to load applications
                    </h2>

                    <p>
                        ${escapeHtml(error.message)}
                    </p>

                </div>

            `;
        }


        return [];
    }
}


// =====================================================
// RENDER JOBS
// =====================================================

function renderJobs(jobs) {

    if (!jobsContainer) {

        console.error(
            "❌ jobsContainer NOT FOUND"
        );

        return;
    }


    if (
        !Array.isArray(jobs) ||
        jobs.length === 0
    ) {

        jobsContainer.innerHTML = `

            <div class="job-card">

                <h3>
                    📭 No Jobs Posted
                </h3>

                <p>
                    Post your first job using the form above.
                </p>

            </div>

        `;

        return;
    }


    jobsContainer.innerHTML = "";


    jobs.forEach(
        job => {

            const skills =
                job.skills || "";


            const skillHTML =
                skills
                    .split(",")
                    .filter(
                        skill =>
                            skill.trim()
                    )
                    .map(
                        skill => `

                            <span class="skill-tag">
                                ${escapeHtml(
                                    skill.trim()
                                )}
                            </span>

                        `
                    )
                    .join("");


            jobsContainer.innerHTML += `

                <div class="job-card">

                    <div class="job-top">

                        <div class="company">

                            <h2>
                                ${escapeHtml(
                                    job.company ||
                                    "Company"
                                )}
                            </h2>

                            <h4>
                                ${escapeHtml(
                                    job.title ||
                                    "Job"
                                )}
                            </h4>

                        </div>


                        <div class="match-badge">

                            💼 Active

                        </div>

                    </div>


                    <div class="job-info">

                        <span>
                            📍
                            ${escapeHtml(
                                job.location ||
                                "Not specified"
                            )}
                        </span>

                        <span>
                            💰
                            ${escapeHtml(
                                job.salary ||
                                "Not specified"
                            )}
                        </span>

                        <span>
                            💼
                            ${escapeHtml(
                                job.job_type ||
                                "Full Time"
                            )}
                        </span>

                        <span>
                            ⭐
                            ${escapeHtml(
                                job.experience ||
                                "Fresher"
                            )}
                        </span>

                    </div>


                    <p class="job-description">

                        ${escapeHtml(
                            job.description ||
                            "No description available."
                        )}

                    </p>


                    <div class="skills">

                        ${skillHTML}

                    </div>


                    <div class="job-buttons">

                        <button
                            class="btn"
                            onclick="editJob(${job.id})"
                        >
                            ✏️ Edit
                        </button>


                        <button
                            class="btn"
                            onclick="deleteJob(${job.id})"
                        >
                            🗑️ Delete
                        </button>


                        <button
                            class="btn"
                            onclick="viewCandidates(${job.id})"
                        >
                            👥 Candidates
                        </button>

                    </div>

                </div>

            `;
        }
    );
}


// =====================================================
// RENDER APPLICATIONS / CANDIDATES
// =====================================================

function renderApplications(applications) {

    console.log(
        "🎨🎨🎨 RENDERING APPLICATIONS:",
        applications
    );


    const container =
        document.getElementById(
            "applicationsContainer"
        );


    if (!container) {

        console.error(
            "❌ applicationsContainer NOT FOUND"
        );

        return;
    }


    console.log(
        "✅ applicationsContainer FOUND"
    );


    // =================================================
    // VALIDATE ARRAY
    // =================================================

    if (!Array.isArray(applications)) {

        console.error(
            "❌ Applications is not an array:",
            applications
        );

        container.innerHTML = `

            <div class="empty-applications">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h2>
                    Unable to display applications
                </h2>

                <p>
                    Invalid application data received
                    from backend.
                </p>

            </div>

        `;

        return;
    }


    // =================================================
    // NO APPLICATIONS
    // =================================================

    if (applications.length === 0) {

        console.warn(
            "⚠️ ZERO APPLICATIONS TO DISPLAY"
        );


        container.innerHTML = `

            <div class="empty-applications">

                <div class="empty-icon">
                    👥
                </div>

                <h2>
                    No Applications Yet
                </h2>

                <p>
                    Candidates will appear here when
                    they apply for your jobs.
                </p>

            </div>

        `;

        return;
    }


    // =================================================
    // CLEAR CONTAINER
    // =================================================

    container.innerHTML = "";


    // =================================================
    // RENDER EACH APPLICATION
    // =================================================

    applications
        .slice()
        .reverse()
        .forEach(
            application => {

                console.log(
                    "🎨 DISPLAYING APPLICATION:",
                    application
                );


                const status =
                    normalizeStatus(
                        application.status
                    );


                const match =
                    Number(
                        application.match_percentage
                    ) || 0;


                const candidateName =
                    application.candidate_name ||
                    "Unknown Candidate";


                const candidateEmail =
                    application.candidate_email ||
                    "Email not available";


                const jobTitle =
                    application.job_title ||
                    "Job Application";


                const company =
                    application.company ||
                    "Company";


                const location =
                    application.location ||
                    "Not specified";


                const salary =
                    application.salary ||
                    "Not specified";


                const skills =
                    application.skills ||
                    "";


                const appliedAt =
                    application.applied_at
                        ? formatDate(
                            application.applied_at
                        )
                        : "Recently";


                const initials =
                    getInitials(
                        candidateName
                    );


                const statusClass =
                    getStatusClass(
                        status
                    );


                const statusLabel =
                    formatStatus(
                        status
                    );


                const statusIcon =
                    getStatusIcon(
                        status
                    );


                // =================================================
                // SKILLS HTML
                // =================================================

                let skillsHTML = "";


                if (skills.trim()) {

                    const skillPills =
                        skills
                            .split(",")
                            .filter(
                                skill =>
                                    skill.trim()
                            )
                            .map(
                                skill => `

                                    <span class="skill-pill">

                                        ${escapeHtml(
                                            skill.trim()
                                        )}

                                    </span>

                                `
                            )
                            .join("");


                    skillsHTML = `

                        <div class="candidate-skills">

                            <span class="skills-title">
                                🛠 Skills
                            </span>

                            ${skillPills}

                        </div>

                    `;
                }


                // =================================================
                // CANDIDATE CARD
                // =================================================

                container.innerHTML += `

                    <div
                        class="modern-candidate-card"
                        data-application-id="${application.id}"
                    >

                        <!-- =============================
                             HEADER
                        ============================== -->

                        <div class="candidate-card-header">

                            <div class="candidate-main">

                                <div
                                    class="candidate-avatar-modern"
                                >
                                    ${escapeHtml(
                                        initials
                                    )}
                                </div>


                                <div class="candidate-heading">

                                    <h2>
                                        ${escapeHtml(
                                            candidateName
                                        )}
                                    </h2>


                                    <p>
                                        ${escapeHtml(
                                            jobTitle
                                        )}
                                    </p>


                                    <span
                                        class="candidate-email"
                                    >
                                        ✉
                                        ${escapeHtml(
                                            candidateEmail
                                        )}
                                    </span>

                                </div>

                            </div>


                            <!-- AI MATCH -->

                            <div class="ai-match">

                                <div class="match-circle">

                                    ${match}%

                                </div>


                                <div>

                                    <strong>
                                        AI Match
                                    </strong>

                                    <small>
                                        Candidate compatibility
                                    </small>

                                </div>

                            </div>

                        </div>


                        <!-- =============================
                             INFORMATION
                        ============================== -->

                        <div class="candidate-info-row">

                            <div class="info-item">

                                <span class="info-icon">
                                    📍
                                </span>

                                <div>

                                    <small>
                                        Location
                                    </small>

                                    <strong>
                                        ${escapeHtml(
                                            location
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div class="info-item">

                                <span class="info-icon">
                                    💰
                                </span>

                                <div>

                                    <small>
                                        Salary
                                    </small>

                                    <strong>
                                        ${escapeHtml(
                                            salary
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div class="info-item">

                                <span class="info-icon">
                                    🏢
                                </span>

                                <div>

                                    <small>
                                        Company
                                    </small>

                                    <strong>
                                        ${escapeHtml(
                                            company
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div class="info-item">

                                <span class="info-icon">
                                    📅
                                </span>

                                <div>

                                    <small>
                                        Applied
                                    </small>

                                    <strong>
                                        ${escapeHtml(
                                            appliedAt
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        <!-- =============================
                             APPLICATION META
                        ============================== -->

                        <div class="application-meta">

                            <span>
                                Application #${application.id}
                            </span>


                            <span>
                                Job #${application.job_id}
                            </span>


                            <span
                                class="status-pill ${statusClass}"
                            >

                                ${statusIcon}

                                ${statusLabel}

                            </span>

                        </div>


                        <!-- =============================
                             SKILLS
                        ============================== -->

                        ${skillsHTML}


                        <!-- =============================
                             ACTIONS
                        ============================== -->

                        <div class="candidate-actions-modern">


                            <button
                                class="candidate-btn view-btn"
                                onclick="
                                    viewCandidateFromBackend(
                                        ${application.id}
                                    )
                                "
                            >

                                👁
                                <span>
                                    View Candidate
                                </span>

                            </button>


                            <button
                                class="candidate-btn shortlist-btn-modern"
                                onclick="
                                    updateApplicationStatus(
                                        ${application.id},
                                        'shortlisted'
                                    )
                                "
                            >

                                ⭐
                                <span>
                                    Shortlist
                                </span>

                            </button>


                            <button
                                class="candidate-btn reject-btn"
                                onclick="
                                    updateApplicationStatus(
                                        ${application.id},
                                        'rejected'
                                    )
                                "
                            >

                                ❌
                                <span>
                                    Reject
                                </span>

                            </button>


                            <button
                                class="candidate-btn select-btn"
                                onclick="
                                    updateApplicationStatus(
                                        ${application.id},
                                        'selected'
                                    )
                                "
                            >

                                🏆
                                <span>
                                    Select
                                </span>

                            </button>

                        </div>

                    </div>

                `;

            }
        );


    console.log(
        "✅ FINISHED RENDERING",
        applications.length,
        "APPLICATIONS"
    );
}


// =====================================================
// STATUS NORMALIZATION
// =====================================================

function normalizeStatus(status) {

    return String(
        status || "applied"
    )
        .trim()
        .toLowerCase();
}


// =====================================================
// FORMAT STATUS
// =====================================================

function formatStatus(status) {

    const names = {

        applied:
            "Applied",

        shortlisted:
            "Shortlisted",

        rejected:
            "Rejected",

        selected:
            "Selected"

    };


    return (
        names[normalizeStatus(status)] ||
        "Applied"
    );
}


// =====================================================
// STATUS ICON
// =====================================================

function getStatusIcon(status) {

    const icons = {

        applied:
            "📩",

        shortlisted:
            "⭐",

        rejected:
            "❌",

        selected:
            "🏆"

    };


    return (
        icons[normalizeStatus(status)] ||
        "📩"
    );
}


// =====================================================
// STATUS CLASS
// =====================================================

function getStatusClass(status) {

    return normalizeStatus(status)
        .replace(/\s+/g, "-");
}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(dateValue) {

    try {

        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(
                dateValue
            );
        }


        return date.toLocaleString();

    }

    catch (error) {

        return String(
            dateValue
        );
    }
}


// =====================================================
// GET INITIALS
// =====================================================

function getInitials(name) {

    const value =
        String(
            name || "Candidate"
        ).trim();


    const parts =
        value
            .split(/\s+/)
            .filter(Boolean);


    if (parts.length === 0) {

        return "C";
    }


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();
    }


    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// UPDATE APPLICATION STATUS
// =====================================================

async function updateApplicationStatus(
    applicationId,
    newStatus
) {

    const token =
        getToken();


    if (!token) {

        alert(
            "Please login as recruiter."
        );

        window.location.href =
            "/login";

        return;
    }


    const status =
        normalizeStatus(
            newStatus
        );


    if (
        ![
            "applied",
            "shortlisted",
            "rejected",
            "selected"
        ].includes(status)
    ) {

        alert(
            "Invalid application status."
        );

        return;
    }


    const confirmed =
        confirm(
            `Change application status to "${formatStatus(status)}"?`
        );


    if (!confirmed) {

        return;
    }


    try {

        console.log(
            "📤 UPDATING APPLICATION:",
            applicationId,
            "→",
            status
        );


        const response =
            await fetch(
                `${API_URL}/applications/${applicationId}/status`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token

                    },

                    body:
                        JSON.stringify({
                            status: status
                        })

                }
            );


        const rawText =
            await response.text();


        let data = {};


        try {

            data =
                JSON.parse(
                    rawText
                );

        }

        catch (error) {

            console.error(
                "Could not parse status response.",
                error
            );
        }


        console.log(
            "📥 STATUS UPDATE RESPONSE:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.detail ||
                `Status update failed (${response.status})`
            );
        }


        alert(
            `✅ Application status updated to "${formatStatus(status)}"`
        );


        // Reload everything from PostgreSQL
        await loadRecruiterJobs();

    }

    catch (error) {

        console.error(
            "❌ STATUS UPDATE ERROR:",
            error
        );


        alert(
            "❌ Unable to update application status.\n\n" +
            error.message
        );
    }
}


// =====================================================
// VIEW CANDIDATE
// =====================================================

async function viewCandidateFromBackend(
    applicationId
) {

    const token =
        getToken();


    if (!token) {

        alert(
            "Please login as recruiter."
        );

        return;
    }


    try {

        console.log(
            "👁 Loading candidate:",
            applicationId
        );


        const response =
            await fetch(
                `${API_URL}/applications/${applicationId}/candidate`,
                {

                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }

                }
            );


        const rawText =
            await response.text();


        let candidate = {};


        try {

            candidate =
                JSON.parse(
                    rawText
                );

        }

        catch (error) {

            console.error(
                "Candidate JSON parse error:",
                error
            );

            throw new Error(
                "Invalid candidate response from server."
            );
        }


        console.log(
            "👤 CANDIDATE RESPONSE:",
            candidate
        );


        if (!response.ok) {

            throw new Error(
                candidate.detail ||
                "Unable to load candidate."
            );
        }


        // =================================================
        // CANDIDATE DETAILS
        // =================================================

        const resumeText =
            candidate.resume_text ||
            "Resume text not available.";


        alert(

            "👤 CANDIDATE DETAILS\n\n" +

            "Name:\n" +
            (
                candidate.name ||
                "N/A"
            ) +

            "\n\nEmail:\n" +
            (
                candidate.email ||
                "N/A"
            ) +

            "\n\n💼 JOB\n\n" +

            "Position:\n" +
            (
                candidate.job_title ||
                "N/A"
            ) +

            "\n\nCompany:\n" +
            (
                candidate.company ||
                "N/A"
            ) +

            "\n\nLocation:\n" +
            (
                candidate.location ||
                "N/A"
            ) +

            "\n\n🎯 AI MATCH\n\n" +

            "Match:\n" +
            (
                candidate.match_percentage ||
                0
            ) +
            "%" +

            "\n\n📌 STATUS\n\n" +

            formatStatus(
                candidate.status
            ) +

            "\n\n📄 RESUME\n\n" +

            (
                resumeText.length > 500
                    ? resumeText.substring(0, 500) +
                      "\n\n[Resume text truncated]"
                    : resumeText
            )

        );

    }

    catch (error) {

        console.error(
            "❌ VIEW CANDIDATE ERROR:",
            error
        );


        alert(
            "❌ Unable to load candidate details.\n\n" +
            error.message
        );
    }
}


// =====================================================
// VIEW CANDIDATES PAGE
// =====================================================

function viewCandidates(jobId) {

    localStorage.setItem(
        "selectedRecruiterJob",
        String(jobId)
    );


    window.location.href =
        "/candidates";
}


// =====================================================
// EDIT JOB
// =====================================================

async function editJob(id) {

    const title =
        prompt(
            "Enter new job title:"
        );


    if (!title) {

        return;
    }


    const token =
        getToken();


    if (!token) {

        alert(
            "Please login as recruiter."
        );

        return;
    }


    try {

        // =================================================
        // GET EXISTING JOB
        // =================================================

        const response =
            await fetch(
                `${API_URL}/jobs/${id}`,
                {

                    method: "GET",

                    headers:
                        authHeaders()

                }
            );


        const job =
            await response.json();


        if (!response.ok) {

            alert(
                job.detail ||
                "Unable to load job."
            );

            return;
        }


        // =================================================
        // UPDATE ONLY TITLE
        // =================================================

        job.title =
            title.trim();


        const update =
            await fetch(
                `${API_URL}/jobs/${id}`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token

                    },

                    body:
                        JSON.stringify({

                            title:
                                job.title,

                            company:
                                job.company,

                            location:
                                job.location,

                            salary:
                                job.salary,

                            experience:
                                job.experience,

                            job_type:
                                job.job_type,

                            category:
                                job.category,

                            skills:
                                job.skills,

                            description:
                                job.description,

                            logo:
                                job.logo

                        })

                }
            );


        const data =
            await update.json()
                .catch(
                    () => ({})
                );


        if (!update.ok) {

            alert(
                data.detail ||
                "Unable to update job."
            );

            return;
        }


        alert(
            "✏️ Job Updated Successfully!"
        );


        await loadRecruiterJobs();

    }

    catch (error) {

        console.error(
            "❌ EDIT ERROR:",
            error
        );


        alert(
            "❌ Server connection failed.\n\n" +
            error.message
        );
    }
}


// =====================================================
// DELETE JOB
// =====================================================

async function deleteJob(id) {

    const confirmed =
        confirm(
            "Delete this job?"
        );


    if (!confirmed) {

        return;
    }


    const token =
        getToken();


    if (!token) {

        alert(
            "Please login as recruiter."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/jobs/${id}`,
                {

                    method: "DELETE",

                    headers:
                        authHeaders()

                }
            );


        const data =
            await response.json()
                .catch(
                    () => ({})
                );


        if (!response.ok) {

            alert(
                data.detail ||
                "Unable to delete job."
            );

            return;
        }


        alert(
            "🗑️ Job Deleted Successfully!"
        );


        await loadRecruiterJobs();

    }

    catch (error) {

        console.error(
            "❌ DELETE ERROR:",
            error
        );


        alert(
            "❌ Server connection failed.\n\n" +
            error.message
        );
    }
}


// =====================================================
// POST JOB
// =====================================================

const postJobBtn =
    document.getElementById(
        "postJobBtn"
    );


if (postJobBtn) {

    postJobBtn.addEventListener(
        "click",
        async function () {

            const job = {

                title:
                    document.getElementById(
                        "jobTitle"
                    )?.value.trim() || "",

                company:
                    document.getElementById(
                        "company"
                    )?.value.trim() || "",

                location:
                    document.getElementById(
                        "location"
                    )?.value.trim() || "",

                salary:
                    document.getElementById(
                        "salary"
                    )?.value.trim() || "",

                experience:
                    document.getElementById(
                        "experience"
                    )?.value.trim() || "",

                job_type:
                    document.getElementById(
                        "jobType"
                    )?.value || "",

                category:
                    document.getElementById(
                        "category"
                    )?.value.trim() || "",

                skills:
                    document.getElementById(
                        "skills"
                    )?.value.trim() || "",

                description:
                    document.getElementById(
                        "description"
                    )?.value.trim() || "",

                logo:
                    document.getElementById(
                        "logo"
                    )?.value.trim() || ""

            };


            // =================================================
            // VALIDATION
            // =================================================

            if (
                !job.title ||
                !job.company ||
                !job.location ||
                !job.skills ||
                !job.description
            ) {

                alert(
                    "Please fill the required fields."
                );

                return;
            }


            const token =
                getToken();


            if (!token) {

                alert(
                    "Please login as recruiter."
                );

                return;
            }


            try {

                console.log(
                    "📤 POSTING JOB:",
                    job
                );


                const response =
                    await fetch(
                        `${API_URL}/jobs`,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    "Bearer " + token

                            },

                            body:
                                JSON.stringify(job)

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "📥 POST JOB RESPONSE:",
                    data
                );


                if (!response.ok) {

                    alert(
                        data.detail ||
                        "Unable to post job."
                    );

                    return;
                }


                alert(
                    "✅ Job Posted Successfully!"
                );


                const postStatus =
                    document.getElementById(
                        "postStatus"
                    );


                if (postStatus) {

                    postStatus.innerText =
                        "✅ Job Posted Successfully!";
                }


                clearForm();


                await loadRecruiterJobs();

            }

            catch (error) {

                console.error(
                    "❌ POST JOB ERROR:",
                    error
                );


                alert(
                    "❌ Server connection failed.\n\n" +
                    error.message
                );
            }

        }
    );
}


// =====================================================
// CLEAR JOB FORM
// =====================================================

function clearForm() {

    const fields = [

        "jobTitle",
        "company",
        "location",
        "salary",
        "experience",
        "jobType",
        "category",
        "skills",
        "description",
        "logo"

    ];


    fields.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                if (
                    element.tagName ===
                    "SELECT"
                ) {

                    element.selectedIndex =
                        0;

                }

                else {

                    element.value =
                        "";

                }
            }

        }
    );
}


// =====================================================
// MAKE FUNCTIONS AVAILABLE TO HTML ONCLICK
// =====================================================

window.loadRecruiterJobs =
    loadRecruiterJobs;

window.loadRecruiterApplications =
    loadRecruiterApplications;

window.renderApplications =
    renderApplications;

window.updateApplicationStatus =
    updateApplicationStatus;

window.viewCandidateFromBackend =
    viewCandidateFromBackend;

window.viewCandidates =
    viewCandidates;

window.editJob =
    editJob;

window.deleteJob =
    deleteJob;


// =====================================================
// START
// =====================================================

console.log(
    "🚀 Starting recruiter dashboard..."
);


loadRecruiterJobs();