// =====================================================
// SWIPEX
// JOB SEEKER - MY APPLICATIONS
// =====================================================


// =====================================================
// ELEMENTS
// =====================================================

const applicationsContainer =
    document.getElementById("applicationsContainer");

const searchInput =
    document.getElementById("searchApplications");

const statusFilter =
    document.getElementById("statusFilter");


// =====================================================
// APPLICATION DATA
// =====================================================

let applications = [];


// =====================================================
// STATUS DEFINITIONS
// =====================================================

const statuses = {

    Applied: {
        icon: "📩",
        className: "status-applied"
    },

    Shortlisted: {
        icon: "⭐",
        className: "status-shortlisted"
    },

    Rejected: {
        icon: "❌",
        className: "status-rejected"
    },

    Selected: {
        icon: "🏆",
        className: "status-selected"
    }

};


// =====================================================
// SAFE TEXT
// =====================================================

function safeText(value, fallback = "") {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return fallback;

    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================================
// LOAD APPLICATIONS
// =====================================================

function loadApplications() {

    try {

        const saved =
            localStorage.getItem("appliedJobs");

        if (!saved) {

            applications = [];

            return;

        }


        const parsed =
            JSON.parse(saved);


        if (Array.isArray(parsed)) {

            applications = parsed;

        } else {

            applications = [];

        }

    } catch (error) {

        console.error(
            "Error loading applications:",
            error
        );

        applications = [];

    }

}


// =====================================================
// GET STATUS
// =====================================================

function getStatus(application) {

    const status =
        application.status ||
        "Applied";


    if (statuses[status]) {

        return status;

    }


    return "Applied";

}


// =====================================================
// GET JOB TITLE
// =====================================================

function getJobTitle(application) {

    return (
        application.title ||
        application.job_title ||
        application.jobTitle ||
        "Job Position"
    );

}


// =====================================================
// GET COMPANY
// =====================================================

function getCompany(application) {

    return (
        application.company ||
        application.company_name ||
        application.companyName ||
        "Company"
    );

}


// =====================================================
// GET LOCATION
// =====================================================

function getLocation(application) {

    return (
        application.location ||
        application.job_location ||
        "Location not specified"
    );

}


// =====================================================
// GET SALARY
// =====================================================

function getSalary(application) {

    return (
        application.salary ||
        application.package ||
        "Not specified"
    );

}


// =====================================================
// GET JOB TYPE
// =====================================================

function getJobType(application) {

    return (
        application.job_type ||
        application.jobType ||
        "Full Time"
    );

}


// =====================================================
// GET APPLIED DATE
// =====================================================

function getAppliedDate(application) {

    const date =
        application.appliedAt ||
        application.applied_at ||
        application.created_at;


    if (!date) {

        return "Recently";

    }


    try {

        const parsedDate =
            new Date(date);


        if (!isNaN(parsedDate.getTime())) {

            return parsedDate.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

        }

    } catch (error) {

        console.log(
            "Date formatting error:",
            error
        );

    }


    return String(date);

}


// =====================================================
// GET AI MATCH
// =====================================================

function getMatchPercentage(application) {

    const possibleValues = [

        application.match_percentage,
        application.matchPercentage,
        application.ai_match,
        application.aiMatch,
        application.match_score,
        application.matchScore

    ];


    for (
        const value of possibleValues
    ) {

        if (
            value !== null &&
            value !== undefined &&
            value !== ""
        ) {

            const number =
                Number(
                    String(value)
                        .replace("%", "")
                        .trim()
                );


            if (
                !isNaN(number) &&
                number >= 0
            ) {

                return Math.min(
                    Math.round(number),
                    100
                );

            }

        }

    }


    return 0;

}


// =====================================================
// UPDATE STATISTICS
// =====================================================

function updateStatistics() {

    const total =
        applications.length;


    const shortlisted =
        applications.filter(
            application =>
                getStatus(application) ===
                "Shortlisted"
        ).length;


    const rejected =
        applications.filter(
            application =>
                getStatus(application) ===
                "Rejected"
        ).length;


    const selected =
        applications.filter(
            application =>
                getStatus(application) ===
                "Selected"
        ).length;


    document.getElementById(
        "totalApplications"
    ).innerText = total;


    document.getElementById(
        "shortlistedApplications"
    ).innerText = shortlisted;


    document.getElementById(
        "rejectedApplications"
    ).innerText = rejected;


    document.getElementById(
        "selectedApplications"
    ).innerText = selected;

}


// =====================================================
// FILTER APPLICATIONS
// =====================================================

function getFilteredApplications() {

    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "all";


    return applications.filter(
        application => {

            const title =
                getJobTitle(application)
                    .toLowerCase();


            const company =
                getCompany(application)
                    .toLowerCase();


            const matchesSearch =
                !search ||
                title.includes(search) ||
                company.includes(search);


            const matchesStatus =
                selectedStatus === "all" ||
                getStatus(application) ===
                selectedStatus;


            return (
                matchesSearch &&
                matchesStatus
            );

        }
    );

}


// =====================================================
// DISPLAY APPLICATIONS
// =====================================================

function displayApplications() {

    loadApplications();

    updateStatistics();


    const filteredApplications =
        getFilteredApplications();


    if (
        filteredApplications.length === 0
    ) {

        applicationsContainer.innerHTML = `

            <div class="empty-state">

                <h2>
                    📭 No Applications Found
                </h2>

                <p>
                    ${
                        applications.length === 0
                            ? "You haven't applied for any jobs yet."
                            : "No applications match your current filter."
                    }
                </p>

                <button
                    class="explore-button"
                    onclick="
                        window.location.href='/jobs-page'
                    "
                >
                    💼 Explore Jobs
                </button>

            </div>

        `;

        return;

    }


    applicationsContainer.innerHTML = "";


    /*
        Latest applications first
    */

    filteredApplications
        .slice()
        .reverse()
        .forEach(
            application => {

                renderApplication(
                    application
                );

            }
        );

}


// =====================================================
// RENDER APPLICATION
// =====================================================

function renderApplication(
    application
) {

    const status =
        getStatus(application);


    const statusInfo =
        statuses[status];


    const company =
        safeText(
            getCompany(application),
            "Company"
        );


    const title =
        safeText(
            getJobTitle(application),
            "Job Position"
        );


    const location =
        safeText(
            getLocation(application),
            "Location not specified"
        );


    const salary =
        safeText(
            getSalary(application),
            "Not specified"
        );


    const jobType =
        safeText(
            getJobType(application),
            "Full Time"
        );


    const appliedDate =
        safeText(
            getAppliedDate(application),
            "Recently"
        );


    const match =
        getMatchPercentage(application);


    const applicationId =
        Number(application.id);


    const firstLetter =
        getCompany(application)
            .charAt(0)
            .toUpperCase();


    applicationsContainer.innerHTML += `

        <div class="application-card">

            <!-- =================================
                 TOP
            ================================== -->

            <div class="application-top">


                <!-- COMPANY AVATAR -->

                <div class="company-avatar">

                    ${safeText(firstLetter, "C")}

                </div>


                <!-- JOB INFORMATION -->

                <div class="application-info">

                    <h2>
                        ${title}
                    </h2>


                    <p>
                        🏢
                        <strong>
                            ${company}
                        </strong>
                    </p>


                    <p>
                        📍
                        ${location}
                    </p>


                    <p>
                        📅
                        Applied:
                        ${appliedDate}
                    </p>

                </div>


                <!-- AI MATCH -->

                <div class="application-match">

                    <span class="match-icon">
                        🎯
                    </span>

                    <strong>
                        ${match}%
                    </strong>

                    <small>
                        AI Match
                    </small>

                </div>

            </div>


            <!-- =================================
                 JOB DETAILS
            ================================== -->

            <div class="application-details">

                <div class="detail-item">
                    💼 ${jobType}
                </div>

                <div class="detail-item">
                    💰 ${salary}
                </div>

            </div>


            <!-- =================================
                 STATUS
            ================================== -->

            <div class="application-status">

                <strong>
                    Current Status:
                </strong>

                <span
                    class="status-badge ${statusInfo.className}"
                >

                    ${statusInfo.icon}

                    ${status}

                </span>

            </div>


            <!-- =================================
                 TIMELINE
            ================================== -->

            <div class="application-timeline">

                <div class="timeline">


                    ${timelineStep(
                        "📩",
                        "Applied",
                        true
                    )}


                    ${timelineLine(
                        status,
                        "Applied"
                    )}


                    ${timelineStep(
                        "⭐",
                        "Shortlisted",
                        isStatusReached(
                            status,
                            "Shortlisted"
                        )
                    )}


                    ${timelineLine(
                        status,
                        "Shortlisted"
                    )}


                    ${timelineStep(
                        "❌",
                        "Rejected",
                        status === "Rejected"
                    )}


                    ${timelineStep(
                        "🏆",
                        "Selected",
                        status === "Selected"
                    )}

                </div>

            </div>


            <!-- =================================
                 ACTIONS
            ================================== -->

            <div class="application-actions">

                <button
                    class="application-action"
                    onclick="
                        viewApplication(${applicationId})
                    "
                >
                    👁 View Details
                </button>


                <button
                    class="application-action remove"
                    onclick="
                        removeApplication(${applicationId})
                    "
                >
                    🗑 Remove
                </button>

            </div>

        </div>

    `;

}


// =====================================================
// TIMELINE STEP
// =====================================================

function timelineStep(
    icon,
    label,
    active
) {

    return `

        <div
            class="timeline-step"
            style="
                opacity:${active ? "1" : "0.4"};
            "
        >

            <div class="timeline-icon">
                ${icon}
            </div>

            <small>
                ${label}
            </small>

        </div>

    `;

}


// =====================================================
// TIMELINE LINE
// =====================================================

function timelineLine(
    status,
    step
) {

    let active = false;


    if (
        status === "Shortlisted" &&
        step === "Applied"
    ) {

        active = true;

    }


    if (
        status === "Selected"
    ) {

        active = true;

    }


    return `

        <div
            class="
                timeline-line
                ${active ? "active" : ""}
            "
        ></div>

    `;

}


// =====================================================
// STATUS ORDER
// =====================================================

function isStatusReached(
    currentStatus,
    targetStatus
) {

    const order = {

        Applied: 1,

        Shortlisted: 2,

        Rejected: 2,

        Selected: 3

    };


    return (
        (order[currentStatus] || 1) >=
        (order[targetStatus] || 1)
    );

}


// =====================================================
// VIEW APPLICATION
// =====================================================

function viewApplication(id) {

    const application =
        applications.find(
            app =>
                Number(app.id) ===
                Number(id)
        );


    if (!application) {

        alert(
            "Application details could not be found."
        );

        return;

    }


    const title =
        getJobTitle(application);


    const company =
        getCompany(application);


    const location =
        getLocation(application);


    const status =
        getStatus(application);


    const match =
        getMatchPercentage(application);


    const appliedDate =
        getAppliedDate(application);


    alert(

        "📋 APPLICATION DETAILS\n\n" +

        "💼 Job: " +
        title +

        "\n\n🏢 Company: " +
        company +

        "\n\n📍 Location: " +
        location +

        "\n\n🎯 AI Match: " +
        match +
        "%" +

        "\n\n📩 Status: " +
        status +

        "\n\n📅 Applied: " +
        appliedDate

    );

}


// =====================================================
// REMOVE APPLICATION
// =====================================================

function removeApplication(id) {

    const confirmed =
        confirm(
            "Are you sure you want to remove this application?"
        );


    if (!confirmed) {

        return;

    }


    applications =
        applications.filter(
            application =>
                Number(application.id) !==
                Number(id)
        );


    localStorage.setItem(
        "appliedJobs",
        JSON.stringify(
            applications
        )
    );


    displayApplications();

}


// =====================================================
// SEARCH
// =====================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        displayApplications
    );

}


// =====================================================
// STATUS FILTER
// =====================================================

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        displayApplications
    );

}


// =====================================================
// START
// =====================================================

displayApplications();