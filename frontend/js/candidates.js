// =====================================================
// SWIPEX - REAL RECRUITER CANDIDATE MANAGEMENT
// PostgreSQL -> /applications/recruiter
// =====================================================

const API_URL = window.API_BASE_URL;
const container =
    document.getElementById("candidateContainer");

let candidates = [];


// =====================================================
// LOAD REAL CANDIDATES
// =====================================================

async function loadCandidates() {

    const token =
        localStorage.getItem("token");


    console.log(
        "🔐 Recruiter token exists:",
        !!token
    );


    if (!token) {

        alert(
            "Please login as a recruiter."
        );

        window.location.href =
            "/login";

        return;

    }


    try {

        console.log(
            "👥 Loading REAL candidates from backend..."
        );


        const response =
            await fetch(
                `${API_URL}/applications/recruiter`,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            "Bearer " + token

                    }

                }
            );


        console.log(
            "📡 Candidates response:",
            response.status
        );


        const data =
            await response.json();


        console.log(
            "📥 REAL CANDIDATES:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to load candidates."
            );

        }


        candidates =
            data || [];


        displayCandidates();

    }

    catch (error) {

        console.error(
            "❌ Candidate loading error:",
            error
        );


        container.innerHTML = `

            <div style="
                text-align:center;
                padding:40px;
            ">

                <h2>
                    ❌ Unable to load candidates
                </h2>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


// =====================================================
// DISPLAY CANDIDATES
// =====================================================

function displayCandidates() {

    let list =
        [...candidates];


    // =================================================
    // SORT
    // =================================================

    const sortElement =
        document.getElementById(
            "sortCandidates"
        );


    const sort =
        sortElement
            ? sortElement.value
            : "match";


    if (sort === "match") {

        list.sort(
            (a, b) =>
                (
                    Number(
                        b.match_percentage
                    ) || 0
                ) -
                (
                    Number(
                        a.match_percentage
                    ) || 0
                )
        );

    }


    if (sort === "name") {

        list.sort(
            (a, b) =>
                (
                    a.candidate_name ||
                    ""
                ).localeCompare(
                    b.candidate_name ||
                    ""
                )
        );

    }


    // =================================================
    // EMPTY STATE
    // =================================================

    if (list.length === 0) {

        container.innerHTML = `

            <div style="
                text-align:center;
                padding:40px;
            ">

                <h2>
                    👥 No Candidates Yet
                </h2>

                <p>
                    Candidates will appear here
                    after they apply for your jobs.
                </p>

            </div>

        `;


        updateStats([]);


        return;

    }


    // =================================================
    // CLEAR
    // =================================================

    container.innerHTML = "";


    // =================================================
    // DISPLAY
    // =================================================

    list.forEach(
        application => {

            const applicationId =
                application.id;


            const candidateName =
                application.candidate_name ||
                "Unknown Candidate";


            const email =
                application.candidate_email ||
                "Email not available";


            const match =
                Number(
                    application.match_percentage
                ) || 0;


            const status =
                normalizeStatus(
                    application.status
                );


            const jobTitle =
                application.job_title ||
                "Job Application";


            const company =
                application.company ||
                "Company";


            const location =
                application.location ||
                "Location not available";


            const salary =
                application.salary ||
                "Not specified";


            const skills =
                application.skills ||
                "";


            const appliedAt =
                application.applied_at
                    ? new Date(
                        application.applied_at
                    ).toLocaleString()
                    : "Date unavailable";


            const skillsArray =
                skills
                    .split(",")
                    .map(
                        skill =>
                            skill.trim()
                    )
                    .filter(Boolean);


            const skillHTML =
                skillsArray.length

                    ?

                skillsArray
                    .map(
                        skill => `

                            <span class="skill-tag">

                                ${skill}

                            </span>

                        `
                    )
                    .join("")

                    :

                `

                    <span class="skill-tag">

                        Skills not provided

                    </span>

                `;


            // =================================================
            // STATUS BUTTONS
            // =================================================

            const shortlistText =
                status === "shortlisted"

                    ? "⭐ Shortlisted"

                    : "☆ Shortlist";


            // =================================================
            // CANDIDATE CARD
            // =================================================

            container.innerHTML += `

                <div class="candidate-card">


                    <!-- ===============================
                         TOP
                    ================================ -->

                    <div class="candidate-top">


                        <div class="candidate-avatar">

                            ${
                                candidateName
                                    .charAt(0)
                                    .toUpperCase()
                            }

                        </div>


                        <div class="candidate-info">

                            <h2>

                                ${candidateName}

                            </h2>


                            <p>

                                📧 ${email}

                            </p>


                            <p>

                                📍 ${location}

                            </p>


                            <p>

                                💼 ${jobTitle}

                            </p>

                        </div>


                        <div class="candidate-match">

                            🎯

                            <strong>

                                ${match}%

                            </strong>


                            <small>

                                AI Match

                            </small>

                        </div>

                    </div>


                    <!-- ===============================
                         DETAILS
                    ================================ -->

                    <div class="candidate-details">


                        <p>

                            🏢 ${company}

                        </p>


                        <p>

                            💰 ${salary}

                        </p>


                        <p>

                            📩

                            ${getStatusIcon(status)}

                            ${formatStatus(status)}

                        </p>


                        <p>

                            🕒 ${appliedAt}

                        </p>

                    </div>


                    <!-- ===============================
                         SKILLS
                    ================================ -->

                    <div class="skills">

                        ${skillHTML}

                    </div>


                    <!-- ===============================
                         ACTIONS
                    ================================ -->

                    <div class="candidate-actions">


                        <button
                            class="btn"
                            onclick="
                                viewCandidate(
                                    ${applicationId}
                                )
                            ">

                            👁️ View Profile

                        </button>


                        <button
                            class="btn shortlist-btn"
                            onclick="
                                toggleShortlist(
                                    ${applicationId}
                                )
                            ">

                            ${shortlistText}

                        </button>


                        <button
                            class="btn"
                            onclick="
                                rejectCandidate(
                                    ${applicationId}
                                )
                            ">

                            ❌ Reject

                        </button>


                    </div>

                </div>

            `;

        }
    );


    updateStats(list);

}


// =====================================================
// UPDATE STATS
// =====================================================

function updateStats(list) {

    const candidateCount =
        document.getElementById(
            "candidateCount"
        );


    if (candidateCount) {

        candidateCount.innerText =
            list.length;

    }


    // =================================================
    // TOP MATCH
    // =================================================

    let highest =
        0;


    list.forEach(
        application => {

            const match =
                Number(
                    application.match_percentage
                ) || 0;


            if (match > highest) {

                highest =
                    match;

            }

        }
    );


    const topMatch =
        document.getElementById(
            "topMatch"
        );


    if (topMatch) {

        topMatch.innerText =
            highest + "%";

    }


    // =================================================
    // SHORTLISTED
    // =================================================

    const shortlisted =
        list.filter(
            application =>
                normalizeStatus(
                    application.status
                ) ===
                "shortlisted"
        ).length;


    const shortlistCount =
        document.getElementById(
            "shortlistCount"
        );


    if (shortlistCount) {

        shortlistCount.innerText =
            shortlisted;

    }

}


// =====================================================
// VIEW CANDIDATE
// =====================================================

function viewCandidate(
    applicationId
) {

    const candidate =
        candidates.find(
            application =>
                Number(
                    application.id
                ) ===
                Number(
                    applicationId
                )
        );


    if (!candidate) {

        alert(
            "Candidate not found."
        );

        return;

    }


    alert(

        "👤 CANDIDATE PROFILE\n\n" +

        "Name: " +
        (
            candidate.candidate_name ||
            "N/A"
        ) +

        "\nEmail: " +
        (
            candidate.candidate_email ||
            "N/A"
        ) +

        "\n\n💼 Job: " +
        (
            candidate.job_title ||
            "N/A"
        ) +

        "\n🏢 Company: " +
        (
            candidate.company ||
            "N/A"
        ) +

        "\n📍 Location: " +
        (
            candidate.location ||
            "N/A"
        ) +

        "\n\n🎯 AI MATCH: " +
        (
            candidate.match_percentage ||
            0
        ) +

        "%" +

        "\n\n🛠️ SKILLS:\n" +
        (
            candidate.skills ||
            "Not provided"
        ) +

        "\n\n📩 STATUS: " +
        formatStatus(
            candidate.status
        )

    );

}


// =====================================================
// SHORTLIST
// =====================================================

async function toggleShortlist(
    applicationId
) {

    const candidate =
        candidates.find(
            application =>
                Number(
                    application.id
                ) ===
                Number(
                    applicationId
                )
        );


    if (!candidate) {

        return;

    }


    const currentStatus =
        normalizeStatus(
            candidate.status
        );


    // =================================================
    // REMOVE SHORTLIST
    // =================================================

    if (
        currentStatus ===
        "shortlisted"
    ) {

        await updateApplicationStatus(
            applicationId,
            "applied"
        );

        return;

    }


    // =================================================
    // ADD SHORTLIST
    // =================================================

    await updateApplicationStatus(
        applicationId,
        "shortlisted"
    );

}


// =====================================================
// REJECT
// =====================================================

async function rejectCandidate(
    applicationId
) {

    const candidate =
        candidates.find(
            application =>
                Number(
                    application.id
                ) ===
                Number(
                    applicationId
                )
        );


    if (!candidate) {

        return;

    }


    const candidateName =
        candidate.candidate_name ||
        "this candidate";


    const confirmReject =
        confirm(
            `Reject ${candidateName}?`
        );


    if (!confirmReject) {

        return;

    }


    await updateApplicationStatus(
        applicationId,
        "rejected"
    );

}


// =====================================================
// UPDATE APPLICATION STATUS
// =====================================================

async function updateApplicationStatus(
    applicationId,
    status
) {

    const token =
        localStorage.getItem("token");


    if (!token) {

        alert(
            "Your login session has expired."
        );

        window.location.href =
            "/login";

        return;

    }


    try {

        console.log(
            "📤 Updating application:",
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

                    body: JSON.stringify({

                        status:
                            status

                    })

                }
            );


        const data =
            await response.json();


        console.log(
            "📥 Status response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to update application status."
            );

        }


        alert(
            status === "shortlisted"

                ? "⭐ Candidate Shortlisted!"

                : status === "rejected"

                    ? "❌ Candidate Rejected."

                    : "Application status updated."
        );


        // Reload real database data

        await loadCandidates();

    }

    catch (error) {

        console.error(
            "❌ Status update error:",
            error
        );


        alert(
            "Unable to update candidate status.\n\n" +
            error.message
        );

    }

}


// =====================================================
// STATUS HELPERS
// =====================================================

function normalizeStatus(status) {

    return String(
        status || "applied"
    )
        .trim()
        .toLowerCase();

}


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


    return names[
        normalizeStatus(status)
    ] || "Applied";

}


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


    return icons[
        normalizeStatus(status)
    ] || "📩";

}


// =====================================================
// SORT
// =====================================================

const sortElement =
    document.getElementById(
        "sortCandidates"
    );


if (sortElement) {

    sortElement.addEventListener(
        "change",
        displayCandidates
    );

}


// =====================================================
// START
// =====================================================

loadCandidates();