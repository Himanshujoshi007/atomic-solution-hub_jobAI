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
  fullName: "Alex Morgan",
  subtitle: "Technical Product & Solutions Specialist",
  contact: {
    email: "alex.morgan@example.com",
    phone: "(555) 012-3456",
    location: "San Francisco, CA, USA",
    linkedin: "linkedin.com/in/alex-morgan-sample",
    github: "github.com/alex-morgan-sample",
  },
  summary: "Driven and analytical Technical Product Specialist with proven experience in digital platforms, cloud integrations, and Agile product delivery. Adept at translating complex requirements into viable features, partnering with cross-functional engineering teams, and leveraging data (SQL, Python, Excel) to optimize platform efficiency and client satisfaction in fast-paced environments.",
  skills: {
    languages: ["SQL", "Python", "Advanced Excel"],
    frameworks: ["Agile/Scrum", "Jira", "Confluence", "GitHub"],
    developerTools: ["Data Visualization", "UAT Testing", "Epic Planning"],
    librariesOrCloud: ["Enterprise Cloud Platforms", "API Design", "Analytics"],
  },
  skillGroups: [
    {
      category: "Product Strategy & Execution",
      skills: "Product Roadmapping, Go-To-Market Strategy, Business Requirements (BRDs), Feature Prioritization, and Cross-Functional Leadership.",
    },
    {
      category: "Agile & Delivery Management",
      skills: "Agile/Scrum Frameworks, Backlog Refinement, Epic Planning, Pre- and Post-Release Testing (UAT), and Technical Documentation.",
    },
    {
      category: "Domain & Platform Expertise",
      skills: "Enterprise Cloud Platforms, Digital Workflows, Regulatory Compliance, Data Integrity, and API Architecture.",
    },
    {
      category: "Technical & Analytical Tools",
      skills: "SQL, Python, Advanced Excel, Tableau/PowerBI, Version Control (GitHub), Jira, and Confluence.",
    },
  ],
  experience: [
    {
      id: "exp-1",
      company: "Acme Cloud Technologies",
      role: "Associate Product Specialist",
      location: "San Francisco, CA, USA",
      startDate: "08/2022",
      endDate: "Present",
      bullets: [
        "Led cross-functional teams of 12 engineers and designers to launch enterprise portals, improving workflow speed by 35% across 45,000 daily active users.",
        "Authored 45+ comprehensive PRDs, BRDs, and user story maps, cutting sprint carryover by 22% and expediting bi-weekly releases.",
        "Executed SQL queries and data analysis on user engagement metrics to identify bottlenecks, increasing task completion rate by 18%.",
        "Coordinated with compliance and security stakeholders to guarantee 100% adherence across core data integration pipelines.",
      ],
    },
    {
      id: "exp-2",
      company: "Apex Global Solutions",
      role: "Product & Technical Analyst",
      location: "Austin, TX, USA",
      startDate: "06/2020",
      endDate: "07/2022",
      bullets: [
        "Developed automated performance dashboards tracking API latency, reducing recurring incident triage time by 40%.",
        "Conducted end-to-end UAT and regression test plans for 8 major enterprise platform release cycles.",
        "Facilitated weekly backlog refinement sessions and daily standups using Jira, ensuring on-time delivery of priority epics.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "State University, California, USA",
      degree: "Master of Science",
      field: "Information Systems & Analytics",
      startDate: "08/2020",
      endDate: "05/2022",
    },
    {
      id: "edu-2",
      institution: "Metropolitan University, USA",
      degree: "Bachelor of Science",
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
