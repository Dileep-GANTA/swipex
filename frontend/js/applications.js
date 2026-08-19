// =====================================================
// SWIPEX - REAL APPLICATION TRACKING
// PostgreSQL → /applications/me
// =====================================================

const API_URL = window.API_BASE_URL;

const applicationsContainer =
    document.getElementById("applicationsContainer");

let applications = [];


// =====================================================
// LOAD APPLICATIONS FROM BACKEND
// =====================================================

async function loadApplications() {

    const token =
        localStorage.getItem("token");


    console.log(
        "🔐 Applications token exists:",
        !!token
    );


    if (!token) {

        alert(
            "Please login to view your applications."
        );

        window.location.href =
            "/login";

        return;

    }


    try {

        console.log(
            "📩 Loading REAL applications from backend..."
        );


        const response =
            await fetch(
                `${API_URL}/applications/me`,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            "Bearer " + token

                    }

                }
            );


        console.log(
            "📡 Applications response:",
            response.status
        );


        const data =
            await response.json();


        console.log(
            "📥 REAL APPLICATION DATA:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to load applications."
            );

        }


        applications =
            data || [];


        updateStats();


        renderApplications(
            applications
        );

    }

    catch (error) {

        console.error(
            "❌ Application loading error:",
            error
        );


        applicationsContainer.innerHTML = `

            <div class="empty-state">

                <h2>
                    ❌ Unable to load applications
                </h2>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


// =====================================================
// RENDER APPLICATIONS
// =====================================================

function renderApplications(list) {

    applicationsContainer.innerHTML = "";


    if (
        !list ||
        list.length === 0
    ) {

        applicationsContainer.innerHTML = `

            <div class="empty-state">

                <h2>
                    📭 No Applications Yet
                </h2>

                <p>
                    Jobs you apply for will appear here.
                </p>

                <br>

                <button
                    class="btn"
                    onclick="
                        window.location.href='/jobs-page'
                    ">

                    💼 Explore Jobs

                </button>

            </div>

        `;

        return;

    }


    list
        .slice()
        .reverse()
        .forEach(
            application => {

                const match =
                    Number(
                        application.match_percentage
                    ) || 0;


                const status =
                    normalizeStatus(
                        application.status
                    );


                const statusClass =
                    getStatusClass(
                        status
                    );


                const jobTitle =
                    application.job_title ||
                    "Job Position";


                const company =
                    application.company ||
                    "Company";


                const location =
                    application.location ||
                    "Location not specified";


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
                    : "Recently";


                applicationsContainer.innerHTML += `

                    <div
                        class="application-card"
                        data-application-id="${application.id}"
                    >


                        <!-- =========================
                             TOP
                        ========================== -->

                        <div class="application-top">


                            <div class="candidate-avatar">

                                ${
                                    company
                                        .charAt(0)
                                        .toUpperCase()
                                }

                            </div>


                            <div class="application-info">

                                <h2>

                                    ${jobTitle}

                                </h2>


                                <p>

                                    🏢 ${company}

                                </p>


                                <p>

                                    📍 ${location}

                                </p>

                            </div>


                            <div class="application-match">

                                🎯

                                <strong>

                                    ${match}%

                                </strong>

                                <small>

                                    AI Match

                                </small>

                            </div>


                        </div>


                        <!-- =========================
                             DETAILS
                        ========================== -->

                        <div class="application-details">


                            <span>

                                📅 Applied:

                                ${appliedAt}

                            </span>


                            <span>

                                💰 ${salary}

                            </span>


                            <span>

                                💼

                                ${
                                    skills ||
                                    "Skills not specified"
                                }

                            </span>


                        </div>


                        <!-- =========================
                             STATUS
                        ========================== -->

                        <div class="application-status">


                            <span class="status-label">

                                Status

                            </span>


                            <span
                                class="
                                    status-badge
                                    ${statusClass}
                                ">

                                ${getStatusIcon(status)}

                                ${formatStatus(status)}

                            </span>


                        </div>


                        <!-- =========================
                             PROGRESS
                        ========================== -->

                        <div class="application-progress">


                            <div
                                class="
                                    progress-step
                                    completed
                                ">

                                <div class="step-dot">

                                    ✓

                                </div>

                                <small>

                                    Applied

                                </small>

                            </div>


                            <div
                                class="
                                    progress-line
                                    ${getProgressClass(status, 2)}
                                ">
                            </div>


                            <div
                                class="
                                    progress-step
                                    ${getProgressClass(status, 2)}
                                ">

                                <div class="step-dot">

                                    ✓

                                </div>

                                <small>

                                    Review

                                </small>

                            </div>


                            <div
                                class="
                                    progress-line
                                    ${getProgressClass(status, 3)}
                                ">
                            </div>


                            <div
                                class="
                                    progress-step
                                    ${getProgressClass(status, 3)}
                                ">

                                <div class="step-dot">

                                    ✓

                                </div>

                                <small>

                                    Interview

                                </small>

                            </div>


                            <div
                                class="
                                    progress-line
                                    ${getProgressClass(status, 4)}
                                ">
                            </div>


                            <div
                                class="
                                    progress-step
                                    ${getProgressClass(status, 4)}
                                ">

                                <div class="step-dot">

                                    ✓

                                </div>

                                <small>

                                    Selected

                                </small>

                            </div>


                        </div>


                        <!-- =========================
                             ACTIONS
                        ========================== -->

                        <div
                            class="application-actions"
                        >

                            <button
                                class="btn"
                                onclick="
                                    viewApplication(
                                        ${application.id}
                                    )
                                ">

                                👁 View Details

                            </button>

                        </div>


                    </div>

                `;

            }
        );

}


// =====================================================
// NORMALIZE STATUS
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


    return names[status] ||
        "Applied";

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


    return icons[status] ||
        "📩";

}


// =====================================================
// STATUS CLASS
// =====================================================

function getStatusClass(status) {

    return String(
        status || "applied"
    )
        .toLowerCase()
        .replaceAll(
            " ",
            "-"
        );

}


// =====================================================
// PROGRESS
// =====================================================

function getProgressClass(
    status,
    step
) {

    const levels = {

        applied:
            1,

        shortlisted:
            2,

        rejected:
            2,

        selected:
            4

    };


    const level =
        levels[status] || 1;


    return step <= level
        ? "completed"
        : "";

}


// =====================================================
// STATISTICS
// =====================================================

function updateStats() {

    const total =
        applications.length;


    const applied =
        applications.filter(
            app =>
                normalizeStatus(
                    app.status
                ) === "applied"
        ).length;


    const shortlisted =
        applications.filter(
            app =>
                normalizeStatus(
                    app.status
                ) === "shortlisted"
        ).length;


    const selected =
        applications.filter(
            app =>
                normalizeStatus(
                    app.status
                ) === "selected"
        ).length;


    // =================================================
    // TOTAL APPLICATIONS
    // =================================================

    const applicationCount =
        document.getElementById(
            "applicationCount"
        );


    if (applicationCount) {

        applicationCount.innerText =
            total;

    }


    // =================================================
    // SHORTLISTED
    // =================================================

    const shortlistedCount =
        document.getElementById(
            "shortlistedCount"
        );


    if (shortlistedCount) {

        shortlistedCount.innerText =
            shortlisted;

    }


    // =================================================
    // INTERVIEWS
    // =================================================

    const interviewCount =
        document.getElementById(
            "interviewCount"
        );


    if (interviewCount) {

        interviewCount.innerText =
            0;

    }


    // =================================================
    // SELECTED
    // =================================================

    const selectedCount =
        document.getElementById(
            "selectedCount"
        );


    if (selectedCount) {

        selectedCount.innerText =
            selected;

    }


    // =================================================
    // MATCH ANALYTICS
    // =================================================

    const matches =
        applications
            .map(
                app =>
                    Number(
                        app.match_percentage
                    ) || 0
            )
            .filter(
                match =>
                    match > 0
            );


    const averageMatch =
        document.getElementById(
            "averageMatch"
        );


    const highestMatch =
        document.getElementById(
            "highestMatch"
        );


    if (matches.length > 0) {

        const totalMatch =
            matches.reduce(
                (sum, value) =>
                    sum + value,
                0
            );


        const average =
            Math.round(
                totalMatch /
                matches.length
            );


        const highest =
            Math.max(
                ...matches
            );


        if (averageMatch) {

            averageMatch.innerText =
                average + "%";

        }


        if (highestMatch) {

            highestMatch.innerText =
                highest + "%";

        }

    }

    else {

        if (averageMatch) {

            averageMatch.innerText =
                "0%";

        }


        if (highestMatch) {

            highestMatch.innerText =
                "0%";

        }

    }


    // =================================================
    // SUCCESS RATE
    // =================================================

    const successRate =
        document.getElementById(
            "successRate"
        );


    if (successRate) {

        const successful =
            shortlisted +
            selected;


        const rate =
            total > 0

                ? Math.round(
                    (
                        successful /
                        total
                    ) * 100
                )

                : 0;


        successRate.innerText =
            rate + "%";

    }

}


// =====================================================
// VIEW APPLICATION
// =====================================================

function viewApplication(
    applicationId
) {

    const application =
        applications.find(
            app =>
                Number(app.id) ===
                Number(applicationId)
        );


    if (!application) {

        return;

    }


    alert(

        "📋 APPLICATION DETAILS\n\n" +

        "💼 Job: " +
        (
            application.job_title ||
            "N/A"
        ) +

        "\n🏢 Company: " +
        (
            application.company ||
            "N/A"
        ) +

        "\n📍 Location: " +
        (
            application.location ||
            "N/A"
        ) +

        "\n🎯 AI Match: " +
        (
            application.match_percentage ||
            0
        ) +
        "%" +

        "\n📩 Status: " +
        formatStatus(
            application.status
        ) +

        "\n📅 Applied: " +
        (
            application.applied_at ||
            "N/A"
        )

    );

}


// =====================================================
// SEARCH
// =====================================================

const searchInput =
    document.getElementById(
        "searchApplications"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            const search =
                searchInput.value
                    .toLowerCase()
                    .trim();


            const filtered =
                applications.filter(
                    application => {

                        const title =
                            (
                                application.job_title ||
                                ""
                            )
                                .toLowerCase();


                        const company =
                            (
                                application.company ||
                                ""
                            )
                                .toLowerCase();


                        return (

                            title.includes(
                                search
                            )

                            ||

                            company.includes(
                                search
                            )

                        );

                    }
                );


            renderApplications(
                filtered
            );

        }
    );

}


// =====================================================
// START
// =====================================================

loadApplications();