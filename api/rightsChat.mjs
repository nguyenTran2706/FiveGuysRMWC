// Grounded answer pipeline. Retrieval and refusal are deterministic here; the model
// only ever rephrases passages that retrieval already selected.
import { retrieve, knowledgeBase } from '../src/lib/retrieval.mjs';

const REFUSAL = {
  en: 'I can only answer from the Fair Work Ombudsman information in this app, and I could not find anything about that. Here are topics I do cover. For anything else, call the Fair Work Infoline on 13 13 94, or the Refugee and Migrant Workers Centre on 1300 513 107 for help with your own case.',
  vi: 'Tôi chỉ có thể trả lời dựa trên thông tin của Fair Work Ombudsman trong ứng dụng này, và tôi không tìm thấy nội dung nào về điều đó. Dưới đây là những chủ đề tôi có. Với các câu hỏi khác, hãy gọi Fair Work Infoline 13 13 94, hoặc Refugee and Migrant Workers Centre 1300 513 107 để được giúp về trường hợp của bạn.',
};

const GREETING = {
  en: 'Hello. I can answer questions about workplace rights in Australia using Fair Work Ombudsman information — pay, leave, ending employment, protections at work, and rights for visa holders. What would you like to know?',
  vi: 'Xin chào. Tôi có thể trả lời các câu hỏi về quyền tại nơi làm việc ở Úc dựa trên thông tin của Fair Work Ombudsman — tiền lương, ngày nghỉ, kết thúc việc làm, bảo vệ tại nơi làm việc, và quyền của người giữ visa. Bạn muốn biết điều gì?',
};

const GREETING_PATTERN = /^(hi|hey|hello|hallo|yo|good\s*(morning|afternoon|evening|day)|thanks|thank\s*you|ta|ok|okay|xin\s*ch[àa]o|ch[àa]o( b[ạa]n| anh| ch[ịi])?|c[ảa]m\s*[ơo]n|h[ĩi])[\s!.,?]*$/i;

export function isGreeting(question) {
  return GREETING_PATTERN.test(String(question ?? '').trim());
}

export function buildPrompt(question, language, passages) {
  const languageName = language === 'vi' ? 'Vietnamese' : 'English';
  const context = passages
    .map((passage, index) => `[${index + 1}] ${passage.title.en} (${passage.source.url})\n${passage.text.en}`)
    .join('\n\n');
  return {
    system: [
      'You answer questions about Australian workplace rights for migrant and refugee workers.',
      'You may ONLY use the numbered passages provided. They come from the Fair Work Ombudsman.',
      'Never add information, figures, deadlines, legal advice or opinions that are not in the passages.',
      'If the passages do not contain the answer, reply with exactly: INSUFFICIENT_CONTEXT',
      `Answer in ${languageName}, in plain language, at most 130 words. Do not invent links.`,
      'This is general information, not legal advice.',
    ].join(' '),
    user: `Passages:\n\n${context}\n\nQuestion: ${question}`,
  };
}

// Self-hosted llama.cpp server (OpenAI-compatible). No external service, no API key.
async function callLocalModel({ system, user }) {
  const url = process.env.MODEL_URL || 'http://127.0.0.1:8080/v1/chat/completions';
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        temperature: 0,
        max_tokens: 400,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      }),
      signal: AbortSignal.timeout(120000),
    });
  } catch {
    throw new Error('model_loading');
  }
  if (response.status === 503) throw new Error('model_loading');
  if (!response.ok) throw new Error('model_unavailable');
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

/** Answer a question strictly from the knowledge base. `callModel` is injectable for tests. */
export async function answerQuestion(question, language = 'en', callModel = callLocalModel) {
  const lang = language === 'vi' ? 'vi' : 'en';
  const { grounded, passages, suggestions } = retrieve(question ?? '');
  if (isGreeting(question)) {
    return { kind: 'greeting', grounded: false, answer: GREETING[lang], sources: [], suggestions, checked: knowledgeBase.checked };
  }
  if (!grounded) {
    return { kind: 'refusal', grounded: false, answer: REFUSAL[lang], sources: [], suggestions, checked: knowledgeBase.checked };
  }
  const answer = await callModel(buildPrompt(question, lang, passages));
  if (!answer || /INSUFFICIENT_CONTEXT/i.test(answer)) {
    return { kind: 'refusal', grounded: false, answer: REFUSAL[lang], sources: [], suggestions, checked: knowledgeBase.checked };
  }
  return {
    kind: 'answer',
    grounded: true,
    answer,
    sources: passages.map(passage => ({ title: passage.source.title, url: passage.source.url })),
    suggestions: [],
    checked: knowledgeBase.checked,
  };
}

export { REFUSAL, GREETING };
