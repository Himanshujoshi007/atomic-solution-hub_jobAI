import { ResumeData } from "@/types/resume";

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
      company: "Evernorth Health Services",
      role: "Associate Product Manager (PBM & Health Tech Solutions)",
      location: "MO, USA",
      startDate: "03/2025",
      endDate: "Present",
      bullets: [
        "Collaborated with cross-functional PMs, engineers, and UX designers to accelerate the delivery of complex enterprise health platform features, achieving a targeted 25% reduction in overall product development life cycles.",
        "Created and managed a 15-month rolling product roadmap, effectively aligning stakeholder expectations and business needs, resulting in a 30% increase in on-time feature deployments across the entire PBM product portfolio.",
        "Led backlog refinement, epic planning, and Agile events via Jira, optimizing project execution workflows and decreasing sprint carryover by 20% while concurrently increasing overall engineering team velocity by 15%.",
        "Analyzed complex product data utilizing SQL and Excel to derive highly actionable insights, successfully guiding backlog prioritization and driving a 40% improvement in post-release optimization for targeted health plan products.",
        "Conducted comprehensive pre-release and post-release user testing to ensure optimal functionality, publishing value-driven release notes that successfully reduced post-deployment client support tickets by 35% within the first operational month.",
        "Presented strategic roadmap updates and critical product delivery risks to senior leadership, ensuring strict alignment with business objectives and achieving a 98% compliance rate with internal enterprise healthcare standards.",
      ],
    },
    {
      id: "exp-2",
      company: "Novartis",
      role: "Product Analyst / Project Coordinator",
      location: "Hyderabad, Telangana, India",
      startDate: "08/2020",
      endDate: "12/2023",
      bullets: [
        "Partnered closely with go-to-market teams to identify critical value-add opportunities, translating complex healthcare operational challenges into viable product solutions that increased user adoption rates by 22% within one quarter.",
        "Collaborated seamlessly with design teams to conduct targeted user experience research and testing, integrating feedback from internal stakeholders to improve overall user satisfaction scores by a measurable 18% margin.",
        "Managed conflicting priorities in a strict deadline-driven environment, driving seamless cross-functional collaboration between technical and non-technical teams to achieve a 95% on-time milestone completion rate for key product initiatives.",
        "Leveraged Python and advanced data visualization tools to meticulously evaluate product performance metrics, identifying critical workflow bottlenecks and driving a 15% increase in operational efficiency across cross-functional internal teams.",
        "Supported business requirements by actively monitoring quality metrics and compliance standards, ensuring strict adherence to healthcare regulations and reducing internal audit discrepancies by 30% over a two-year performance period.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Saint Louis University, St. Louis, MO, USA",
      degree: "Master's Degree",
      field: "Project Management",
      startDate: "01/2024",
      endDate: "12/2025",
    },
    {
      id: "edu-2",
      institution: "St. Peters Engineering College, Hyderabad, Telangana, India",
      degree: "Bachelor's Degree",
      field: "Mechanical Engineering",
      startDate: "08/2018",
      endDate: "08/2022",
    },
  ],
  certifications: [
    "Certified Scrum Product Owner (CSPO) – Preferred Qualification Alignment",
    "Google Project Management Professional Certificate",
    "Business Intelligence Analyst Certification",
  ],
  projects: [],
};

export const SAMPLE_JOB_DESCRIPTIONS = [
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
