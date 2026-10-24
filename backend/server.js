import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT || 3000)
const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'notes.json')

// Tiny .env reader so the backend needs no npm dependencies.
try {
  const envText = await fs.readFile(path.join(__dirname, '.env'), 'utf8')
  for (const line of envText.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (match && !match[1].startsWith('#') && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
    }
  }
} catch { /* .env is optional */ }

async function readNotes() {
  await fs.mkdir(DATA_DIR, { recursive: true })
  try {
    const parsed = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

async function writeNotes(notes) {
  await fs.mkdir(DATA_DIR, { recursive: true })
  const tempFile = `${DATA_FILE}.tmp`
  await fs.writeFile(tempFile, JSON.stringify(notes, null, 2), 'utf8')
  await fs.rename(tempFile, DATA_FILE)
}

function normaliseNote(input = {}, fallbackId) {
  const id = String(input.id ?? fallbackId ?? randomUUID()).trim() || randomUUID()
  return {
    id,
    title: String(input.title ?? '').slice(0, 500),
    body: String(input.body ?? input.content ?? '').slice(0, 200000),
    tags: String(input.tags ?? '').slice(0, 1000),
    updated: Number(input.updated) || Date.now(),
  }
}

function send(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Cache-Control': 'no-store',
  })
  res.end(data === undefined ? '' : JSON.stringify(data))
}

async function readBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > 1_000_000) throw Object.assign(new Error('Request body is too large.'), { status: 413 })
    chunks.push(chunk)
  }
  if (!chunks.length) return {}
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) }
  catch { throw Object.assign(new Error('Request body must be valid JSON.'), { status: 400 }) }
}

async function handle(req, res) {
  if (req.method === 'OPTIONS') return send(res, 204)
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  const pathname = decodeURIComponent(url.pathname)

  if (req.method === 'GET' && pathname === '/api/health') {
    return send(res, 200, { ok: true, service: 'notesboard-backend', storage: 'local JSON file' })
  }

  if (req.method === 'GET' && pathname === '/api/notes') {
    const q = String(url.searchParams.get('q') || '').trim().toLowerCase()
    let notes = await readNotes()
    if (q) notes = notes.filter(note => `${note.title} ${note.body} ${note.tags || ''}`.toLowerCase().includes(q))
    notes.sort((a, b) => Number(b.updated) - Number(a.updated))
    return send(res, 200, notes)
  }

  if (req.method === 'PUT' && pathname === '/api/notes/sync') {
    const body = await readBody(req)
    if (!Array.isArray(body.notes)) return send(res, 400, { error: 'Expected a notes array.' })
    const incoming = body.notes.map(note => normaliseNote(note))
    const seen = new Set()
    const unique = incoming.filter(note => {
      if (seen.has(note.id)) return false
      seen.add(note.id)
      return true
    })
    await writeNotes(unique)
    return send(res, 200, { ok: true, count: unique.length })
  }

  if (req.method === 'POST' && pathname === '/api/notes') {
    const body = await readBody(req)
    const notes = await readNotes()
    const note = normaliseNote(body)
    const index = notes.findIndex(item => item.id === note.id)
    if (index >= 0) notes[index] = note
    else notes.push(note)
    await writeNotes(notes)
    return send(res, index >= 0 ? 200 : 201, note)
  }

  const noteMatch = pathname.match(/^\/api\/notes\/([^/]+)$/)
  if (req.method === 'PUT' && noteMatch) {
    const body = await readBody(req)
    const notes = await readNotes()
    const note = normaliseNote({ ...body, id: noteMatch[1] }, noteMatch[1])
    const index = notes.findIndex(item => item.id === note.id)
    if (index >= 0) notes[index] = note
    else notes.push(note)
    await writeNotes(notes)
    return send(res, 200, note)
  }

  if (req.method === 'DELETE' && noteMatch) {
    const notes = await readNotes()
    const remaining = notes.filter(note => note.id !== noteMatch[1])
    await writeNotes(remaining)
    return send(res, 200, { ok: true, deleted: notes.length - remaining.length })
  }

  if (req.method === 'POST' && pathname === '/api/idea-coach') {
    const body = await readBody(req)
    const apiKey = process.env.GEMINI_API_KEY
    const idea = String(body.idea ?? body.prompt ?? '').trim()
    const mode = String(body.mode || 'project-plan')
    if (idea.length < 10) return send(res, 400, { error: 'Enter at least 10 characters so the AI has enough context.' })
    if (idea.length > 5000) return send(res, 400, { error: 'Prompt is too long. Please keep it under 5,000 characters.' })
    if (!apiKey) return send(res, 503, { error: 'AI is not configured. Create backend/.env and add GEMINI_API_KEY.' })
    const modeInstructions = {
      'project-plan': 'You are a practical project mentor for college students. Create a realistic, beginner-friendly project plan with problem, target users, core features, hardware/software, milestones, risks, estimated effort and a clear first step. Never claim an idea is patentable without a prior-art search.',
      'brainstorm': 'You are a creative but practical innovation coach. Generate a list of distinct ideas, explain what makes each useful, identify a simple prototype path and end by recommending the best one for a beginner with reasons.',
      'explain': 'You are a patient tutor. Explain the requested subject in plain language for a beginner, define jargon, use a relatable example, then give a short recap and 3 practice questions.',
      'study-roadmap': 'You are a practical learning mentor. Create a beginner-friendly roadmap with weekly milestones, concepts to learn, small practice tasks, a mini-project, recommended types of resources and a way to measure progress. Adapt it to the user constraints.',
    }
    const systemText = modeInstructions[mode] || modeInstructions['project-plan']
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(process.env.GEMINI_MODEL || 'gemini-3.8-flash')}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemText }] },
        contents: [{ role: 'user', parts: [{ text: idea }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 2200 },
      }),
    })
    const data = await response.json()
    if (!response.ok) return send(res, response.status, { error: data.error?.message || 'AI plan generation failed.' })
    const plan = (data.candidates?.[0]?.content?.parts || []).map(part => part.text || '').join('').trim()
    if (!plan) return send(res, 502, { error: 'The AI did not return a project plan.' })
    return send(res, 200, { plan })
  }

  return send(res, 404, { error: 'Route not found.' })
}

const server = http.createServer((req, res) => {
  handle(req, res).catch(error => {
    console.error('[backend error]', error)
    if (!res.headersSent) send(res, error.status || 500, { error: error.message || 'An internal server error occurred.' })
    else res.end()
  })
})

server.listen(PORT, () => {
  console.log(`Notesboard backend running at http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
  console.log(`Notes data: ${DATA_FILE}`)
})
