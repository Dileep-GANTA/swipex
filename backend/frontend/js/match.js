const API_URL = window.API_BASE_URL;
async function findJobs() {

    const resume = document.getElementById("resumeText").value;

    if (resume.trim() === "") {

        alert("Please enter your resume skills!");

        return;

    }

    const response = await fetch(`${API_URL}/match-job`, {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            resume_text: resume

        })

    });

    const jobs = await response.json();

    const container = document.getElementById("resultContainer");

    container.innerHTML = "";

    jobs.forEach(job => {

        let color = "#ef4444";

        if (job.match_percentage >= 80) {

            color = "#22c55e";

        } else if (job.match_percentage >= 50) {

            color = "#f59e0b";

        }

        const skills = job.matched_skills.length > 0
            ? job.matched_skills.join(", ")
            : "No matching skills";

        const card = document.createElement("div");

        card.className = "job-card";

        card.innerHTML = `

            <div class="company-logo">

                ${job.company.charAt(0)}

            </div>

            <h2>${job.company}</h2>

            <h3>${job.title}</h3>

            <div class="badge">

                📍 ${job.location}

            </div>

            <br>

            <strong>Match Score</strong>

            <div class="progress">

                <div class="progress-fill"

                    style="width:${job.match_percentage}%;
                    background:${color};">

                </div>

            </div>

            <p style="font-size:22px;
                      font-weight:bold;
                      color:${color};
                      margin-top:10px;">

                ${job.match_percentage}%

            </p>

            <p>

                <strong>Matched Skills</strong>

            </p>

            <div class="skills">

                <span class="skill-tag">

                    ${skills}

                </span>

            </div>

        `;

        container.appendChild(card);

    });

}