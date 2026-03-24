import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are an expert CV/resume editor. Your task is to modify a candidate's CV based on provided instructions.

INSTRUCTION TYPE DETECTION:
- If the instructions look like a job description (contains requirements, responsibilities, "we are looking for", "qualifications", "must have", etc.) → treat as JOB DESCRIPTION mode
- Otherwise → treat as DIRECT MODIFICATION mode

JOB DESCRIPTION MODE:
- Extract the key required skills, technologies, and competencies from the job description
- Organically embed them into the CV where relevant — reword existing bullet points, expand skills sections, adjust the title/summary to align
- Do NOT fabricate experience the candidate doesn't have. Only emphasize or reframe what is already there
- Ensure the CV reads naturally — not keyword-stuffed

DIRECT MODIFICATION MODE:
- Apply the instructions precisely (e.g., "add a summary", "reorder sections", "emphasize leadership experience")

OUTPUT FORMAT — return ONLY valid JSON, no markdown code blocks, no extra text:
{
  "name": "Firstname L.",
  "title": "Job Title / Specialization",
  "summary": ["Bullet point 1 about the candidate", "Bullet point 2..."],
  "skillsTable": [
    { "category": "Backend:", "items": "Node.js, Python, Go" },
    { "category": "Frontend:", "items": "React, TypeScript, CSS" }
  ],
  "employmentHistory": [
    { "period": "2020 – Present", "role": "Senior Developer at Company X" },
    { "period": "2017 – 2020", "role": "Developer at Company Y" }
  ],
  "education": [
    "Bachelor of Computer Science, University Name, 2017"
  ],
  "projects": [
    {
      "name": "Banking web app",
      "environment": "Web (Windows Chrome, Mac Safari)",
      "description": "The app helps users perform different banking operations such as currency changes.",
      "responsibilities": "Requirements analysis, test design, test execution, participating in stand-up meetings.",
      "testingTypes": "Functional, Regression, UI/UX, Confirmation, Exploratory"
    }
  ],
  "additionalSections": [
    { "title": "CERTIFICATIONS", "bullets": ["AWS Certified Developer – 2022"] }
  ],
  "languages": [
    { "language": "English", "level": "Upper-Intermediate" },
    { "language": "Ukrainian", "level": "Native" }
  ]
}

IMPORTANT RULES:
- Use first name + last name initial only (e.g., "John D.") — never full last name
- Keep "additionalSections" as empty array [] if no extra sections exist
- Keep "languages" as empty array [] if no languages are mentioned in the CV
- Keep "education" as empty array [] if not present in the original CV
- Keep "projects" as empty array [] if no project/experience details exist in the original CV
- Extract all projects from the EXPERIENCE section of the original CV into "projects"
- Each project must have: name, environment, description, responsibilities, testingTypes
- Preserve the candidate's authentic voice and real experience
- skillsTable rows should use category labels ending with colon (e.g., "Backend:")
- CRITICAL: all string values must be valid JSON — no unescaped quotes, no literal newlines inside strings`;

export async function processCV(apiKey, cvText, instructions, referenceText = '') {
  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const referenceSection = referenceText
    ? `REFERENCE CV — match this format exactly:\n---\n${referenceText}\n---\nUse the same section headings, bullet style, table structure, and tone as the reference above.\n\n`
    : '';

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `${referenceSection}ORIGINAL CV:\n${cvText}\n\nINSTRUCTIONS:\n${instructions}\n\nApply the instructions and return the result as JSON.`,
      },
    ],
  });

  let text = message.content[0].text.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Extract the outermost {...} block in case there's surrounding text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // fall through to error
      }
    }
    throw new Error('Could not parse the AI response. Try providing more detailed instructions or a full job description.');
  }
}
