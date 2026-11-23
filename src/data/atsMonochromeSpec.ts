export interface ResumeFormatSpec {
  format_name: string;
  page_setup: {
    page_count: number;
    page_size: string;
    margins: {
      top: string;
      bottom: string;
      left: string;
      right: string;
    };
    color_scheme: {
      theme: string;
      primary_text: string;
      divider_color: string;
      background: string;
    };
  };
  typography: {
    font_family: string;
    candidate_name: {
      font_size: string;
      font_weight: string;
      alignment: string;
      bottom_divider: boolean;
    };
    contact_bar: {
      font_size: string;
      alignment: string;
      separator: string;
      bottom_divider: boolean;
      bottom_spacing: string;
    };
    section_headings: {
      font_size: string;
      font_weight: string;
      text_transform: string;
      alignment: string;
      bottom_border: {
        enabled: boolean;
        thickness: string;
        style: string;
        color: string;
      };
      margin_top: string;
      margin_bottom: string;
    };
    body_and_bullets: {
      font_size: string;
      font_weight: string;
      line_height: number;
      text_alignment: string;
      bullet_indent: string;
      bullet_spacing: string;
    };
  };
  section_order: string[];
  section_rules: {
    header: {
      fields: string[];
      divider_below: boolean;
      blank_space_below: boolean;
    };
    summary: {
      show_title: boolean;
      layout: string;
      alignment: string;
    };
    technical_skills: {
      layout: string;
      category_label_style: string;
      alignment: string;
    };
    certifications_and_achievements: {
      layout: string;
      item_separator: string;
      alignment: string;
    };
    professional_experience: {
      header_row: string;
      sub_header_row: string;
      date_format: string;
      bullet_alignment: string;
    };
    education: {
      header_row: string;
      sub_row: string;
      date_format: string;
    };
  };
}

export const ATS_MONOCHROME_SPEC: ResumeFormatSpec = {
  format_name: "Single-Page Compact ATS Monochrome Layout",
  page_setup: {
    page_count: 1,
    page_size: "A4 / Letter",
    margins: {
      top: "4mm",
      bottom: "4mm",
      left: "5mm",
      right: "5mm",
    },
    color_scheme: {
      theme: "Monochrome",
      primary_text: "#000000",
      divider_color: "#000000",
      background: "#FFFFFF",
    },
  },
  typography: {
    font_family: "Calibri, Arial, Inter, sans-serif",
    candidate_name: {
      font_size: "16pt",
      font_weight: "bold",
      alignment: "center",
      bottom_divider: false,
    },
    contact_bar: {
      font_size: "9pt",
      alignment: "center",
      separator: " | ",
      bottom_divider: false,
      bottom_spacing: "6pt",
    },
    section_headings: {
      font_size: "11pt",
      font_weight: "bold",
      text_transform: "Title Case",
      alignment: "left",
      bottom_border: {
        enabled: true,
        thickness: "1.5pt",
        style: "solid",
        color: "#000000",
      },
      margin_top: "5pt",
      margin_bottom: "3pt",
    },
    body_and_bullets: {
      font_size: "9pt",
      font_weight: "normal",
      line_height: 1.15,
      text_alignment: "justify",
      bullet_indent: "10pt",
      bullet_spacing: "1.5pt",
    },
  },
  section_order: [
    "Header (Name + Contact Bar — no underline)",
    "Summary",
    "Technical Skills",
    "Certifications & Achievements",
    "Professional Experience",
    "Education",
  ],
  section_rules: {
    header: {
      fields: ["Full Name", "Email Label", "Phone", "City, State, Country", "LinkedIn"],
      divider_below: false,
      blank_space_below: true,
    },
    summary: {
      show_title: true,
      layout: "single_paragraph",
      alignment: "justify",
    },
    technical_skills: {
      layout: "categorized_lines",
      category_label_style: "bold",
      alignment: "justify",
    },
    certifications_and_achievements: {
      layout: "inline_single_block",
      item_separator: " | ",
      alignment: "justify",
    },
    professional_experience: {
      header_row: "Role Title | Company Name (Left) — Short-Month Date Range | Location (Right)",
      sub_header_row: "Project: Project Title (Bold/Italic)",
      date_format: "MMM YYYY – MMM YYYY (e.g., Aug 2025 – Present)",
      bullet_alignment: "justify",
    },
    education: {
      header_row: "Institution Name — Location (Left) — Short-Month Date Range (Right)",
      sub_row: "Degree Title",
      date_format: "MMM YYYY – MMM YYYY",
    },
  },
};

const MONTH_MAP: Record<string, string> = {
  "01": "Jan", "1": "Jan", "jan": "Jan", "january": "Jan",
  "02": "Feb", "2": "Feb", "feb": "Feb", "february": "Feb",
  "03": "Mar", "3": "Mar", "mar": "Mar", "march": "Mar",
  "04": "Apr", "4": "Apr", "apr": "Apr", "april": "Apr",
  "05": "May", "5": "May", "may": "May",
  "06": "Jun", "6": "Jun", "jun": "Jun", "june": "Jun",
  "07": "Jul", "7": "Jul", "jul": "Jul", "july": "Jul",
  "08": "Aug", "8": "Aug", "aug": "Aug", "august": "Aug",
  "09": "Sep", "9": "Sep", "sep": "Sep", "september": "Sep",
  "10": "Oct", "oct": "Oct", "october": "Oct",
  "11": "Nov", "nov": "Nov", "november": "Nov",
  "12": "Dec", "dec": "Dec", "december": "Dec",
};

/**
 * Formats date tokens into MMM YYYY (e.g. 10/2024 -> Oct 2024, Jul 2024 -> Jul 2024, Present -> Present)
 */
export function formatToShortMonth(dateStr?: string): string {
  if (!dateStr || !dateStr.trim()) return "Present";
  const clean = dateStr.trim();
  if (/^present|current$/i.test(clean)) return "Present";

  // Match MM/YYYY or M/YYYY
  const slashMatch = clean.match(/^(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const month = MONTH_MAP[slashMatch[1]] || slashMatch[1];
    return `${month} ${slashMatch[2]}`;
  }

  // Match "Month YYYY"
  const wordMatch = clean.match(/^([a-zA-Z]+)\s+(\d{4})$/);
  if (wordMatch) {
    const monthKey = wordMatch[1].toLowerCase();
    const month = MONTH_MAP[monthKey] || wordMatch[1].slice(0, 3);
    return `${month} ${wordMatch[2]}`;
  }

  return clean;
}

/**
 * Formats a date range into "MMM YYYY – MMM YYYY" (e.g., "Aug 2025 – Present")
 */
export function formatShortMonthRange(startDate?: string, endDate?: string): string {
  const start = formatToShortMonth(startDate);
  const end = formatToShortMonth(endDate);
  if (start && end) {
    return `${start} – ${end}`;
  }
  return start || end || "Present";
}
