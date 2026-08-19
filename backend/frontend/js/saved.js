// =====================================================
// SWIPEX - DATABASE SAVED JOBS
// =====================================================

const API_URL = window.API_BASE_URL;
document.addEventListener("DOMContentLoaded", () => {

    const container =
        document.getElementById("savedContainer");

    const savedCount =
        document.getElementById("savedCount");


    // =================================================
    // GET TOKEN
    // =================================================

    function getToken() {

        const token =
            localStorage.getItem("token");

        console.log(
            "🔐 Saved Jobs token exists:",
            !!token
        );

        return token;
    }


    // =================================================
    // LOAD SAVED JOBS FROM DATABASE
    // =================================================

    async function loadSavedJobs() {

        const token = getToken();


        if (!token) {

            console.error(
                "❌ No login token found."
            );

            container.innerHTML = `

                <div class="job-card">

                    <h2>🔐 Login Required</h2>

                    <p>
                        Please login as a job seeker
                        to view your saved jobs.
                    </p>

                </div>

            `;

            return;
        }


        try {

            console.log(
                "📥 Loading saved jobs from database..."
            );


            const response =
                await fetch(
                    `${API_URL}/saved-jobs/me`,
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                "Bearer " + token
                        }
                    }
                );


            console.log(
                "📡 Saved jobs response:",
                response.status
            );


            const data =
                await response.json();


            console.log(
                "❤️ DATABASE SAVED JOBS:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Unable to load saved jobs"
                );

            }


            const jobs =
                Array.isArray(data)
                    ? data
                    : [];


            // =========================================
            // COUNT
            // =========================================

            if (savedCount) {

                savedCount.innerText =
                    jobs.length;

            }


            // =========================================
            // EMPTY STATE
            // =========================================

            if (jobs.length === 0) {

                container.innerHTML = `

                    <div class="job-card">

                        <h2>
                            No Saved Jobs ❤️
                        </h2>

                        <p>
                            You haven't saved any jobs yet.
                        </p>

                        <br>

                        <a
                            href="/jobs-page"
                            class="btn">

                            🔍 Discover Jobs

                        </a>

                    </div>

                `;

                return;
            }


            // =========================================
            // DISPLAY SAVED JOBS
            // =========================================

            container.innerHTML = "";


            jobs.forEach(job => {

                const skills =
                    job.skills
                        ? job.skills
                            .split(",")
                            .map(
                                skill =>
                                    skill.trim()
                            )
                            .filter(Boolean)
                        : [];


                container.innerHTML += `

                    <div
                        class="job-card"
                        data-job-id="${job.id}"
                    >

                        <div class="featured-ribbon">

                            ❤️ Saved

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

                        </div>


                        <div class="job-info">

                            <span>
                                📍
                                ${job.location || "Not specified"}
                            </span>

                            <span>
                                💰
                                ${job.salary || "Not specified"}
                            </span>

                            <span>
                                💼
                                ${job.job_type || "Full Time"}
                            </span>

                            <span>
                                ⭐
                                ${job.experience || "Fresher"}
                            </span>

                        </div>


                        <p class="job-description">

                            ${job.description || ""}

                        </p>


                        <div class="skills">

                            ${
                                skills
                                    .map(
                                        skill => `

                                            <span class="skill-tag">
                                                ${skill}
                                            </span>

                                        `
                                    )
                                    .join("")
                            }

                        </div>


                        <div class="job-buttons">

                            <button
                                class="apply-btn"
                                onclick="
                                    applySavedJob(${job.id})
                                "
                            >

                                🚀 Apply

                            </button>


                            <button
                                class="remove-btn"
                                onclick="
                                    removeSavedJob(${job.id})
                                "
                            >

                                🗑️ Remove

                            </button>

                        </div>

                    </div>

                `;

            });

        }

        catch (error) {

            console.error(
                "❌ Saved Jobs Error:",
                error
            );


            container.innerHTML = `

                <div class="job-card">

                    <h2>
                        ❌ Unable to load saved jobs
                    </h2>

                    <p>
                        ${error.message}
                    </p>

                </div>

            `;

        }

    }


    // =================================================
    // REMOVE SAVED JOB
    // =================================================

    window.removeSavedJob =
        async function(jobId) {

            const token =
                getToken();


            if (!token) {

                alert(
                    "Please login again."
                );

                return;

            }


            if (
                !confirm(
                    "Remove this job from Saved Jobs?"
                )
            ) {

                return;

            }


            try {

                console.log(
                    "🗑️ Removing saved job:",
                    jobId
                );


                const response =
                    await fetch(
                        `${API_URL}/saved-jobs/${jobId}`,
                        {

                            method: "DELETE",

                            headers: {

                                "Authorization":
                                    "Bearer " + token

                            }

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "📥 Remove response:",
                    data
                );


                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Unable to remove saved job"
                    );

                }


                alert(
                    "🗑️ Job removed from Saved Jobs"
                );


                // Reload from PostgreSQL
                await loadSavedJobs();

            }

            catch (error) {

                console.error(
                    "❌ Remove saved job error:",
                    error
                );


                alert(
                    "Unable to remove saved job: " +
                    error.message
                );

            }

        };


    // =================================================
    // APPLY SAVED JOB
    // =================================================

    window.applySavedJob =
        function(jobId) {

            // For now, send the user to the Jobs page.
            // We will connect this to the real
            // POST /applications endpoint next.

            localStorage.setItem(
                "selectedJobId",
                jobId
            );


            window.location.href =
                "/jobs-page";

        };


    // =================================================
    // START
    // =================================================

    loadSavedJobs();

});