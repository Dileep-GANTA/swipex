const API_URL = window.API_BASE_URL;

const jobCard = document.getElementById("jobCard");

let jobs = [];
let filteredJobs = [];
let currentIndex = 0;


// =====================================================
// LOAD JOBS + AI MATCH
// =====================================================

async function loadJobs() {

    try {

        const jobsResponse =
            await fetch(`${API_URL}/jobs`);

        if (!jobsResponse.ok) {

            throw new Error(
                "Unable to load jobs"
            );

        }

        jobs =
            await jobsResponse.json();


        const resume =
            localStorage.getItem("resume_text");


        // =================================================
        // AI MATCH
        // =================================================

        if (resume) {

            try {

                const matchResponse =
                    await fetch(
                        `${API_URL}/match-job`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                resume_text:
                                    resume
                            })
                        }
                    );


                if (matchResponse.ok) {

                    const matchData =
                        await matchResponse.json();


                    const recommendations =
                        matchData.recommendations || [];


                    jobs =
                        jobs.map(job => {

                            const recommendation =
                                recommendations.find(
                                    item =>
                                        Number(item.id) ===
                                        Number(job.id)
                                );


                            return {

                                ...job,

                                match_percentage:
                                    recommendation
                                        ? Number(
                                            recommendation.match_percentage
                                        ) || 0
                                        : 0,

                                matched_skills:
                                    recommendation
                                        ? recommendation.matched_skills || []
                                        : []

                            };

                        });

                }

            }

            catch (matchError) {

                console.error(
                    "AI Match Error:",
                    matchError
                );


                jobs =
                    jobs.map(job => ({

                        ...job,

                        match_percentage: 0,

                        matched_skills: []

                    }));

            }

        }

        else {

            jobs =
                jobs.map(job => ({

                    ...job,

                    match_percentage: 0,

                    matched_skills: []

                }));

        }


        // =================================================
        // SORT BY AI MATCH
        // =================================================

        jobs.sort(
            (a, b) =>
                (b.match_percentage || 0) -
                (a.match_percentage || 0)
        );


        filteredJobs =
            [...jobs];


        currentIndex = 0;


        showJob();

    }

    catch (error) {

        console.error(
            "Load Jobs Error:",
            error
        );


        if (jobCard) {

            jobCard.innerHTML = `

                <h2>
                    ❌ Unable to load jobs
                </h2>

                <p>
                    Make sure FastAPI is running.
                </p>

            `;

        }

    }

}


// =====================================================
// SHOW JOB
// =====================================================

