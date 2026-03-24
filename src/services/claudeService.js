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
  "additionalSections": [
    { "title": "CERTIFICATIONS", "bullets": ["AWS Certified Developer – 2022"] }
  ]
}

IMPORTANT RULES:
- Use first name + last name initial only (e.g., "John D.") — never full last name
- Keep "additionalSections" as empty array [] if no extra sections exist
- Keep "education" as empty array [] if not present in the original CV
- Preserve the candidate's authentic voice and real experience
- skillsTable rows should use category labels ending with colon (e.g., "Backend:")`;

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

  const text = message.content[0].text.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  return JSON.parse(text);
}
