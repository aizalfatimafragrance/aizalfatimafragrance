import { GoogleGenAI } from '@google/genai'
import { writeFileSync } from 'fs'
const ai = new GoogleGenAI({ apiKey: process.env.NETLIFY_AI_GATEWAY_KEY, httpOptions: { baseUrl: process.env.NETLIFY_AI_GATEWAY_BASE_URL?.replace(/\/$/, '') } })
const style = 'Luxury perfume product photography, dramatic low-key studio lighting, deep black background with warm gold and amber rim light, subtle smoke, reflective black surface, ultra detailed, editorial, no text, no logos, no watermark.'
const jobs = {
  hero: 'Wide cinematic banner composition: an elegant faceted crystal perfume bottle with a heavy gold cap on the right third, golden oud wood chips, rose petals and amber resin around it, empty dark space on the left. ' + style,
  spray: 'A sleek tall rectangular glass spray perfume bottle with amber liquid and matte gold atomizer. ' + style,
  attar: 'A small ornate traditional Arabic attar oil bottle with gold filigree and a long glass dauber, deep amber oil, sandalwood pieces beside it. ' + style,
  booster: 'Three small modern glass perfume booster vials with gold caps, different amber and honey colored liquids, arranged in a trio. ' + style,
  signature: 'A bold dark smoked-glass square perfume bottle with a black and gold cap, masculine and powerful, icy blue reflections. ' + style,
  ice: 'A frosted glass perfume bottle with icy aqua tint, ice crystals and frost around the base, gold cap. ' + style,
}
await Promise.all(Object.entries(jobs).map(async ([name, prompt]) => {
  try {
    const r = await ai.models.generateContent({ model: 'gemini-3.1-flash-image', contents: prompt })
    for (const p of r.candidates?.[0]?.content?.parts ?? []) if (p.inlineData) { const ext = p.inlineData.mimeType?.includes('jpeg') ? 'jpg' : 'png'; writeFileSync(`public/img/${name}.${ext}`, Buffer.from(p.inlineData.data, 'base64')); console.log('ok', name, ext); return }
    console.log('noimg', name)
  } catch (e) { console.log('err', name, e.message) }
}))