function showJob() {

    if (!jobCard) {

        return;

    }


    if (filteredJobs.length === 0) {

        jobCard.innerHTML = `

            <h2>
                😔 No Jobs Found
            </h2>

        `;

        return;

    }


    if (currentIndex >= filteredJobs.length) {

        jobCard.innerHTML = `

            <h2>
                🎉 No More Jobs
            </h2>

        `;

        return;

    }


    const job =
        filteredJobs[currentIndex];


    const match =
        Number(
            job.match_percentage
        ) || 0;


    // =================================================
    // JOB CARD
    // =================================================

    jobCard.innerHTML = `

        <div class="job-card">

            <div class="featured-ribbon">

                ⭐ Featured

            </div>


            <div class="job-top">

                <div class="company">

                    <h2>
                        ${job.company || "Company"}
                    </h2>

                    <h4>
                        ${job.title || "Job"}
                    </h4>

                </div>


                <div class="match-badge">

                    🎯 ${match}% Match

                </div>

            </div>


            <div class="job-info">

                <span>
                    📍 ${job.location || "Not specified"}
                </span>

                <span>
                    💰 ${job.salary || "Not specified"}
                </span>

                <span>
                    💼 ${job.job_type || "Full Time"}
                </span>

                <span>
                    ⭐ ${job.experience || "Fresher"}
                </span>

            </div>


            <p class="job-description">

                ${job.description || "No description available."}

            </p>


            <div class="skills">

                ${(job.skills || "")
                    .split(",")
                    .filter(
                        skill =>
                            skill.trim()
                    )
                    .map(
                        skill => `

                            <span class="skill-tag">

                                ${skill.trim()}

                            </span>

                        `
                    )
                    .join("")
                }

            </div>


            ${
                job.matched_skills &&
                job.matched_skills.length > 0

                ?

                `

                    <p style="margin-top:15px;">

                        <strong>
                            ✅ Matched Skills:
                        </strong>

                        ${job.matched_skills.join(", ")}

                    </p>

                `

                :

                ""
            }


            <div class="job-buttons">

                <button id="saveBtn">

                    ❤️ Save

                </button>


                <button id="applyBtn">

                    🚀 Apply

                </button>

            </div>

        </div>

    `;


    // =================================================
    // SAVE JOB → DATABASE
    // =================================================

    const saveBtn =
        document.getElementById(
            "saveBtn"
        );


    if (saveBtn) {

        saveBtn.onclick =
            async () => {

                const token =
                    localStorage.getItem(
                        "token"
                    );


                console.log(
                    "🔐 Save token exists:",
                    !!token
                );


                if (!token) {

                    alert(
                        "Please login before saving a job."
                    );

                    window.location.href =
                        "/login";

                    return;

                }


                saveBtn.disabled =
                    true;


                saveBtn.innerText =
                    "Saving...";


                try {

                    console.log(
                        "❤️ SAVING JOB TO DATABASE:",
                        job.id
                    );


                    const response =
                        await fetch(
                            `${API_URL}/saved-jobs`,
                            {

                                method: "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        "Bearer " + token

                                },

                                body:
                                    JSON.stringify({

                                        job_id:
                                            Number(
                                                job.id
                                            )

                                    })

                            }
                        );


                    const data =
                        await response.json();


                    console.log(
                        "📥 SAVE JOB RESPONSE:",
                        data
                    );


                    if (!response.ok) {

                        throw new Error(
                            data.detail ||
                            "Unable to save job."
                        );

                    }


                    alert(
                        "❤️ Job Saved Successfully!"
                    );


                    saveBtn.innerText =
                        "❤️ Saved";

                }

                catch (error) {

                    console.error(
                        "❌ SAVE JOB ERROR:",
                        error
                    );


                    alert(
                        "❌ Unable to save job.\n\n" +
                        error.message
                    );


                    saveBtn.innerText =
                        "❤️ Save";

                }

                finally {

                    saveBtn.disabled =
                        false;

                }

            };

    }


    // =================================================
    // APPLY JOB
    // =================================================

    const applyBtn =
        document.getElementById(
            "applyBtn"
        );


    if (applyBtn) {

        applyBtn.onclick =
            async () => {

                const token =
                    localStorage.getItem(
                        "token"
                    );


                console.log(
                    "🔐 Apply token exists:",
                    !!token
                );


                if (!token) {

                    alert(
                        "Please login before applying for a job."
                    );

                    window.location.href =
                        "/login";

                    return;

                }


                applyBtn.disabled =
                    true;


                applyBtn.innerText =
                    "Applying...";


                try {

                    console.log(
                        "📤 SUBMITTING APPLICATION:",
                        job.id
                    );


                    const response =
                        await fetch(
                            `${API_URL}/applications`,
                            {

                                method: "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        "Bearer " + token

                                },

                                body:
                                    JSON.stringify({

                                        job_id:
                                            Number(
                                                job.id
                                            ),

                                        match_percentage:
                                            Number(
                                                job.match_percentage
                                            ) || 0

                                    })

                            }
                        );


                    const data =
                        await response.json();


                    console.log(
                        "📥 APPLICATION RESPONSE:",
                        data
                    );


                    if (!response.ok) {

                        throw new Error(
                            data.detail ||
                            "Application submission failed"
                        );

                    }


                    // Keep local tracking copy
                    let appliedJobs =
                        JSON.parse(
                            localStorage.getItem(
                                "appliedJobs"
                            )
                        ) || [];


                    const application = {

                        id:
                            job.id,

                        title:
                            job.title ||
                            "Job Position",

                        company:
                            job.company ||
                            "Company",

                        location:
                            job.location ||
                            "Location not specified",

                        salary:
                            job.salary ||
                            "Not specified",

                        job_type:
                            job.job_type ||
                            "Full Time",

                        experience:
                            job.experience ||
                            "Fresher",

                        category:
                            job.category ||
                            "",

                        skills:
                            job.skills ||
                            "",

                        description:
                            job.description ||
                            "",

                        logo:
                            job.logo ||
                            "",

                        match_percentage:
                            Number(
                                job.match_percentage
                            ) || 0,

                        matched_skills:
                            job.matched_skills ||
                            [],

                        status:
                            "Applied",

                        appliedAt:
                            new Date()
                                .toLocaleString(),

                        application_id:
                            data.id || null

                    };


                    appliedJobs.push(
                        application
                    );


                    localStorage.setItem(
                        "appliedJobs",
                        JSON.stringify(
                            appliedJobs
                        )
                    );


                    console.log(
                        "✅ APPLICATION SUBMITTED SUCCESSFULLY"
                    );


                    console.log(
                        "🆔 BACKEND APPLICATION ID:",
                        data.id
                    );


                    alert(

                        "🚀 Application Submitted Successfully!\n\n" +

                        application.title +

                        "\n" +

                        application.company

                    );

                }

                catch (error) {

                    console.error(
                        "❌ APPLICATION SUBMISSION ERROR:",
                        error
                    );


                    alert(
                        "❌ Application submission failed.\n\n" +
                        error.message
                    );

                }

                finally {

                    applyBtn.disabled =
                        false;


                    applyBtn.innerText =
                        "🚀 Apply";

                }

            };

    }


    // =================================================
    // SKIP
    // =================================================

    const skipBtn =
        document.getElementById(
            "skipBtn"
        );


    if (skipBtn) {

        skipBtn.onclick =
            () => {

                currentIndex++;

                showJob();

            };

    }


    // =================================================
    // INTERESTED / LIKE → DATABASE
    // =================================================

    const likeBtn =
        document.getElementById(
            "likeBtn"
        );


    if (likeBtn) {

        likeBtn.onclick =
            async () => {

                const currentJob =
                    filteredJobs[
                        currentIndex
                    ];


                if (!currentJob) {

                    return;

                }


                const token =
                    localStorage.getItem(
                        "token"
                    );


                if (!token) {

                    alert(
                        "Please login before saving jobs."
                    );

                    window.location.href =
                        "/login";

                    return;

                }


                try {

                    console.log(
                        "❤️ LIKE → SAVING JOB:",
                        currentJob.id
                    );


                    const response =
                        await fetch(
                            `${API_URL}/saved-jobs`,
                            {

                                method: "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        "Bearer " + token

                                },

                                body:
                                    JSON.stringify({

                                        job_id:
                                            Number(
                                                currentJob.id
                                            )

                                    })

                            }
                        );


                    const data =
                        await response.json();


                    console.log(
                        "📥 LIKE SAVE RESPONSE:",
                        data
                    );


                    if (!response.ok) {

                        throw new Error(
                            data.detail ||
                            "Unable to save job."
                        );

                    }


                    console.log(
                        "✅ LIKE SAVED TO DATABASE"
                    );


                    currentIndex++;

                    showJob();

                }

                catch (error) {

                    console.error(
                        "❌ LIKE SAVE ERROR:",
                        error
                    );


                    alert(
                        "Unable to save job.\n\n" +
                        error.message
                    );

                }

            };

    }

}


