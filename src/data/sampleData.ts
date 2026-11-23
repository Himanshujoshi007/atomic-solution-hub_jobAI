import { ResumeData, JobDescription } from "@/types/resume";

export const EMPTY_RESUME: ResumeData = {
  fullName: "",
  subtitle: "",
  contact: {
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
  },
  summary: "",
  skills: {
    languages: [],
    frameworks: [],
    developerTools: [],
    librariesOrCloud: [],
  },
  skillGroups: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
};

export const EMPTY_JOB_DESCRIPTIONS: JobDescription[] = [
  {
    id: "jd-1",
    companyName: "",
    roleTitle: "",
    jdText: "",
  },
];

export const SAMPLE_BASE_RESUME: ResumeData = {
  fullName: "Alluri Sumanth",
  subtitle: "Associate Product Manager",
  contact: {
    email: "sumanthram99@gmail.com",
    phone: "314-783-7650",
    location: "MO, USA",
    linkedin: "linkedin.com/in/alluri-sumanth",
    github: "github.com/allurisumanth",
  },
  summary: "Driven and collaborative Associate Product Manager with a strong background in healthcare technology and Pharmacy Benefit Management (PBM). Highly analytical and intellectually curious, with a proven track record of collaborating with engineering, UX, and go-to-market teams to deliver impactful product features. Adept at translating complex problems into viable solutions, executing Agile/Scrum events, and leveraging data (SQL, Excel, Python) to optimize enterprise health platforms in fast-paced environments.",
  skills: {
    languages: ["SQL", "Python", "Advanced Excel"],
    frameworks: ["Agile/Scrum", "Jira", "Confluence", "GitHub"],
    developerTools: ["Data Visualization", "UAT Testing", "Epic Planning"],
    librariesOrCloud: ["PBM Health Platforms", "Regulatory Compliance", "Analytics"],
  },
  skillGroups: [
    {
      category: "Product Strategy & Execution",
      skills: "15-Month Product Roadmapping, Go-To-Market Strategy, Business Requirements (BRDs) & Specifications, Feature Prioritization, and Stakeholder Management.",
    },
    {
      category: "Agile & Lifecycle Management",
      skills: "Agile/Scrum Frameworks, Backlog Refinement, Epic Planning, Pre- and Post-Release User Testing (UAT), UX Research, and Release Documentation.",
    },
    {
      category: "Healthcare Domain Expertise",
      skills: "Pharmacy Benefit Management (PBM), Enterprise Health Platforms (EHP), Health Plans, Regulatory Compliance, and Healthcare Operational Workflows.",
    },
    {
      category: "Technical & Analytical Tools",
      skills: "SQL, Python, Advanced Excel, Data Visualization, GitHub (Version Control), Jira, and Confluence.",
    },
  ],
  experience: [
    {
      id: "exp-1",
      company: "Cigna Healthcare",
      role: "Associate Product Manager",
      location: "St. Louis, MO, USA",
      startDate: "08/2022",
      endDate: "Present",
      bullets: [
        "Led cross-functional teams of 12 engineers and designers to launch healthcare provider tools, improving claims processing speed by 35% across 45,000 daily active users.",
        "Authored 45+ comprehensive PRDs, BRDs, and user story maps, cutting sprint carryover by 22% and expediting bi-weekly releases.",
        "Executed SQL queries and data analysis on patient portal interaction metrics to identify drop-off bottlenecks, increasing task completion rate by 18%.",
        "Coordinated with compliance and legal stakeholders to guarantee 100% HIPAA and SOC2 adherence across core patient record pipelines.",
      ],
    },
    {
      id: "exp-2",
      company: "Evernorth Health Services",
      role: "Product Analyst / Technical Specialist",
      location: "St. Louis, MO, USA",
      startDate: "06/2020",
      endDate: "07/2022",
      bullets: [
        "Developed automated Tableau performance dashboards tracking API latency, reducing recurring incident triage time by 40%.",
        "Conducted end-to-end UAT and regression test plans for 8 major pharmacy benefit integration cycles.",
        "Facilitated weekly backlog refinement sessions and daily standups using Jira, ensuring on-time delivery of priority epics.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Washington University in St. Louis, MO, USA",
      degree: "Master of Science",
      field: "Information Systems & Analytics",
      startDate: "08/2020",
      endDate: "05/2022",
    },
    {
      id: "edu-2",
      institution: "JNTU Hyderabad, India",
      degree: "Bachelor of Technology",
      field: "Computer Science and Engineering",
      startDate: "08/2016",
      endDate: "05/2020",
    },
  ],
  certifications: [
    "Certified Scrum Product Owner (CSPO)",
    "Google Project Management Professional Certificate",
    "AWS Certified Cloud Practitioner",
  ],
  projects: [],
};

export const SAMPLE_JOB_DESCRIPTIONS: JobDescription[] = [
  {
    id: "jd-1",
    companyName: "Cigna Healthcare",
    roleTitle: "Product Manager – Health Platforms & Digital Pharmacy",
    jdText: `About Cigna Healthcare:
We are looking for a collaborative Product Manager to lead our digital pharmacy benefit management (PBM) and health plan platform integrations.
Responsibilities:
- Drive product discovery, 12-month roadmapping, and release planning across engineering and design teams.
- Lead Scrum ceremonies, backlog grooming, user acceptance testing (UAT), and release notes.
- Analyze healthcare claims data and platform metrics using SQL, Python, and Excel.
- Ensure strict regulatory compliance and HIPAA alignment.`,
  },
  {
    id: "jd-2",
    companyName: "UnitedHealth Group / Optum",
    roleTitle: "Associate Technical Product Manager",
    jdText: `Join Optum / UnitedHealth Group.
We are hiring an Associate Technical Product Manager to oversee enterprise healthcare provider portals.
Requirements:
- 3+ years experience in product management, Agile/Scrum execution, and Jira backlog grooming.
- Proven experience collaborating with cross-functional engineering teams to reduce cycle times and sprint carryover.
- Proficiency in SQL data analysis, KPI dashboards, and stakeholder management.`,
  },
];
