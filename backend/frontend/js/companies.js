const API_URL = window.API_BASE_URL;
const companyGrid =
    document.getElementById("companyGrid");

const companySearch =
    document.getElementById("companySearch");

const companyLocation =
    document.getElementById("companyLocation");

const resetCompanies =
    document.getElementById("resetCompanies");


let companies = [];


// =====================================
// COMPANY INFORMATION
// =====================================

const companyData = {

    Google: {
        logo: "/images/companies/google.png",
        location: "Bangalore",
        description: "Software • AI • Cloud",
        career: "https://careers.google.com/"
    },

    Microsoft: {
        logo: "/images/companies/microsoft.png",
        location: "Hyderabad",
        description: "Azure • AI • Software",
        career: "https://careers.microsoft.com/"
    },

    Amazon: {
        logo: "/images/companies/amazon.png",
        location: "Chennai",
        description: "AWS • E-Commerce • Cloud",
        career: "https://amazon.jobs/"
    },

    Adobe: {
        logo: "/images/companies/adobe.png",
        location: "Noida",
        description: "Creative Software • AI",
        career: "https://careers.adobe.com/"
    },

    Atlassian: {
        logo: "/images/companies/atlassian.png",
        location: "Bangalore",
        description: "Developer Tools • Cloud",
        career: "https://www.atlassian.com/company/careers"
    },

    Salesforce: {
        logo: "/images/companies/salesforce.png",
        location: "Hyderabad",
        description: "CRM • Cloud • AI",
        career: "https://careers.salesforce.com/"
    },

    Uber: {
        logo: "/images/companies/uber.png",
        location: "Bangalore",
        description: "Mobility • Technology",
        career: "https://www.uber.com/careers/"
    },

    Netflix: {
        logo: "/images/companies/netflix.png",
        location: "Remote",
        description: "Streaming • Technology",
        career: "https://jobs.netflix.com/"
    },

    OpenAI: {
        logo: "/images/companies/openai.png",
        location: "Remote",
        description: "Artificial Intelligence • LLM",
        career: "https://openai.com/careers/"
    },

    Infosys: {
        logo: "/images/companies/infosys.png",
        location: "Pune",
        description: "IT Services • Data • Cloud",
        career: "https://career.infosys.com/"
    }

};


// =====================================
// LOAD COMPANIES FROM JOB DATABASE
// =====================================

async function loadCompanies() {

    try {

        const response =
            await fetch(`${API_URL}/jobs`);


        if (!response.ok) {

            throw new Error(
                "Unable to load jobs"
            );

        }


        const jobs =
            await response.json();


        /*
        =================================
        GROUP JOBS BY COMPANY
        =================================
        */

        const companyMap = {};


        jobs.forEach(job => {

            if (!companyMap[job.company]) {

                companyMap[job.company] = {

                    name: job.company,

                    jobs: 0,

                    locations: [],

                    salaries: [],

                    roles: []

                };

            }


            companyMap[job.company].jobs++;


            if (
                job.location &&
                !companyMap[job.company]
                    .locations
                    .includes(job.location)
            ) {

                companyMap[job.company]
                    .locations
                    .push(job.location);

            }


            if (job.salary) {

                companyMap[job.company]
                    .salaries
                    .push(job.salary);

            }


            if (job.title) {

                if (
                    !companyMap[job.company]
                        .roles
                        .includes(job.title)
                ) {

                    companyMap[job.company]
                        .roles
                        .push(job.title);

                }

            }

        });


        /*
        =================================
        CREATE COMPANY LIST
        =================================
        */

        companies =
            Object.values(companyMap).map(company => {

                const info =
                    companyData[company.name] || {};


                return {

                    ...company,

                    logo:
                        info.logo ||
                        "/images/companies/default.png",

                    description:
                        info.description ||
                        "Technology • Software",

                    career:
                        info.career || "#"

                };

            });


        renderCompanies();

    }

    catch (error) {

        console.error(
            "Companies Error:",
            error
        );


        companyGrid.innerHTML = `

            <div class="company-card">

                <h2>
                    Unable to load companies 😔
                </h2>

                <p>
                    Please make sure the FastAPI server is running.
                </p>

            </div>

        `;

    }

}


// =====================================
// RENDER COMPANIES
// =====================================

function renderCompanies() {

    const search =
        companySearch.value
            .toLowerCase()
            .trim();


    const location =
        companyLocation.value;


    const filtered =
        companies.filter(company => {


            const matchesSearch =
                !search ||

                company.name
                    .toLowerCase()
                    .includes(search);


            const matchesLocation =
                !location ||

                company.locations
                    .includes(location);


            return (
                matchesSearch &&
                matchesLocation
            );

        });


    if (filtered.length === 0) {

        companyGrid.innerHTML = `

            <div class="company-card">

                <h2>
                    😔 No Companies Found
                </h2>

                <p>
                    Try changing your search or location filter.
                </p>

            </div>

        `;

        return;

    }


    companyGrid.innerHTML = "";


    filtered.forEach(company => {

        const locations =
            company.locations.length
                ? company.locations.join(", ")
                : "Multiple Locations";


        const roles =
            company.roles.length
                ? company.roles.slice(0, 3)
                : [];


        const salaryText =
            company.salaries.length
                ? company.salaries.join(", ")
                : "Not specified";


        companyGrid.innerHTML += `

            <div class="company-card">


                <img

                    class="company-image"

                    src="${company.logo}"

                    alt="${company.name}"

                    onerror="
                        this.style.display='none';
                    "

                >


                <h2>
                    ${company.name}
                </h2>


                <p>
                    ${company.description}
                </p>


                <p>
                    📍 ${locations}
                </p>


                <p>
                    💼 ${company.jobs} Open Job${company.jobs !== 1 ? "s" : ""}
                </p>


                <p>
                    💰 ${salaryText}
                </p>


                ${
                    roles.length
                    ? `

                        <div class="skills">

                            ${roles.map(role => `

                                <span class="skill-tag">

                                    ${role}

                                </span>

                            `).join("")}

                        </div>

                    `
                    : ""
                }


                <div class="company-buttons">


                    <button

                        class="btn"

                        onclick="
                            viewJobs('${company.name}')
                        "

                    >

                        🔍 View Jobs

                    </button>


                    <button

                        class="btn"

                        onclick="
                            applyCompany('${company.name}')
                        "

                    >

                        🚀 Apply Now

                    </button>


                </div>


            </div>

        `;

    });

}


// =====================================
// VIEW COMPANY JOBS
// =====================================

function viewJobs(company) {

    localStorage.setItem(
        "selectedCompany",
        company
    );


    window.location.href =
        "/jobs-page";

}


// =====================================
// APPLY
// =====================================

function applyCompany(company) {

    const selected =
        companies.find(
            item =>
                item.name === company
        );


    if (
        selected &&
        selected.career &&
        selected.career !== "#"
    ) {

        window.open(
            selected.career,
            "_blank"
        );

    }

    else {

        alert(
            "Official career page unavailable."
        );

    }

}


// =====================================
// SEARCH
// =====================================

companySearch.addEventListener(
    "input",
    renderCompanies
);


// =====================================
// LOCATION FILTER
// =====================================

companyLocation.addEventListener(
    "change",
    renderCompanies
);


// =====================================
// RESET
// =====================================

resetCompanies.onclick = () => {

    companySearch.value = "";

    companyLocation.value = "";

    renderCompanies();

};


// =====================================
// START
// =====================================

loadCompanies();