// =====================================================
// SEARCH
// =====================================================

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        applyFilters
    );

}


// =====================================================
// LOCATION FILTER
// =====================================================

const locationFilter =
    document.getElementById(
        "locationFilter"
    );


if (locationFilter) {

    locationFilter.addEventListener(
        "change",
        applyFilters
    );

}


// =====================================================
// JOB TYPE FILTER
// =====================================================

const jobTypeFilter =
    document.getElementById(
        "jobTypeFilter"
    );


if (jobTypeFilter) {

    jobTypeFilter.addEventListener(
        "change",
        applyFilters
    );

}


// =====================================================
// RESET FILTERS
// =====================================================

const resetBtn =
    document.getElementById(
        "resetBtn"
    );


if (resetBtn) {

    resetBtn.addEventListener(
        "click",
        () => {

            if (searchInput) {

                searchInput.value =
                    "";

            }


            if (locationFilter) {

                locationFilter.value =
                    "";

            }


            if (jobTypeFilter) {

                jobTypeFilter.value =
                    "";

            }


            filteredJobs =
                [...jobs];


            currentIndex =
                0;


            showJob();

        }
    );

}


// =====================================================
// APPLY FILTERS
// =====================================================

function applyFilters() {

    const search =
        searchInput

            ? searchInput.value
                .toLowerCase()
                .trim()

            : "";


    const location =
        locationFilter

            ? locationFilter.value

            : "";


    const jobType =
        jobTypeFilter

            ? jobTypeFilter.value

            : "";


    filteredJobs =
        jobs.filter(
            job => {

                const matchesSearch =

                    !search ||

                    (job.title || "")
                        .toLowerCase()
                        .includes(search)

                    ||

                    (job.company || "")
                        .toLowerCase()
                        .includes(search)

                    ||

                    (job.skills || "")
                        .toLowerCase()
                        .includes(search);


                const matchesLocation =

                    !location ||
                    job.location === location;


                const matchesJobType =

                    !jobType ||
                    job.job_type === jobType;


                return (

                    matchesSearch &&

                    matchesLocation &&

                    matchesJobType

                );

            }
        );


    currentIndex =
        0;


    showJob();

}


// =====================================================
// START
// =====================================================

loadJobs();