import streamlit as st
import pandas as pd
from supabase import create_client, Client
import pypdf
from groq import Groq
import json
import re
from datetime import datetime
import time
import os
from dotenv import load_dotenv
import requests

# Load local .env file if it exists
load_dotenv()

# --- 1. CONFIGURATION & CLOUD DATABASE CONNECTION ---
st.set_page_config(
    page_title="Atomic Solution AI Career & Job Hub - by HJ", 
    page_icon="💼", 
    layout="wide"
)

# --- 🎨 INJECTED 6-SECOND CROSSFADE, 3D TABS & GLASSMORPHISM ---
CUSTOM_CSS = """
<style>
    @import url('https://fonts.cdnfonts.com/css/sf-pro-display-chrome');

    :root {
        --glass-obsidian: rgba(15, 15, 20, 0.75); 
        --glass-border: rgba(255, 255, 255, 0.15);
        --text-pure: #ffffff;
    }

    /* 6-SECOND DYNAMIC CROSSFADE ENGINE (24s Loop) */
    .stApp, [data-testid="stAppViewContainer"] {
        background: linear-gradient(90deg, #000004 0%, #000c4f 16.6%, #5b8183 33.3%, #e8cd7e 50%, #ffb244 66.6%, #9e4700 83.3%, #000000 100%) !important;
        background-size: cover !important;
        background-attachment: fixed !important;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif !important;
        color: var(--text-pure) !important;
        z-index: 0;
    }

    .stApp::before {
        content: ""; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: linear-gradient(270deg, #e20057 0%, #ff0044 20%, #f63d4b 40%, #bf976b 60%, #7ed7a5 80%, #59fef7 100%);
        z-index: -3; pointer-events: none; animation: fadeGrad2 24s ease-in-out infinite;
    }
    .stApp::after {
        content: ""; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: linear-gradient(180deg, #00084f 0%, #001e78 25%, #0034a6 50%, #0049d8 75%, #005eff 100%);
        z-index: -2; pointer-events: none; animation: fadeGrad3 24s ease-in-out infinite;
    }
    [data-testid="stAppViewContainer"]::before {
        content: ""; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: linear-gradient(90deg, #dac574 0%, #d5a337 16.6%, #c87900 33.3%, #b24800 50%, #860000 75%, #500000 100%);
        z-index: -1; pointer-events: none; animation: fadeGrad4 24s ease-in-out infinite;
    }

    @keyframes fadeGrad2 { 0% { opacity: 0; } 25%, 75% { opacity: 1; } 100% { opacity: 0; } }
    @keyframes fadeGrad3 { 0%, 25% { opacity: 0; } 50%, 75% { opacity: 1; } 100% { opacity: 0; } }
    @keyframes fadeGrad4 { 0%, 50% { opacity: 0; } 75% { opacity: 1; } 100% { opacity: 0; } }

    @keyframes gentleLoad {
        0% { opacity: 0; transform: translateY(15px); filter: blur(5px); }
        100% { opacity: 1; transform: translateY(0); filter: blur(0); }
    }
    [data-testid="stAppViewBlockContainer"] {
        animation: gentleLoad 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }

    /* Clean Header and Hide Clutter */
    [data-testid="stHeader"] { background: transparent !important; }
    #MainMenu, footer, [data-testid="stToolbar"], [data-testid="stSidebar"] { display: none !important; }

    /* HEAVY FROSTED GLASS CARDS */
    div[data-testid="stForm"], div[data-testid="stMetric"],
    div[data-testid="stExpander"], div[data-testid="stDataFrame"] {
        background: var(--glass-obsidian) !important;
        backdrop-filter: blur(35px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(35px) saturate(180%) !important;
        border-radius: 16px !important;
        border: 1px solid var(--glass-border) !important;
        padding: 24px !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.1) !important;
        transition: all 0.3s ease !important;
        color: var(--text-pure) !important;
    }

    div[data-testid="stForm"]:hover, div[data-testid="stMetric"]:hover {
        transform: translateY(-2px) scale(1.01) !important;
        background: rgba(25, 25, 30, 0.85) !important;
        border-color: rgba(255, 255, 255, 0.4) !important;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(255, 255, 255, 0.05) !important;
    }

    .stMarkdown p, .stMarkdown span, .stMarkdown li { color: var(--text-pure) !important; }

    h1, h2, h3 {
        color: #ffffff !important;
        text-shadow: 0 2px 10px rgba(0,0,0,0.6);
        transition: all 0.3s ease !important;
        display: inline-block;
    }
    h1:hover, h2:hover, h3:hover {
        transform: translateY(-1px) scale(1.01);
        color: #59fef7 !important;
        text-shadow: 0 4px 15px rgba(89, 254, 247, 0.4), 0 2px 5px rgba(0,0,0,0.6);
    }

    /* MASSIVE 3D TABS */
    div[data-baseweb="tab-list"] {
        background: rgba(15, 15, 20, 0.7) !important;
        backdrop-filter: blur(25px) !important;
        border-radius: 20px !important;
        padding: 12px !important;
        gap: 16px !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        box-shadow: inset 0 6px 12px rgba(0,0,0,0.8), 0 4px 15px rgba(0,0,0,0.3) !important;
    }

    button[data-baseweb="tab"] {
        border-radius: 14px !important;
        color: #c4c4cc !important;
        font-size: 19px !important; 
        font-weight: 600 !important;
        padding: 15px 30px !important; 
        background: rgba(35, 35, 40, 0.8) !important; 
        border: 1px solid rgba(255, 255, 255, 0.15) !important; 
        box-shadow: 0 4px 8px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1) !important; 
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    }

    button[data-baseweb="tab"]:hover {
        background: rgba(255, 255, 255, 0.15) !important;
        color: #ffffff !important;
        transform: scale(1.06) translateY(-5px) !important;
        box-shadow: 0 12px 20px rgba(0,0,0,0.6), inset 0 2px 3px rgba(255,255,255,0.3) !important;
        border-color: rgba(255, 255, 255, 0.4) !important;
        z-index: 10;
    }

    button[aria-selected="true"] {
        background: linear-gradient(135deg, rgba(89, 254, 247, 0.2), rgba(0,0,0,0.3)) !important;
        color: #59fef7 !important;
        font-weight: 700 !important;
        transform: scale(1.06) translateY(-2px) !important;
        box-shadow: 0 10px 20px rgba(0,0,0,0.6), inset 0 2px 5px rgba(255,255,255,0.4) !important;
        border-color: #59fef7 !important;
    }

    /* BUTTONS */
    div.stButton > button {
        border-radius: 50px !important;
        font-weight: 600 !important;
        font-size: 15px !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        background: rgba(255, 255, 255, 0.08) !important;
        color: #ffffff !important;
        padding: 12px 28px !important;
        transition: all 0.2s ease !important;
        backdrop-filter: blur(10px) !important;
    }
    div.stButton > button:hover {
        transform: scale(1.03) translateY(-2px) !important;
        background: rgba(255, 255, 255, 0.18) !important;
        box-shadow: 0 8px 20px rgba(0,0,0,0.5) !important;
        border-color: rgba(255, 255, 255, 0.5) !important;
    }

    /* INPUTS */
    input, textarea, div[data-baseweb="select"] > div {
        background: rgba(0, 0, 0, 0.5) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        border-radius: 12px !important;
        color: #ffffff !important;
        padding: 12px !important;
        font-size: 15px !important;
        box-shadow: inset 0 2px 6px rgba(0,0,0,0.8) !important;
        transition: all 0.3s ease !important;
    }
    input:focus, textarea:focus, div[data-baseweb="select"] > div:focus-within {
        border-color: #59fef7 !important;
        background: rgba(0, 0, 0, 0.7) !important;
        box-shadow: inset 0 2px 6px rgba(0,0,0,0.8), 0 0 0 2px rgba(89, 254, 247, 0.3) !important;
    }
    
    div[data-testid="stMetricValue"] {
        color: #59fef7 !important;
        font-weight: 700 !important;
        text-shadow: 0 2px 10px rgba(89, 254, 247, 0.4) !important;
    }
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

# Hardcoded Supabase Credentials
SUPABASE_URL = "https://mqkzzpqxuanjmywqqzpy.supabase.co"
SUPABASE_KEY = "sb_publishable_Ea1IYL85GvIqsa5YngCjqA_d6kNMg3-"

@st.cache_resource
def get_supabase_client(url: str, key: str) -> Client:
    if url and key:
        return create_client(url, key)
    return None

supabase = get_supabase_client(SUPABASE_URL, SUPABASE_KEY)

# Session State Initialization
for key in ["authenticated", "username", "is_admin", "resume_text", "ai_roles", "ai_key_skills", "jobs_df", "gap_notes"]:
    if key not in st.session_state:
        st.session_state[key] = False if key in ["authenticated", "is_admin"] else None

# Securely load API Keys from Environment Variable (.env) or Streamlit Secrets
if "groq_key" not in st.session_state:
    env_key = os.getenv("GROQ_API_KEY", "")
    if not env_key and hasattr(st, "secrets") and "GROQ_API_KEY" in st.secrets:
        env_key = st.secrets["GROQ_API_KEY"]
    st.session_state.groq_key = env_key

def parse_ai_json(response_text):
    cleaned = re.sub(r'```(?:json)?', '', response_text).strip()
    return json.loads(cleaned)

def extract_pdf_text(file):
    pdf = pypdf.PdfReader(file)
    return "\n".join(page.extract_text() for page in pdf.pages if page.extract_text())

# --- 2. AUTHENTICATION SYSTEM ---
if not st.session_state.authenticated:
    st.title("🔐 Atomic Solution Login")

    login_col, _ = st.columns([1, 1])
    with login_col:
        input_user = st.text_input("Username")
        input_pass = st.text_input("Password", type="password")
        
        if st.button("Log In", type="primary"):
            try:
                response = supabase.table("users").select("*").eq("username", input_user).eq("password", input_pass).execute()
                records = response.data
                
                if records:
                    user_data = records[0]
                    if not user_data.get("is_active", True):
                        st.error("This account has been disabled by the admin.")
                    else:
                        # Robust Admin Check
                        raw_admin = user_data.get("is_admin", False)
                        if isinstance(raw_admin, str):
                            is_admin_val = raw_admin.lower() in ["true", "1", "yes", "t"]
                        else:
                            is_admin_val = bool(raw_admin)
                        
                        if user_data["username"].lower() == "admin":
                            is_admin_val = True

                        st.session_state.authenticated = True
                        st.session_state.username = user_data["username"]
                        st.session_state.is_admin = is_admin_val
                        st.rerun()
                else:
                    st.error("Invalid username or password.")
            except Exception as e:
                st.error(f"Cloud Connection Error: {e}")
    
    st.markdown("<br><br><br>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; color: #e2e8f0; font-size: 13px;'>© 2026 All Rights Reserved by Himanshu Joshi from Atomic Solution</p>", unsafe_allow_html=True)
    st.stop()

# --- 3. TOP NAVIGATION & HEADER BAR ---
top_col1, top_col2, top_col3, top_col4 = st.columns([2.5, 2, 1.5, 1])

with top_col1:
    st.markdown("### 💼 Atomic Solution")

with top_col2:
    if st.session_state.is_admin:
        page = st.selectbox("Navigation View", ["💼 AI Job Hub", "👑 Admin Panel"], label_visibility="collapsed")
    else:
        page = "💼 AI Job Hub"
        st.markdown("<p style='padding-top: 8px; color: #59fef7;'>✨ <b>Mode:</b> User Hub</p>", unsafe_allow_html=True)

with top_col3:
    st.markdown(f"<div style='padding-top: 8px; text-align: right; color: #59fef7;'>👤 <b>{st.session_state.username}</b></div>", unsafe_allow_html=True)

with top_col4:
    if st.button("🚪 Logout", use_container_width=True):
        st.session_state.authenticated = False
        st.rerun()

st.markdown("<hr style='margin-top: 0px; border-color: rgba(255,255,255,0.1);'>", unsafe_allow_html=True)

# --- 4. ADMIN PANEL PAGE ---
if page == "👑 Admin Panel":
    st.title("👑 Master Admin Panel")
    st.markdown("Use this space to manage user access and global system configurations.")
    
    col_add, col_manage = st.columns([1, 2])
    
    with col_add:
        st.subheader("Add New User")
        new_user = st.text_input("New Username")
        new_pass = st.text_input("New Password", type="password")
        make_admin = st.checkbox("Grant Admin Status")
        
        if st.button("Create Account"):
            if new_user and new_pass:
                supabase.table("users").insert({
                    "username": new_user,
                    "password": new_pass,
                    "is_admin": make_admin,
                    "is_active": True
                }).execute()
                st.success(f"User '{new_user}' created successfully!")
                st.rerun()
                
    with col_manage:
        st.subheader("Existing Users")
        all_users = supabase.table("users").select("username, is_admin, is_active").execute().data
        
        if all_users:
            df_users = pd.DataFrame(all_users)
            st.dataframe(df_users, use_container_width=True)
            
            selected_user = st.selectbox("Select User to modify:", df_users["username"])
            
            c1, c2 = st.columns(2)
            with c1:
                if st.button("Disable / Enable User"):
                    current_status = df_users[df_users["username"] == selected_user]["is_active"].values[0]
                    supabase.table("users").update({"is_active": not current_status}).eq("username", selected_user).execute()
                    st.rerun()
            with c2:
                if st.button("Delete User", type="primary"):
                    supabase.table("users").delete().eq("username", selected_user).execute()
                    st.rerun()

    st.markdown("---")
    st.subheader("🔑 System API Key Management")
    st.info("🔒 The Groq API key is loaded securely from environment variables. You can update it below for the current session if needed.")
    
    updated_key = st.text_input("Groq API Key", value=st.session_state.groq_key, type="password")
    if st.button("Update Groq Key"):
        if updated_key.strip():
            st.session_state.groq_key = updated_key.strip()
            st.success("Groq API Key successfully updated for the active session!")
        else:
            st.error("API key cannot be empty.")

# --- 5. AI JOB Hub PAGE ---
elif page == "💼 AI Job Hub":
    
    app_tab1, app_tab2, app_tab3, app_tab4 = st.tabs([
        "📄 1. Resume AI", "🔍 2. Extract Jobs", "⚖️ 3. Gap Analysis", "📜 4. Application History"
    ])

    # --- TAB 1: RESUME AI ---
    with app_tab1:
        st.markdown("### Upload your Resume to generate high-accuracy target roles")
        uploaded_file = st.file_uploader("Upload PDF Resume", type=["pdf"])
        
        if uploaded_file and st.button("Analyze Resume & Generate Roles", type="primary"):
            if not st.session_state.groq_key:
                st.error("⚠️ System Groq API Key is missing. Please configure it in your environment or secrets.")
            else:
                with st.spinner("AI is analyzing technical stack, domain, and experience level..."):
                    try:
                        text = extract_pdf_text(uploaded_file)
                        st.session_state.resume_text = text
                        
                        client = Groq(api_key=st.session_state.groq_key)
                        
                        prompt = f"""
                        You are a senior executive recruiter and ATS resume optimization expert specializing in North American (USA & Canada) job markets.
                        
                        Analyze the following resume deeply to infer exact industry job titles.
                        
                        Return ONLY a valid JSON object. Do NOT include markdown code blocks or additional prose.
                        Required JSON Structure:
                        {{
                            "experience_level": "Junior / Mid-Level / Senior / Lead / Executive",
                            "years_of_experience": "X years",
                            "recommended_roles": ["Role 1", "Role 2", ...],
                            "key_skills": ["Skill 1", "Skill 2", ...]
                        }}

                        Strict Guidelines for "recommended_roles":
                        1. Generate EXACTLY 10 to 20 highly specific, ATS-compliant job titles matched strictly to North American job board titles (e.g. LinkedIn, Indeed).
                        2. Never output overly generic roles (e.g., do NOT output "Developer" or "Manager"; instead output "Senior Full Stack Engineer (Next.js/Node)", "Lead Python Developer", "IT Infrastructure Project Manager").
                        3. Match the exact seniority tier of the candidate based on their achievements and responsibilities.
                        4. Include relevant adjacent positions that the candidate is qualified for.

                        Resume Content:
                        {text}
                        """
                        
                        completion = client.chat.completions.create(
                            model="llama-3.1-8b-instant",
                            messages=[
                                {"role": "system", "content": "You are a specialized ATS resume parser. You must output strictly valid JSON."},
                                {"role": "user", "content": prompt}
                            ],
                            temperature=0.1,
                            response_format={"type": "json_object"}
                        )
                        
                        raw_response = completion.choices[0].message.content
                        data = json.loads(raw_response)
                        
                        st.session_state.ai_roles = data.get("recommended_roles", [])
                        st.session_state.ai_key_skills = data.get("key_skills", [])
                        
                        st.success(f"Successfully identified {len(st.session_state.ai_roles)} High-Precision Target Roles!")
                        
                        colA, colB = st.columns(2)
                        colA.metric("Evaluated Seniority", data.get("experience_level"))
                        colB.metric("Years of Experience", data.get("years_of_experience"))
                        
                        st.write("**Core Competencies Detected:**", ", ".join(st.session_state.ai_key_skills))
                        st.write("**Extracted Target Job Titles:**", ", ".join(st.session_state.ai_roles))
                        
                    except Exception as e:
                        st.error(f"Error during AI parsing: {e}")

    # --- TAB 2: JOB EXTRACTOR & SOURCE CLASSIFIER (JSEARCH API) ---
    with app_tab2:
        st.markdown("### Target Roles & Job Extraction Engine")
        
        if "ai_roles" not in st.session_state:
            st.session_state.ai_roles = []
            
        roles_str = ",\n".join(st.session_state.ai_roles) if st.session_state.ai_roles else ""
        
        st.info("💡 You can edit, add, or remove job titles below. Separate each title with a comma or new line.")
        edited_roles_input = st.text_area("Target Job Roles to Scrape", value=roles_str, height=140)
        
        c2, c3 = st.columns(2)
        with c2:
            country = st.selectbox("Country", ["USA", "Canada"])
        with c3:
            max_limit = st.number_input("Max Jobs per Role (Keep low on free tier)", min_value=1, max_value=20, value=5)
            max_hours = st.number_input("Max Age (Hours)", min_value=1, max_value=168, value=72)

        col_scrape, col_manual = st.columns(2)
        
        with col_scrape:
            run_scrape = st.button("🚀 Scrape Live Jobs (Via API)", type="primary", use_container_width=True)
            
        with col_manual:
            with st.expander("➕ Add Job Manually"):
                manual_title = st.text_input("Job Title")
                manual_company = st.text_input("Company")
                manual_location = st.text_input("Location", value="Remote / USA")
                manual_url = st.text_input("Application URL", value="[https://www.linkedin.com](https://www.linkedin.com)")
                manual_desc = st.text_area("Job Description (Paste description for AI matching)")
                
                if st.button("Add to Job List"):
                    if manual_title and manual_company:
                        new_row = pd.DataFrame([{
                            'title': manual_title, 'company': manual_company, 'location': manual_location,
                            'Source': 'Manual Entry', 'Match %': 85, 'Posted Age': 'Just Added',
                            'Age_Hours': 0, 'Apply Link': manual_url, 'description': manual_desc or "Manual entry description."
                        }])
                        if "jobs_df" in st.session_state and st.session_state.jobs_df is not None and not st.session_state.jobs_df.empty:
                            st.session_state.jobs_df = pd.concat([st.session_state.jobs_df, new_row], ignore_index=True)
                        else:
                            st.session_state.jobs_df = new_row
                        st.success(f"Added '{manual_title}' successfully!")
                        st.rerun()
                    else:
                        st.error("Please fill in Job Title and Company.")

        if run_scrape:
            # Safely fetch the RapidAPI key
            rapid_key = os.getenv("RAPIDAPI_KEY", "")
            if not rapid_key and hasattr(st, "secrets") and "RAPIDAPI_KEY" in st.secrets:
                rapid_key = st.secrets["RAPIDAPI_KEY"]
                
            roles_to_scrape = [r.strip() for r in re.split(r'[,\n]+', edited_roles_input) if r.strip()]
            
            if not rapid_key:
                st.error("⚠️ RAPIDAPI_KEY is missing. Please add it to your .env file or Streamlit Secrets.")
            elif not roles_to_scrape:
                st.warning("Please enter at least one Job Role to search for.")
            else:
                with st.spinner(f"Querying JSearch API for {len(roles_to_scrape)} roles in {country}..."):
                    all_jobs_list = []
                    progress_text = st.empty()
                    progress_bar = st.progress(0)
                    
                    for i, role in enumerate(roles_to_scrape):
                        progress_text.text(f"Fetching API data for: {role} ({i+1}/{len(roles_to_scrape)})")
                        
                        url = "[https://jsearch.p.rapidapi.com/search](https://jsearch.p.rapidapi.com/search)"
                        querystring = {
                            "query": f"{role} in {country}",
                            "page": "1",
                            "num_pages": "1",
                            "date_posted": "week" 
                        }
                        headers = {
                            "X-RapidAPI-Key": rapid_key,
                            "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
                        }

                        try:
                            response = requests.get(url, headers=headers, params=querystring)
                            response.raise_for_status()
                            data = response.json()
                            
                            jobs_data = data.get('data', [])
                            for job in jobs_data[:int(max_limit)]:
                                age_hours = 0
                                posted_str = "Recent"
                                try:
                                    posted_dt = pd.to_datetime(job.get('job_posted_at_datetime_utc'))
                                    if pd.notnull(posted_dt):
                                        now = pd.Timestamp.now(tz='UTC')
                                        age_hours = (now - posted_dt).total_seconds() / 3600
                                        posted_str = f"{age_hours:.1f} hrs ago"
                                except Exception:
                                    pass

                                if age_hours <= max_hours:
                                    all_jobs_list.append({
                                        'title': job.get('job_title', 'Unknown Title'),
                                        'company': job.get('employer_name', 'Unknown Company'),
                                        'location': f"{job.get('job_city', '')}, {job.get('job_country', '')}".strip(', '),
                                        'Source': job.get('job_publisher', 'Google Jobs'),
                                        'Age_Hours': age_hours,
                                        'Posted Age': posted_str,
                                        'Apply Link': job.get('job_apply_link', ''),
                                        'description': job.get('job_description', '')
                                    })
                        except Exception as e:
                            st.toast(f"Failed to fetch '{role}' via API: {e}")

                        progress_bar.progress((i + 1) / len(roles_to_scrape))
                        time.sleep(1.5) 

                    if all_jobs_list:
                        combined_jobs = pd.DataFrame(all_jobs_list)
                        
                        def calculate_match_percentage(desc):
                            desc_lower = str(desc).lower()
                            skills = st.session_state.ai_key_skills
                            if not skills: return 75
                            matches = sum(1 for s in skills if s.lower() in desc_lower)
                            base_score = int((matches / len(skills)) * 100)
                            return min(99, max(60, base_score + 15))
                            
                        combined_jobs['Match %'] = combined_jobs['description'].apply(calculate_match_percentage)
                        
                        st.session_state.jobs_df = combined_jobs[['title', 'company', 'location', 'Source', 'Match %', 'Posted Age', 'Age_Hours', 'Apply Link', 'description']]
                        progress_text.text("API Extraction Complete!")
                        st.success(f"Successfully extracted {len(combined_jobs)} jobs via JSearch API!")
                    else:
                        progress_text.text("Extraction Complete.")
                        st.error("API call succeeded but returned 0 jobs matching your specific criteria/age restriction.")

        # Display Extracted Jobs Table
        if "jobs_df" in st.session_state and st.session_state.jobs_df is not None and not st.session_state.jobs_df.empty:
            st.markdown("---")
            
            c_header, c_save = st.columns([2, 1])
            with c_header:
                st.subheader("📊 Extracted Job Listings")
            with c_save:
                if st.button("📥 Save ALL Jobs to History"):
                    with st.spinner("Saving to cloud database..."):
                        safe_df = st.session_state.jobs_df.fillna("")
                        records_to_insert = []
                        for _, row in safe_df.iterrows():
                            records_to_insert.append({
                                "username": st.session_state.username,
                                "job_title": row['title'],
                                "company": row['company'],
                                "job_url": row['Apply Link'],
                                "source_type": row['Source'],
                                "applied_date": datetime.now().strftime("%Y-%m-%d %H:%M")
                            })
                        try:
                            supabase.table("applications").insert(records_to_insert).execute()
                            st.success(f"✅ Saved {len(records_to_insert)} jobs to history!")
                        except Exception as e:
                            st.error(f"Failed to save: {e}")
            
            sort_col, _ = st.columns([1, 2])
            with sort_col:
                sort_jobs_by = st.selectbox("Sort Jobs By:", ["Highest Match %", "Newest First (Age)", "Oldest First", "Job Title (A-Z)"])
            
            df_display = st.session_state.jobs_df.copy()
            if sort_jobs_by == "Highest Match %":
                df_display = df_display.sort_values(by="Match %", ascending=False)
            elif sort_jobs_by == "Newest First (Age)":
                df_display = df_display.sort_values(by="Age_Hours", ascending=True)
            elif sort_jobs_by == "Oldest First":
                df_display = df_display.sort_values(by="Age_Hours", ascending=False)
            elif sort_jobs_by == "Job Title (A-Z)":
                df_display = df_display.sort_values(by="title", ascending=True)
                
            df_display['Match %'] = df_display['Match %'].astype(str) + "%"

            st.dataframe(
                df_display[['title', 'company', 'location', 'Match %', 'Source', 'Posted Age', 'Apply Link']],
                column_config={
                    "Apply Link": st.column_config.LinkColumn("Click to Apply"),
                    "Posted Age": st.column_config.TextColumn("Age")
                },
                use_container_width=True, hide_index=True
            )

    # --- TAB 3: GAP ANALYSIS & SIDE-BY-SIDE NOTEPAD ---
    with app_tab3:
        st.markdown("### Match Intelligence & Missing Skills")
        
        if "jobs_df" not in st.session_state or st.session_state.jobs_df is None or st.session_state.jobs_df.empty:
            st.info("Please scrape jobs in Tab 2 first.")
        elif not st.session_state.resume_text:
            st.info("Please upload and analyze a resume in Tab 1 first.")
        else:
            df = st.session_state.jobs_df
            
            job_options = df['title'].fillna("Unknown").astype(str) + " at " + df['company'].fillna("Unknown").astype(str)
            options_list = ["🌟 Analyze ALL Extracted Jobs (Aggregate)"] + job_options.tolist()
            
            selected_option = st.selectbox("Select Target Description:", options_list)
            
            if st.button("Evaluate Match & Extract Missing Skills", type="primary"):
                if not st.session_state.groq_key:
                    st.error("System Groq API Key missing.")
                else:
                    with st.spinner("Groq AI is performing gap analysis..."):
                        try:
                            client = Groq(api_key=st.session_state.groq_key)
                            
                            if selected_option == "🌟 Analyze ALL Extracted Jobs (Aggregate)":
                                top_descriptions = df['description'].fillna("").head(4).astype(str).apply(lambda desc: desc[:800] + "...")
                                job_desc = "\n\n--- NEXT JOB ---\n\n".join(top_descriptions.tolist())
                                context_msg = "Compare the Resume to ALL of the provided top market Job Descriptions."
                            else:
                                idx = options_list.index(selected_option) - 1
                                job_desc = df.iloc[idx]['description']
                                context_msg = "Compare the Job Description to the Resume."
                                
                            prompt = f"""
                            {context_msg}
                            Find exact keywords, technologies, domain knowledge, or skills required by the job(s) that are strictly MISSING from the resume.
                            Return ONLY a valid JSON object.
                            Keys required:
                            - "match_score": string (e.g. "78%")
                            - "missing_skills": list of strings (bullet points of what to add to the resume)
                            
                            Job Description(s): {job_desc}
                            ---
                            Resume: {st.session_state.resume_text}
                            """
                            
                            completion = client.chat.completions.create(
                                model="llama-3.1-8b-instant",
                                messages=[
                                    {"role": "system", "content": "You are an expert ATS resume analyzer. You must only output valid JSON."},
                                    {"role": "user", "content": prompt}
                                ],
                                temperature=0.1,
                                response_format={"type": "json_object"}
                            )
                            
                            raw_response = completion.choices[0].message.content
                            gap_data = json.loads(raw_response)
                            
                            st.metric("Deep AI Match Score", gap_data.get("match_score", "N/A"))
                            
                            checklist = "\n".join([f"- [ ] {skill}" for skill in gap_data.get("missing_skills", [])])
                            
                            st.session_state.gap_notes = checklist
                            st.session_state.notepad_area = checklist
                            
                        except Exception as e:
                            st.error(f"Analysis error: {e}")
            
            st.markdown("---")
            col_notes, col_jd = st.columns([1, 1])
            
            with col_notes:
                st.subheader("📝 Missing Skills Notepad")
                st.markdown("Edit this list as you update the resume.")
                
                if "notepad_area" not in st.session_state:
                    st.session_state.notepad_area = st.session_state.get("gap_notes", "")
                
                st.text_area("Track what you need to add:", height=400, key="notepad_area")
                
                st.caption("⚠️ *Generated by AI, so it may not be 100% accurate. Please review manually.*")
                
                if st.session_state.notepad_area:
                    st.download_button(
                        label="📄 Download Missing Skills (CSV)",
                        data=st.session_state.notepad_area,
                        file_name="Missing_Skills_Notepad.csv",
                        mime="text/csv"
                    )
                
            with col_jd:
                if selected_option == "🌟 Analyze ALL Extracted Jobs (Aggregate)":
                    st.subheader("📄 Job Descriptions Overview")
                    st.info("You are viewing the aggregate analysis for all scraped jobs. Switch to an individual job in the dropdown above to read a specific description.")
                else:
                    st.subheader("📄 Target Job Description")
                    idx = options_list.index(selected_option) - 1
                    st.container(height=400, border=True).write(df.iloc[idx]['description'])

    # --- TAB 4: APPLICATION HISTORY ---
    with app_tab4:
        st.header("📜 Saved Application History")
        
        c_ref, c_sort = st.columns([1, 2])
        with c_ref:
            refresh_trigger = st.button("Refresh History")
            
        try:
            records = supabase.table("applications").select("*").eq("username", st.session_state.username).execute().data
            if records:
                df_history = pd.DataFrame(records)
                
                with c_sort:
                    sort_hist_by = st.selectbox("Sort History By:", ["Date (Newest First)", "Date (Oldest First)", "Job Title (A-Z)", "Company (A-Z)", "Source"])
                
                if sort_hist_by == "Date (Newest First)" and "applied_date" in df_history.columns:
                    df_history = df_history.sort_values(by="applied_date", ascending=False)
                elif sort_hist_by == "Date (Oldest First)" and "applied_date" in df_history.columns:
                    df_history = df_history.sort_values(by="applied_date", ascending=True)
                elif sort_hist_by == "Job Title (A-Z)" and "job_title" in df_history.columns:
                    df_history = df_history.sort_values(by="job_title", ascending=True)
                elif sort_hist_by == "Company (A-Z)" and "company" in df_history.columns:
                    df_history = df_history.sort_values(by="company", ascending=True)
                elif sort_hist_by == "Source" and "source_type" in df_history.columns:
                    df_history = df_history.sort_values(by="source_type", ascending=True)

                st.dataframe(
                    df_history[['job_title', 'company', 'source_type', 'applied_date', 'job_url']], 
                    column_config={
                        "job_url": st.column_config.LinkColumn("Application Link"),
                        "job_title": "Job Title",
                        "company": "Company",
                        "source_type": "Source Platform",
                        "applied_date": "Logged Date"
                    },
                    use_container_width=True, 
                    hide_index=True
                )
            else:
                st.info("No applications logged yet.")
        except Exception as e:
            st.error(f"Could not load history: {e}")

# Footer for logged-in pages
if st.session_state.authenticated:
    st.markdown("<p style='text-align: center; color: #a0a0a8; font-size: 13px; margin-top: 30px;'>© 2026 All Rights Reserved by Himanshu Joshi from Atomic Solution</p>", unsafe_allow_html=True)