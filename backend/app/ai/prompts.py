"""
app/ai/prompts.py
─────────────────────────────────────────────────────────────────────────────
Centralised, versioned prompt templates for every Gemini AI feature.
Keeping prompts here makes them easy to tune without touching business logic.
"""


# ─── Resume Parsing ───────────────────────────────────────────────────────────

RESUME_PARSE_PROMPT = """
You are an expert HR data extraction engine.
Extract the following information from the resume text below and return ONLY valid JSON.

Resume Text:
\"\"\"
{resume_text}
\"\"\"

Return a JSON object with these exact keys:
{{
  "name": "<full name or null>",
  "email": "<email or null>",
  "phone": "<phone number or null>",
  "summary": "<professional summary in 2-3 sentences or null>",
  "skills": ["<skill1>", "<skill2>", ...],
  "experience": [
    {{
      "company": "<company name>",
      "role": "<job title>",
      "start_date": "<start date string or null>",
      "end_date": "<end date or 'Present'>",
      "description": "<brief description>",
      "technologies": ["<tech1>", ...]
    }}
  ],
  "education": [
    {{
      "institution": "<institution name>",
      "degree": "<degree type>",
      "field_of_study": "<major or null>",
      "start_year": <year int or null>,
      "end_year": <year int or null>,
      "gpa": <float or null>
    }}
  ],
  "projects": [
    {{
      "name": "<project name>",
      "description": "<brief description>",
      "technologies": ["<tech1>", ...],
      "url": "<url or null>"
    }}
  ],
  "certifications": ["<cert1>", "<cert2>", ...]
}}
"""


# ─── Resume Customiser ────────────────────────────────────────────────────────

RESUME_CUSTOMIZE_PROMPT = """
You are an expert ATS resume optimisation specialist.

Job Description:
\"\"\"
{job_description}
\"\"\"

Candidate's Current Resume:
\"\"\"
{resume_text}
\"\"\"

Task:
1. Rewrite the resume to be highly optimised for the above job description.
2. Incorporate important keywords from the JD naturally.
3. Quantify achievements wherever possible.
4. Ensure ATS compatibility (avoid tables, graphics descriptions, unusual headings).
5. Return a JSON object with:
{{
  "optimized_resume_text": "<full rewritten resume as plain text>",
  "ats_score": <estimated ATS score 0-100>,
  "added_keywords": ["<kw1>", ...],
  "removed_weaknesses": ["<weakness description>", ...],
  "suggestions": ["<tip1>", "<tip2>", ...]
}}
"""


# ─── Email Generator ──────────────────────────────────────────────────────────

EMAIL_GENERATION_PROMPT = """
You are a professional career coach and email writing expert.

Write a compelling {email_type} email for the following context:
- Job Title: {job_title}
- Company: {company_name}
- Candidate Name: {candidate_name}
- Job Description Summary: {job_description}
- Extra Context: {extra_context}

Email types:
- application   : First-time job application cover email
- follow_up     : Following up on a submitted application (polite, professional)
- hr_outreach   : Cold outreach to an HR/recruiter at the company

Return a JSON object:
{{
  "subject": "<concise email subject line>",
  "body": "<full email body — use \\n for line breaks>"
}}
"""


# ─── Study Plan ───────────────────────────────────────────────────────────────

STUDY_PLAN_PROMPT = """
You are a senior tech mentor and career coach.

The candidate wants to become a {target_role} in {duration_days} days.
Their current skills: {current_skills}

Create a detailed, actionable {duration_days}-day study roadmap:
- Identify skill gaps
- Group into weekly themes
- Suggest specific resources (books, free courses, practice sites)
- Include daily tasks

Return a JSON object:
{{
  "missing_skills": ["<skill1>", ...],
  "plan": [
    {{
      "week": <week number>,
      "theme": "<week theme>",
      "days": "<e.g. Day 1-7>",
      "topics": ["<topic1>", ...],
      "tasks": ["<task description>", ...],
      "resources": ["<resource name / url>", ...]
    }}
  ],
  "raw_plan_text": "<human-readable full roadmap as plain text>"
}}
"""


# ─── Mock Interview ───────────────────────────────────────────────────────────

INTERVIEW_QUESTIONS_PROMPT = """
You are an experienced technical interviewer at a top tech company.

Generate {num_questions} interview questions for a {interview_type} interview
for the role: {job_title}.

{job_description_section}

Mix difficulty levels (easy/medium/hard) appropriately.
For "technical": focus on coding, system design, algorithms, and relevant tech stack.
For "hr": focus on behavioural, situational, culture fit.
For "mixed": include both.

Return a JSON object:
{{
  "questions": ["<question 1>", "<question 2>", ...]
}}
"""

EVALUATE_ANSWER_PROMPT = """
You are a strict but fair technical interviewer.

Interview Question: {question}
Candidate's Answer: {answer}
Role: {job_title}

Evaluate the answer and return a JSON object:
{{
  "evaluation": "<Excellent/Good/Average/Poor>",
  "score": <integer 0-10>,
  "feedback": "<constructive paragraph explaining the score>",
  "model_answer": "<an ideal answer to this question>"
}}
"""
