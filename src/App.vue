<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

/* ---------- pages: click-based, no router needed ---------- */
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const page = ref('home')
function go(p) { page.value = p; menuOpen.value = false }

// Presentation demo mode: uses prepared sample responses and needs no API key or internet.
// This is intentionally a fixed example generator, not a live AI connection.
const demoPrompt = 'Create a beginner-friendly project plan for an AI system that detects plastic bottles on beaches.'
const aiPrompt = ref(demoPrompt)
const aiMode = ref('project-plan')
const aiResult = ref(`PROJECT: Clean Kadal — AI Plastic Bottle Detection

1. PROBLEM
Plastic bottles on beaches are difficult to count manually, making cleanup teams slower and progress hard to measure.

2. PROPOSED MVP
Build a camera-based demo that detects bottle-like objects in an image, draws bounding boxes, and records the number of detections. Treat results as a prototype and verify plastic vs. glass separately.

3. BASIC TECH STACK
• Frontend: Vue 3 for the dashboard
• Backend: Node.js + Express API
• AI: a pretrained object-detection model, evaluated on beach images
• Storage: JSON for a quick demo; a database can be added later

4. FOUR-WEEK PLAN
Week 1 — Collect sample images and define what counts as a bottle.
Week 2 — Run a pretrained detector and review false positives.
Week 3 — Connect detections to the dashboard and save counts.
Week 4 — Test in varied lighting, document limitations, and prepare the demo.

5. SUCCESS METRICS
Measure precision on a small, manually labelled test set, missed bottles, false detections, and processing time.

6. RISKS
Reflections, distance, occlusion, and glass bottles may confuse the detector. Clearly label this as an MVP and validate before using it for real cleanup decisions.

NEXT ACTION
Start with 50–100 labelled images and create a simple test table before training or fine-tuning any model.`)
const aiLoading = ref(false)
const aiError = ref('')
const aiSaved = ref(false)
const aiModes = [
  { value: 'project-plan', label: 'Project plan' },
  { value: 'brainstorm', label: 'Brainstorm ideas' },
  { value: 'explain', label: 'Explain simply' },
  { value: 'study-roadmap', label: 'Learning roadmap' },
]
const aiModeLabel = computed(() => aiModes.find((m) => m.value === aiMode.value)?.label || 'AI result')
const demoResponses = {
  'project-plan': `SAMPLE PROJECT PLAN — Clean Kadal

GOAL
Make a prototype that spots plastic-bottle-like objects in beach photos and helps a cleanup team track detections.

MVP FEATURES
1. Upload or capture an image.
2. Run a pretrained object detector.
3. Show bounding boxes and a bottle count.
4. Save results and compare test runs.

BUILD PLAN
Week 1: Gather and label sample photos.
Week 2: Test an existing model and record false positives.
Week 3: Connect the model output to the Vue dashboard.
Week 4: Test on new images and prepare a demo.

TECH STACK
Vue 3, Node.js/Express, a pretrained computer-vision model, and JSON or SQLite storage.

RISKS & TESTING
Reflections, small objects and glass bottles can cause errors. Evaluate on labelled images and report accuracy honestly.

NEXT STEP
Create a small labelled test set and decide how you will measure precision and missed detections.`,
  brainstorm: `SAMPLE BRAINSTORM — 5 practical directions

1. Beach Bottle Counter — detect bottle-like objects in photos and save counts.
2. Cleanup Heatmap — mark beach areas where detections are frequently found.
3. Before/After Tracker — compare photos taken before and after a cleanup.
4. Volunteer Task Board — let teams claim areas and record collected waste.
5. Low-Light Test Mode — evaluate how well detection works at different times of day.

RECOMMENDED FIRST BUILD
Start with the Beach Bottle Counter. It is the easiest to demonstrate and gives you testable metrics. Add the other features only after detection results are reliable.`,
  explain: `SIMPLE EXPLANATION — How an AI bottle detector works

Think of the model as a student who has practised looking at many labelled pictures. When you show it a new beach photo, it predicts where objects might be and gives each prediction a label and confidence score.

THE BASIC FLOW
1. The camera captures an image.
2. The model analyses the image.
3. It returns possible object labels and locations.
4. The website draws boxes and counts predictions.
5. A human checks mistakes and records the result.

IMPORTANT LIMITATION
A generic model may recognise a bottle without knowing whether it is plastic or glass. That distinction needs suitable training data or another verification step.`,
  'study-roadmap': `SAMPLE 4-WEEK LEARNING ROADMAP

WEEK 1 — Web basics
Learn Vue components, reactive data, forms and how a frontend sends an HTTP request.

WEEK 2 — Backend basics
Build an Express route, validate input, return JSON, and learn how the frontend handles errors.

WEEK 3 — AI integration
Try a pretrained image model on a small labelled dataset. Record true positives, false positives and missed detections.

WEEK 4 — Integration & demo
Connect the model output to the dashboard, save results, test edge cases and prepare a short demo.

DAILY ROUTINE
Spend 30 minutes learning, 45 minutes building, and 15 minutes writing down what worked and what failed.

DELIVERABLE
At the end, aim to show one complete flow: image → detections → dashboard → saved result.`,
}
async function generateWithAI() {
  const prompt = aiPrompt.value.trim()
  if (prompt.length < 10) { aiError.value = 'Enter at least 10 characters to generate the prepared example.'; return }
  aiLoading.value = true
  aiError.value = ''
  aiSaved.value = false
  // Brief delay for the demo animation; no remote request is made.
  await new Promise((resolve) => setTimeout(resolve, 450))
  const sample = demoResponses[aiMode.value] || demoResponses['project-plan']
  aiResult.value = `${sample}

DEMO PROMPT
${prompt}

NOTE: This is a prepared example response for demonstration. It was not generated by a live AI model.`
  aiLoading.value = false
}
function useAIExample() {
  aiPrompt.value = 'Create a beginner-friendly 4-week roadmap to build a Vue app with a Node.js backend.'
  aiMode.value = 'study-roadmap'
}
async function copyAIResult() {
  if (!aiResult.value.trim()) return
  try {
    await navigator.clipboard.writeText(aiResult.value)
    notify('Copied result to clipboard.')
  } catch (error) {
    notify('Clipboard access unavailable. Select and copy the result manually.')
  }
}
function saveAIResult() {
  if (!aiResult.value.trim()) return
  const heading = aiPrompt.value.trim().replace(/\s+/g, ' ').slice(0, 64) || aiModeLabel.value
  const note = {
    id: `ai-${Date.now().toString(36)}`,
    title: `${aiModeLabel.value}: ${heading}`,
    body: aiResult.value,
    tags: `AI generated, ${aiModeLabel.value}`,
    updated: Date.now(),
  }
  notes.value.push(note)
  activeId.value = note.id
  aiSaved.value = true
  notify('AI result saved to your notes.')
  go('workspace')
}
const menuOpen = ref(false)
const theme = ref('light')

/* ---------- data ---------- */
const chapters = [
  { title: 'Every thought deserves a place.', description: 'Write it down before it disappears. Keep quick thoughts, plans and ideas together in one calm workspace.' },
  { title: 'Find the signal in the noise.', description: 'Give every note a home. Browse your collection, filter by category and find what you need without digging.' },
  { title: 'A workspace that feels like yours.', description: 'Create, edit and remove notes in seconds. Your collection stays saved in your browser, ready for next time.' },
]
const bars = Array.from({ length: 28 }, (_, i) => i)

const mapNodes = [
  { id: 'a', label: 'Audience', x: 105, y: 78, w: 92 },
  { id: 'b', label: 'Budget', x: 415, y: 70, w: 80 },
  { id: 'c', label: 'Timeline', x: 88, y: 268, w: 90 },
  { id: 'd', label: 'Channels', x: 430, y: 270, w: 94 },
  { id: 'e', label: 'Risks', x: 260, y: 36, w: 70 },
]

const steps = [
  'Allow the microphone when your browser asks.',
  'Open the workspace and press Record voice. Press Stop when you are done.',
  'Review the transcript and tidy the generated note.',
  'Press Mind map to see how the ideas connect.',
]

const faqs = [
  { q: 'Which browsers support voice to notes?', a: 'Chrome and Edge work best, and Safari supports it too. Firefox does not support browser voice input yet. The first time you record, your browser asks for microphone permission, and you can change that later in the site settings.' },
  { q: 'Where are my notes stored?', a: 'When the backend is running, notes are stored with the local backend and are also backed up in your browser. Keep the backend data folder when moving your project to another computer.' },
  { q: 'How does the mind map get built?', a: 'Open a note and press Mind map. Notesboard finds the words you use most and links each one to the words that appear beside it. It runs on your device, so your text never leaves the browser.' },
  { q: 'Can I edit a note the AI wrote?', a: 'Yes. Generated notes are ordinary notes. Change the wording, move the checklist items or delete the whole thing. Your edits always win over a regenerate.' },
  { q: 'How do I set up AI Studio?', a: 'This version uses prepared sample answers for presentation mode and does not require an API key. Live AI integration can be restored later by connecting a valid provider key through the backend.' },
  { q: 'Does it work offline?', a: 'Writing, editing, mind maps and the prepared AI Studio demo responses work without an AI API key. Voice recording uses the speech service built into your browser, which usually needs a connection.' },
]

/* ---------- notebook scroll (home page) ---------- */
const stage = ref(null)
const progress = ref(0)
const activeChapter = computed(() => Math.min(2, Math.floor(progress.value * 3)))

const notebookStyle = computed(() => {
  const p = progress.value
  return {
    transform: `translate3d(0, ${-p * 5}vh, 0) scale(${1 + p * 2.7}) rotateX(${8 - p * 8}deg) rotateZ(${-3 + p * 3}deg)`,
    opacity: 1 - Math.max(0, p - 0.76) * 3.8,
  }
})
const chapterStyle = (index) => {
  const d = Math.abs(progress.value - (index + 0.5) / 3)
  return { opacity: Math.max(0, 1 - d * 5), transform: `translateY(${d * 50}px)` }
}
function updateScroll() {
  if (!stage.value) { progress.value = 0; return }
  const rect = stage.value.getBoundingClientRect()
  const distance = stage.value.offsetHeight - window.innerHeight
  progress.value = Math.max(0, Math.min(1, -rect.top / distance))
}
let ticking = false
function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => { updateScroll(); ticking = false })
}
function goTo(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

/* ---------- workspace: notes, voice, generation, mind map ---------- */
const notes = ref([])
const activeId = ref(null)
const query = ref('')
const listening = ref(false)
const interim = ref('')
const voiceError = ref('')
const speechSupported = ref(false)
const generated = ref(null)
const mapData = ref(null)
const toast = ref('')
let recognition = null
let toastTimer

const activeNote = computed(() => notes.value.find((n) => n.id === activeId.value) || null)
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return [...notes.value]
    .filter((n) => !q || (n.title + ' ' + n.body + ' ' + (n.tags || '')).toLowerCase().includes(q))
    .sort((a, b) => b.updated - a.updated)
})

function notify(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 3200)
}
function touch(n) { n.updated = Date.now() }
function preview(n) { return n.body.replace(/\s+/g, ' ').trim().slice(0, 70) || 'Empty note' }
function when(ts) {
  return new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Notes sync to the local Express backend. localStorage remains a safety backup.
let muteBackendSync = false
let syncTimer = null
let syncBusy = false
let syncAgain = false
let syncErrorShown = false

function normaliseNote(note) {
  const updated = Number(note.updated) || Date.parse(note.updated_at || note.created_at || '') || Date.now()
  return {
    id: String(note.id ?? Date.now().toString(36)),
    title: String(note.title || ''),
    body: String(note.body ?? note.content ?? ''),
    tags: String(note.tags ?? ''),
    updated,
  }
}

function readLocalBackup() {
  try {
    const raw = localStorage.getItem('nb-notes')
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.map(normaliseNote) : []
  } catch (e) { return [] }
}

async function syncNotesToBackend() {
  if (muteBackendSync) return
  if (syncBusy) { syncAgain = true; return }
  syncBusy = true
  try {
    const response = await fetch(`${API_BASE}/notes/sync`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: notes.value }),
    })
    if (!response.ok) throw new Error('Backend sync failed')
    syncErrorShown = false
  } catch (e) {
    if (!syncErrorShown) {
      notify('Backend not connected. Your notes are still backed up in this browser. Start the backend on port 3000.')
      syncErrorShown = true
    }
  } finally {
    syncBusy = false
    if (syncAgain) { syncAgain = false; queueBackendSync() }
  }
}

function queueBackendSync() {
  if (muteBackendSync) return
  clearTimeout(syncTimer)
  syncTimer = setTimeout(syncNotesToBackend, 550)
}

async function loadNotes() {
  const backup = readLocalBackup()
  try {
    const response = await fetch(`${API_BASE}/notes`)
    if (!response.ok) throw new Error('Could not load notes from backend')
    let records = await response.json()
    if (!Array.isArray(records)) records = records.notes || []

    // One-time migration: if the backend is empty, restore this browser's old notes to it.
    if (records.length === 0 && backup.length) {
      const migration = await fetch(`${API_BASE}/notes/sync`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: backup }),
      })
      if (migration.ok) records = backup
    }

    muteBackendSync = true
    notes.value = records.map(normaliseNote)
    activeId.value = [...notes.value].sort((a, b) => b.updated - a.updated)[0]?.id ?? null
    await nextTick()
    muteBackendSync = false
    try { localStorage.setItem('nb-notes', JSON.stringify(notes.value)) } catch (e) { /* backup unavailable */ }
    syncErrorShown = false
  } catch (e) {
    muteBackendSync = true
    notes.value = backup
    activeId.value = [...notes.value].sort((a, b) => b.updated - a.updated)[0]?.id ?? null
    await nextTick()
    muteBackendSync = false
    syncErrorShown = true
    notify('Backend not connected. Start it on port 3000; your browser backup is loaded for now.')
  }
}

watch(notes, () => {
  try { localStorage.setItem('nb-notes', JSON.stringify(notes.value)) } catch (e) { /* storage full or blocked */ }
  queueBackendSync()
}, { deep: true })
watch(activeId, () => { generated.value = null; mapData.value = null })
watch(page, () => stopVoice())

function newNote() {
  stopVoice()
  const n = { id: Date.now().toString(36), title: '', body: '', tags: '', updated: Date.now() }
  notes.value.push(n)
  activeId.value = n.id
  return n
}
function selectNote(id) { stopVoice(); activeId.value = id }
function removeNote(id) {
  if (!window.confirm('Delete this note? This cannot be undone.')) return
  stopVoice()
  notes.value = notes.value.filter((n) => n.id !== id)
  activeId.value = [...notes.value].sort((a, b) => b.updated - a.updated)[0]?.id ?? null
}

/* voice to notes (browser speech recognition) */
function appendText(text) {
  const n = activeNote.value
  if (!n) return
  let t = text.trim()
  t = t.charAt(0).toUpperCase() + t.slice(1)
  n.body = n.body && !/\s$/.test(n.body) ? n.body + ' ' + t : n.body + t
  touch(n)
}
function startVoice() {
  voiceError.value = ''
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) {
    voiceError.value = 'Voice input is not supported in this browser. Try Chrome, Edge or Safari.'
    return
  }
  if (!activeNote.value) newNote()
  recognition = new SR()
  recognition.lang = navigator.language || 'en-US'
  recognition.continuous = true
  recognition.interimResults = true
  recognition.onresult = (e) => {
    let finalText = ''
    let interimText = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i]
      if (r.isFinal) finalText += r[0].transcript
      else interimText += r[0].transcript
    }
    if (finalText.trim()) appendText(finalText)
    interim.value = interimText
  }
  recognition.onerror = (e) => {
    const blocked = 'Microphone access is blocked. Allow it from the lock icon in the address bar, then try again.'
    const messages = {
      'not-allowed': blocked,
      'service-not-allowed': blocked,
      'no-speech': 'No speech was heard. Press Record voice and try again.',
      'audio-capture': 'No microphone was found. Plug one in and try again.',
      network: 'Voice input needs an internet connection.',
    }
    voiceError.value = messages[e.error] || 'Voice input stopped (' + e.error + ').'
  }
  recognition.onend = () => { listening.value = false; interim.value = '' }
  try {
    recognition.start()
    listening.value = true
  } catch (e) {
    voiceError.value = 'Could not start the microphone. Try again.'
  }
}
function stopVoice() {
  if (recognition) { try { recognition.stop() } catch (e) { /* already stopped */ } recognition = null }
  listening.value = false
  interim.value = ''
}

/* text helpers (everything runs on the device, nothing is sent anywhere) */
const STOP = new Set(('a an the and or but if then so of to in on at for from with by about as is are was were be been being ' +
  'it its this that these those i me my we our you your he she they them his her their there here have has had do does did ' +
  'will would can could should may might not no yes just very really also than too into out up down over again more most some ' +
  'any each other such only own same um uh like okay yeah well need want get got make going gonna maybe thing things what when ' +
  'before after until while because since through between under around today tomorrow ' +
  "where which who how why all one two now still even much many don't it's i'm").split(' '))

function tokens(text) { return (text.toLowerCase().match(/[a-z][a-z'-]{2,}/g) || []).filter((w) => !STOP.has(w)) }
function cap(w) { return w.charAt(0).toUpperCase() + w.slice(1) }
function splitSentences(text) {
  return text.replace(/\s+/g, ' ').trim()
    .split(/(?<=[.!?])\s+/)
    .flatMap((s) => (s.split(' ').length > 18 ? s.split(/\s*,\s*|\s+(?:and then|then|also|and also|plus)\s+/i) : [s]))
    .map((s) => s.trim()).filter(Boolean)
}
function clean(s) {
  let t = s.replace(/\b(?:um+|uh+|erm|you know|i mean)\b,?\s*/gi, '')
    .replace(/^(?:so|and|but|also|okay|ok|yeah|well|like)\b,?\s+/i, '').trim()
  if (t.split(' ').length < 2) return ''
  t = t.charAt(0).toUpperCase() + t.slice(1)
  return /[.!?]$/.test(t) ? t : t + '.'
}

/* note generation: title, summary, to-do list */
function generate() {
  const n = activeNote.value
  if (!n) return
  const raw = n.body.trim()
  if (raw.split(/\s+/).length < 4) { notify('Type or record a few more words first.'); return }
  const sents = splitSentences(raw).map(clean).filter(Boolean)
  const actionRe = /\b(need to|have to|has to|must|should|remind me|don't forget|do not forget|remember to|todo|to do|book|send|call|email|buy|schedule|finish|check|follow up|prepare|submit|pay|order)\b/i
  const actions = sents.filter((s) => actionRe.test(s))
  const rest = sents.filter((s) => !actionRe.test(s))
  const base = rest.length ? rest : sents
  generated.value = {
    title: n.title.trim() || sents[0].replace(/[.!?]+$/, '').split(' ').slice(0, 6).join(' '),
    summary: base.slice(0, 2).join(' '),
    actions,
    points: base.slice(2),
  }
}
function applyGenerated() {
  const n = activeNote.value
  const g = generated.value
  if (!n || !g) return
  let body = g.summary
  if (g.actions.length) body += '\n\nTo do\n' + g.actions.map((a) => '- [ ] ' + a).join('\n')
  if (g.points.length) body += '\n\nDetails\n' + g.points.map((p) => '- ' + p).join('\n')
  n.title = g.title
  n.body = body
  touch(n)
  generated.value = null
  notify('Note replaced with the generated version.')
}

/* mind map: most-used words become branches, words that appear beside them become leaves */
function makeMap() {
  const n = activeNote.value
  if (!n) return
  const title = n.title.trim()
  const text = title + '. ' + n.body
  const freq = new Map()
  tokens(text).forEach((w) => freq.set(w, (freq.get(w) || 0) + 1))
  const ranked = [...freq.entries()].sort((a, b) => b[1] - a[1]).map((e) => e[0])
  if (ranked.length < 4) { notify('Write a few more sentences first, then make the map.'); return }
  const centerLabel = title ? title.split(/\s+/).slice(0, 4).join(' ') : cap(ranked[0])
  const topics = (title ? ranked : ranked.slice(1)).slice(0, 6)
  const sents = splitSentences(text).map(tokens)
  const cx = 430
  const cy = 230
  const branches = topics.map((t, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / topics.length
    const x = cx + 250 * Math.cos(a)
    const y = cy + 150 * Math.sin(a)
    const co = new Map()
    sents.filter((s) => s.includes(t)).forEach((s) => s.forEach((w) => {
      if (w !== t && !topics.includes(w)) co.set(w, (co.get(w) || 0) + freq.get(w))
    }))
    const words = [...co.entries()].sort((p, q) => q[1] - p[1]).slice(0, 2).map((e) => e[0])
    const leaves = words.map((w, k) => {
      const la = a + (words.length === 1 ? 0 : k === 0 ? -0.5 : 0.5)
      return {
        label: w,
        x: Math.max(12, Math.min(848, x + 105 * Math.cos(la))),
        y: Math.max(16, Math.min(444, y + 65 * Math.sin(la))),
        anchor: Math.cos(la) >= 0 ? 'start' : 'end',
      }
    })
    const label = cap(t)
    return { label, x, y, w: label.length * 8 + 30, leaves }
  })
  mapData.value = { center: { label: centerLabel, w: centerLabel.length * 9 + 44 }, branches }
}

/* ---------- theme ---------- */
function applyTheme(t) {
  theme.value = t
  document.documentElement.dataset.theme = t
  try { localStorage.setItem('nb-theme', t) } catch (e) { /* storage unavailable */ }
}
function toggleTheme() { applyTheme(theme.value === 'dark' ? 'light' : 'dark') }

/* ---------- fly-in reveal ---------- */
let observer
function observeReveals() {
  if (!observer) return
  document.querySelectorAll('.reveal:not(.is-in)').forEach((el) => observer.observe(el))
}
function onPageEntered() { updateScroll(); observeReveals() }

watch(page, () => {
  menuOpen.value = false
  window.scrollTo({ top: 0, behavior: 'instant' })
})

onMounted(() => {
  loadNotes()
  speechSupported.value = !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  let saved = null
  try { saved = localStorage.getItem('nb-theme') } catch (e) { /* ignore */ }
  applyTheme(saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))

  observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); observer.unobserve(e.target) }
    })
  }, { threshold: 0.28 })

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', updateScroll)
  nextTick(onPageEntered)
})

onBeforeUnmount(() => {
  clearTimeout(syncTimer)
  if (notes.value.length) syncNotesToBackend()
  stopVoice()
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', updateScroll)
  observer?.disconnect()
})
</script>

<template>
  <div class="site-shell">
    <header class="topbar">
      <a class="wordmark" href="#" @click.prevent="go('home')" aria-label="Notesboard home">
        <span class="brand-mark">N</span>
        <span>notesboard</span>
      </a>

      <nav class="desktop-nav" aria-label="Main">
        <a href="#" @click.prevent="go('home')" :class="{ active: page === 'home' }">Home</a>
        <a href="#" @click.prevent="go('features')" :class="{ active: page === 'features' }">Features</a>
        <a href="#" @click.prevent="go('workspace')" :class="{ active: page === 'workspace' }">Workspace</a>
        <a href="#" @click.prevent="go('ai')" :class="{ active: page === 'ai' }">AI Studio</a>
        <a href="#" @click.prevent="go('help')" :class="{ active: page === 'help' }">Help</a>
      </nav>

      <div class="top-actions">
        <button class="icon-button" @click="toggleTheme" :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
          <svg v-if="theme === 'dark'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>
        </button>
        <a class="nav-cta" href="#" @click.prevent="go('workspace')">Try it now</a>
        <button class="icon-button menu-button" @click="menuOpen = !menuOpen" :aria-expanded="menuOpen" aria-label="Menu">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 8h16M4 16h16"/></svg>
        </button>
      </div>

      <nav v-if="menuOpen" class="mobile-nav" aria-label="Mobile">
        <a href="#" @click.prevent="go('home')" :class="{ active: page === 'home' }">Home</a>
        <a href="#" @click.prevent="go('features')" :class="{ active: page === 'features' }">Features</a>
        <a href="#" @click.prevent="go('workspace')" :class="{ active: page === 'workspace' }">Workspace</a>
        <a href="#" @click.prevent="go('ai')" :class="{ active: page === 'ai' }">AI Studio</a>
        <a href="#" @click.prevent="go('help')" :class="{ active: page === 'help' }">Help</a>
      </nav>
    </header>

    <main>
      <Transition name="page" mode="out-in" @after-enter="onPageEntered">
        <div v-if="page === 'home'" key="home">
    <section class="hero" id="home">
      <div class="hero-copy">
        <p class="hero-kicker"><span class="live-dot"></span> A quieter way to think</p>
        <h1>Make room<br />for your mind.</h1>
        <p class="hero-description">
          Talk, and your words become notes. Notes become a map of how your ideas connect.
          One calm place for everything you don't want to forget.
        </p>
        <div class="hero-actions">
          <button class="primary-button" @click="go('workspace')">Start a note</button>
          <button class="ghost-button" @click="go('features')">Explore features</button>
        </div>
      </div>

      <div class="hero-note" aria-label="A sample note">
        <div class="note-topline"><span>Field notes</span><span>Just now</span></div>
        <div class="scribble">Things worth<br />remembering.</div>
        <div class="note-rule"></div>
        <p>Good ideas don't always arrive when you have time to think.</p>
        <div class="note-bottom"><span>Personal</span><span class="note-wave"><i></i><i></i><i></i><i></i></span></div>
      </div>

      <div class="hero-bottom"><span>Less clutter, more clarity</span><span>Scroll to explore</span></div>
    </section>

    <section class="experience" id="experience" ref="stage">
      <div class="experience-sticky">
        <div class="experience-heading"><span>The notebook</span><span>Scroll to turn the page</span></div>

        <div class="notebook-wrap">
          <div class="notebook-shadow"></div>
          <div class="notebook" :style="notebookStyle">
            <div class="book-cover">
              <div class="cover-top"><span>No. 001</span><span>Est. today</span></div>
              <div class="cover-title">
                <span>Notes</span>
                <span class="cover-title-bottom">for later.</span>
              </div>
              <div class="cover-bottom"><span>Your thoughts,</span><span>all in one place.</span></div>
              <div class="book-spine"></div>
            </div>
            <div class="book-pages"></div>
          </div>
        </div>

        <div class="chapter-copy" aria-live="polite">
          <div v-for="(chapter, index) in chapters" :key="index" class="chapter" :style="chapterStyle(index)">
            <h2>{{ chapter.title }}</h2>
            <p>{{ chapter.description }}</p>
          </div>
        </div>

        <div class="progress-track"><span :style="{ width: `${Math.max(4, progress * 100)}%` }"></span></div>
        <span class="experience-counter">Page {{ activeChapter + 1 }} of 3</span>
      </div>
    </section>

    <section class="closing" id="start">
      <h2>Clear your head.<br />Keep the good stuff.</h2>
      <div class="closing-links">
        <a class="primary-button" href="#" @click.prevent="go('workspace')">Start a note</a>
        <a class="ghost-button" href="#" @click.prevent="go('help')">Get help</a>
      </div>
    </section>
        </div>

        <div v-else-if="page === 'features'" key="features">
    <section class="features-section" id="features">
      <div class="section-heading">
        <p class="section-label">What it does</p>
        <h2>Say it. Shape it.<br />See how it connects.</h2>
      </div>

      <!-- Feature 1: voice to notes -->
      <article class="feature">
        <div class="feature-text reveal fly-left">
          <h3>Voice to notes</h3>
          <p>Hands full? Just talk. Notesboard listens, writes down what you said and keeps your pauses and false starts out of the way.</p>
          <ul class="feature-points">
            <li>Live transcript while you speak</li>
            <li>Each sentence capitalised and ready to edit</li>
            <li>Saved as a note the moment you stop</li>
          </ul>
        </div>
        <div class="feature-visual reveal fly-right" aria-hidden="true">
          <div class="panel voice-panel">
            <div class="voice-top">
              <span class="rec-dot"></span><span>Recording</span><span class="voice-time">00:14</span>
            </div>
            <div class="wave">
              <i v-for="b in bars" :key="b" :style="{ '--i': b }"></i>
            </div>
            <p class="transcript">
              <span class="t-line t1">Remind me to send the draft to Priya</span>
              <span class="t-line t2">before Thursday, and book the room.</span>
            </p>
          </div>
        </div>
      </article>

      <!-- Feature 2: note generation -->
      <article class="feature feature-flip">
        <div class="feature-text reveal fly-right">
          <h3>Notes, written for you</h3>
          <p>Turn a rambling thought into something you can act on. Get a clear title, short summary and a checklist from whatever you give it.</p>
          <ul class="feature-points">
            <li>Summaries from voice, pasted text or a rough draft</li>
            <li>Action items pulled out as a checklist</li>
            <li>Regenerate or edit whenever you want</li>
          </ul>
        </div>
        <div class="feature-visual reveal fly-left" aria-hidden="true">
          <div class="panel gen-panel">
            <div class="gen-raw">
              <span class="panel-label">What you said</span>
              <p>uh so the draft for priya, thursday, also need a room, maybe the small one</p>
            </div>
            <div class="gen-arrow"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v15M6 13l6 6 6-6"/></svg></div>
            <div class="gen-note">
              <span class="panel-label">What you get</span>
              <h4 class="g1">Draft review with Priya</h4>
              <p class="g2">Send the draft before Thursday and reserve a room.</p>
              <ul>
                <li class="g3"><b></b>Send draft to Priya</li>
                <li class="g4"><b></b>Book the small meeting room</li>
              </ul>
            </div>
          </div>
        </div>
      </article>

      <!-- Feature 3: AI mind map -->
      <article class="feature">
        <div class="feature-text reveal fly-left">
          <h3>Mind maps with AI</h3>
          <p>See the shape of an idea. Pick any note and Notesboard maps the main topics and the words that sit beside them.</p>
          <ul class="feature-points">
            <li>One click from note to map</li>
            <li>Built from the words you use most</li>
            <li>Rebuild it any time after you edit</li>
          </ul>
        </div>
        <div class="feature-visual reveal fly-right" aria-hidden="true">
          <div class="panel map-panel">
            <svg viewBox="0 0 520 340" role="img">
              <path v-for="(n, i) in mapNodes" :key="'l' + n.id" class="map-line" pathLength="1"
                    :d="`M260 170 Q ${(260 + n.x) / 2} ${(170 + n.y) / 2 + (i % 2 ? 24 : -24)} ${n.x} ${n.y}`"
                    :style="{ '--d': i }" />
              <g class="map-node center">
                <rect x="198" y="148" width="124" height="44" rx="22" />
                <text x="260" y="175" text-anchor="middle">Launch plan</text>
              </g>
              <g v-for="(n, i) in mapNodes" :key="n.id" class="map-node" :style="{ '--d': i }">
                <rect :x="n.x - n.w / 2" :y="n.y - 17" :width="n.w" height="34" rx="17" />
                <text :x="n.x" :y="n.y + 5" text-anchor="middle">{{ n.label }}</text>
              </g>
            </svg>
          </div>
        </div>
      </article>

      <div class="also reveal fly-up">
        <p>Also in the box</p>
        <ul>
          <li><b>Search and filter.</b> Jump straight back to the note you wanted.</li>
          <li><b>Edit and remove.</b> Keep your workspace as current as your thinking.</li>
          <li><b>Saved in your browser.</b> A refresh never means starting over.</li>
        </ul>
      </div>
      <div class="feat-cta">
        <a class="primary-button" href="#" @click.prevent="go('workspace')">Try it in the workspace</a>
        <a class="text-link" href="#" @click.prevent="go('help')">Need a hand? Visit Help</a>
      </div>
    </section>
        </div>

        <div v-else-if="page === 'workspace'" key="workspace">
          <section class="ws">
            <aside class="ws-side">
              <div class="ws-side-top">
                <h2>Your notes</h2>
                <button class="primary-button small" @click="newNote">New note</button>
              </div>
              <input class="ws-search" type="search" v-model="query" placeholder="Search notes" aria-label="Search notes" />
              <ul class="ws-list" v-if="filtered.length">
                <li v-for="n in filtered" :key="n.id">
                  <button :class="{ on: n.id === activeId }" @click="selectNote(n.id)">
                    <strong>{{ n.title || 'Untitled note' }}</strong>
                    <span>{{ preview(n) }}</span>
                    <span v-if="n.tags" class="ws-list-tags">{{ n.tags }}</span>
                    <time>{{ when(n.updated) }}</time>
                  </button>
                </li>
              </ul>
              <p v-else class="ws-hint">{{ notes.length ? 'No notes match your search.' : 'No notes yet.' }}</p>
            </aside>

            <div class="ws-main">
              <template v-if="activeNote">
                <input class="ws-title" v-model="activeNote.title" @input="touch(activeNote)" placeholder="Title" aria-label="Note title" />

                <div class="ws-tags-editor">
                  <label for="note-tags">TAGS <span>Separate tags with commas</span></label>
                  <input id="note-tags" v-model="activeNote.tags" @input="touch(activeNote)" placeholder="e.g. college, project, ideas" aria-label="Note tags" />
                  <div v-if="activeNote.tags" class="tag-pills">
                    <span v-for="tag in activeNote.tags.split(',').map(t => t.trim()).filter(Boolean)" :key="tag">{{ tag }}</span>
                  </div>
                </div>

                <div class="ws-toolbar">
                  <button class="tool" :class="{ live: listening }" @click="listening ? stopVoice() : startVoice()">
                    <span v-if="listening" class="rec-dot"></span>{{ listening ? 'Stop recording' : 'Record voice' }}
                  </button>
                  <button class="tool" @click="generate">Generate note</button>
                  <button class="tool" @click="makeMap">Mind map</button>
                  <button class="tool danger" @click="removeNote(activeNote.id)">Delete</button>
                </div>

                <p v-if="voiceError" class="ws-alert" role="alert">{{ voiceError }}</p>
                <p v-else-if="!speechSupported" class="ws-hint">Voice recording needs Chrome, Edge or Safari. Typing, notes and mind maps work everywhere.</p>

                <textarea class="ws-body" v-model="activeNote.body" @input="touch(activeNote)" placeholder="Start typing, or press Record voice and speak." aria-label="Note text"></textarea>
                <p v-if="listening" class="ws-interim">Listening… {{ interim }}</p>

                <section v-if="generated" class="ws-panel">
                  <div class="ws-panel-head">
                    <h3>Generated note</h3>
                    <div class="ws-panel-actions">
                      <button class="tool" @click="applyGenerated">Replace my note</button>
                      <button class="tool" @click="generated = null">Dismiss</button>
                    </div>
                  </div>
                  <h4>{{ generated.title }}</h4>
                  <p>{{ generated.summary }}</p>
                  <ul v-if="generated.actions.length" class="ws-todo">
                    <li v-for="(a, i) in generated.actions" :key="i"><b></b>{{ a }}</li>
                  </ul>
                  <p class="ws-hint">Made on your device with simple rules. Check it before you replace your note.</p>
                </section>

                <section v-if="mapData" class="ws-panel">
                  <div class="ws-panel-head">
                    <h3>Mind map</h3>
                    <div class="ws-panel-actions">
                      <button class="tool" @click="makeMap">Rebuild</button>
                      <button class="tool" @click="mapData = null">Close</button>
                    </div>
                  </div>
                  <svg class="wm" viewBox="0 0 860 460" role="img" aria-label="Mind map of this note">
                    <g v-for="(b, i) in mapData.branches" :key="'l' + b.label">
                      <path class="wm-line" pathLength="1" :d="`M430 230 L ${b.x} ${b.y}`" :style="{ '--d': i }" />
                      <g v-for="l in b.leaves" :key="l.label">
                        <path class="wm-leaf-line" :d="`M${b.x} ${b.y} L ${l.x} ${l.y}`" />
                        <circle class="wm-dot" :cx="l.x" :cy="l.y" r="4" />
                        <text class="wm-leaf" :x="l.x + (l.anchor === 'start' ? 10 : -10)" :y="l.y + 4" :text-anchor="l.anchor">{{ l.label }}</text>
                      </g>
                    </g>
                    <g class="wm-node center">
                      <rect :x="430 - mapData.center.w / 2" y="208" :width="mapData.center.w" height="44" rx="22" />
                      <text x="430" y="235" text-anchor="middle">{{ mapData.center.label }}</text>
                    </g>
                    <g v-for="(b, i) in mapData.branches" :key="b.label" class="wm-node" :style="{ animationDelay: (0.3 + i * 0.1) + 's' }">
                      <rect :x="b.x - b.w / 2" :y="b.y - 17" :width="b.w" height="34" rx="17" />
                      <text :x="b.x" :y="b.y + 5" text-anchor="middle">{{ b.label }}</text>
                    </g>
                  </svg>
                </section>
              </template>

              <div v-else class="ws-empty">
                <h2>Write your first note</h2>
                <p>Type it out, or press record and just say it.</p>
                <div class="hero-actions">
                  <button class="primary-button" @click="newNote">New note</button>
                  <button class="ghost-button" @click="startVoice">Record a voice note</button>
                </div>
                <p v-if="voiceError" class="ws-alert" role="alert">{{ voiceError }}</p>
              </div>
            </div>
          </section>
        </div>

        <div v-else-if="page === 'ai'" key="ai" class="ai-page">
          <section class="ai-hero">
            <p class="section-label"><span class="live-dot"></span> AI STUDIO</p>
            <h1>Make your next idea<br /><span>more possible.</span></h1>
            <p class="ai-lead">Explore prepared example outputs for project plans, brainstorming, simple explanations and learning roadmaps. This presentation mode works without an API key; responses are samples, not live AI.</p>
          </section>

          <section class="ai-layout">
            <div class="ai-generator-panel panel">
              <div class="ai-panel-heading"><span class="ai-sparkle">✳</span><div><h2>What should we work on?</h2><p>Be specific about your goal and what kind of help you need.</p></div></div>
              <label class="ai-label" for="ai-mode">GENERATION TYPE</label>
              <select id="ai-mode" v-model="aiMode" class="ai-select">
                <option v-for="mode in aiModes" :key="mode.value" :value="mode.value">{{ mode.label }}</option>
              </select>
              <label class="ai-label" for="ai-prompt">YOUR PROMPT</label>
              <textarea id="ai-prompt" v-model="aiPrompt" class="ai-prompt" rows="7" maxlength="5000" placeholder="Example: I am a first-year AIML student. Help me design a low-cost AI device that detects plastic waste on beaches, including hardware, software, milestones and risks."></textarea>
              <div class="ai-prompt-meta"><span>Tip: include your goal, level and constraints.</span><span>{{ aiPrompt.length }}/5000</span></div>
              <button class="primary-button ai-generate-button" @click="generateWithAI" :disabled="aiLoading || aiPrompt.trim().length < 10">
                <span v-if="aiLoading" class="ai-loading-dot"></span>{{ aiLoading ? 'Generating…' : 'Generate with AI ↗' }}
              </button>
              <p class="ai-security-note"><span>♢</span> DEMO MODE: prepared sample answers — no API key or internet required.</p>
              <p v-if="aiError" class="ws-alert ai-error" role="alert">{{ aiError }}</p>
            </div>

            <aside class="ai-side-card">
              <div class="ai-orbit orbit-one"></div><div class="ai-orbit orbit-two"></div><div class="ai-orb">✳</div>
              <p class="section-label">A LITTLE GUIDANCE</p>
              <h3>Good prompts create better starting points.</h3>
              <p>Tell the AI what you want to achieve, who it is for, your experience level and any budget or time limits.</p>
              <div class="ai-example"><span>EXAMPLE PROMPT</span><p>“Create a beginner-friendly 4-week roadmap to build a Vue app with a Node.js backend.”</p><button class="text-link" type="button" @click="useAIExample">Use example ↗</button></div>
            </aside>
          </section>

          <section v-if="aiResult" class="ai-result panel" aria-live="polite">
            <div class="ai-result-heading"><div><p class="section-label">PREPARED DEMO RESPONSE · NOT LIVE AI</p><h2>{{ aiModeLabel }}<span class="result-period">.</span></h2></div><span class="ai-result-badge">READY</span></div>
            <div class="ai-result-text">{{ aiResult }}</div>
            <div class="ai-result-actions"><button class="primary-button" @click="saveAIResult">Save as note ↗</button><button class="ghost-button" @click="copyAIResult">Copy result</button><button class="tool" @click="generateWithAI" :disabled="aiLoading">Regenerate</button></div>
            <p v-if="aiSaved" class="ai-saved-note">Saved successfully.</p>
          </section>
        </div>

        <div v-else key="help">
    <section class="help-section" id="help">
      <div class="help-intro">
        <p class="section-label">Help</p>
        <h2>Stuck? Start here.</h2>
        <p class="help-lead">The basics take about three minutes. Everything else is in the questions on the right.</p>
        <ol class="help-steps">
          <li v-for="(s, i) in steps" :key="i">{{ s }}</li>
        </ol>
        <p class="help-contact">Can't find your answer? Write to <a href="mailto:help@notesboard.app">help@notesboard.app</a></p>
      </div>

      <div class="faq">
        <details v-for="(f, i) in faqs" :key="i" :open="i === 0">
          <summary>{{ f.q }}<span class="faq-icon" aria-hidden="true"></span></summary>
          <p>{{ f.a }}</p>
        </details>
      </div>
    </section>

        </div>
      </Transition>
    </main>

    <footer class="page-footer">
      <a class="wordmark" href="#" @click.prevent="go('home')"><span class="brand-mark">N</span><span>notesboard</span></a>
      <span>A little more room to think.</span>
      <a href="#" @click.prevent="go('help')">Help</a>
    </footer>

    <div v-if="toast" class="toast" role="status">{{ toast }}</div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap');

:root {
  --bg: #eef0f4;
  --surface: #fbfbfd;
  --ink: #12141c;
  --muted: #5d6272;
  --line: #d5d9e2;
  --accent: #2f45ff;
  --accent-ink: #ffffff;
  --stage: #0d1020;
  --stage-ink: #eceef6;
  --shadow: 0 30px 60px -30px rgba(18, 20, 28, .35);
  --display: 'Bricolage Grotesque', 'Helvetica Neue', sans-serif;
  --body: 'Instrument Sans', system-ui, sans-serif;
  color-scheme: light;
}
:root[data-theme='dark'] {
  --bg: #0b0d14;
  --surface: #151925;
  --ink: #eceef6;
  --muted: #9aa0b4;
  --line: #262b3b;
  --accent: #8c9cff;
  --accent-ink: #0b0d14;
  --stage: #07080d;
  --stage-ink: #eceef6;
  --shadow: 0 30px 60px -30px rgba(0, 0, 0, .8);
  color-scheme: dark;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; min-width: 320px; background: var(--bg); }
button, a, summary { font: inherit; }
a { color: inherit; text-decoration: none; }
button { cursor: pointer; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }

.site-shell {
  overflow: clip; background: var(--bg); color: var(--ink);
  font-family: var(--body); transition: background .35s, color .35s;
  -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
}
h1, h2, h3, h4 { font-family: var(--display); font-weight: 700; margin: 0; }

/* ---------- top bar ---------- */
.topbar {
  position: relative; height: 76px; padding: 0 6vw; display: flex; align-items: center;
  justify-content: space-between; border-bottom: 1px solid var(--line);
}
.wordmark { display: inline-flex; align-items: center; gap: 10px; font: 700 16px var(--display); letter-spacing: -.02em; }
.brand-mark {
  display: grid; place-items: center; width: 28px; height: 28px; border-radius: 8px;
  background: var(--accent); color: var(--accent-ink); font: 800 15px var(--display);
}
.desktop-nav { display: flex; gap: 32px; font-size: 14px; font-weight: 500; }
.desktop-nav a { color: var(--muted); transition: color .2s; padding: 6px 0; border-bottom: 2px solid transparent; }
.desktop-nav a:hover { color: var(--ink); }
.top-actions { display: flex; align-items: center; gap: 10px; }
.icon-button {
  width: 40px; height: 40px; display: grid; place-items: center; border-radius: 50%;
  border: 1px solid var(--line); background: transparent; color: var(--ink); transition: background .2s;
}
.icon-button:hover { background: var(--surface); }
.menu-button { display: none; }
.nav-cta, .primary-button {
  border: 0; border-radius: 999px; background: var(--ink); color: var(--bg);
  padding: 12px 20px; font-size: 14px; font-weight: 600; transition: transform .2s, background .2s, color .2s;
}
.nav-cta:hover, .primary-button:hover { background: var(--accent); color: var(--accent-ink); }
.primary-button { padding: 15px 26px; font-size: 15px; }
.mobile-nav {
  position: absolute; top: 76px; left: 0; right: 0; z-index: 20; display: flex; flex-direction: column;
  background: var(--surface); border-bottom: 1px solid var(--line);
}
.mobile-nav a { padding: 16px 6vw; border-top: 1px solid var(--line); font-weight: 500; }

/* ---------- hero ---------- */
.hero { min-height: calc(100svh - 76px); padding: 10vh 8vw 60px; position: relative; display: flex; align-items: center; }
.hero-copy { position: relative; z-index: 2; width: 62%; padding-bottom: 4vh; }
.hero-kicker { display: flex; align-items: center; gap: 10px; margin: 0 0 26px; font-size: 14px; color: var(--muted); }
.live-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 5px color-mix(in srgb, var(--accent) 20%, transparent); }
.hero h1 { font-size: clamp(56px, 9vw, 132px); letter-spacing: -.055em; line-height: .94; font-weight: 800; }
.hero-description { max-width: 440px; color: var(--muted); font-size: 17px; line-height: 1.65; margin: 28px 0 32px; }
.hero-note {
  position: absolute; width: clamp(220px, 23vw, 320px); right: 9%; top: 17%;
  aspect-ratio: .8; padding: 22px; border-radius: 14px; background: var(--surface);
  border: 1px solid var(--line); box-shadow: var(--shadow); transform: rotate(4deg);
  display: flex; flex-direction: column; z-index: 1;
  animation: note-arrive 1s cubic-bezier(.2, .8, .2, 1);
}
@keyframes note-arrive { from { opacity: 0; transform: translate(30px, 40px) rotate(10deg); } to { opacity: 1; transform: rotate(4deg); } }
.note-topline, .note-bottom { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--muted); }
.scribble { font: 800 clamp(24px, 2.8vw, 36px)/1.05 var(--display); letter-spacing: -.04em; margin: auto 0 20px; }
.note-rule { border-top: 1px solid var(--line); }
.hero-note > p { font-size: 13px; line-height: 1.6; color: var(--muted); margin: 12px 0; }
.note-bottom { margin-top: auto; }
.note-wave { display: inline-flex; align-items: center; gap: 3px; height: 18px; }
.note-wave i { width: 3px; border-radius: 2px; background: var(--accent); animation: bob 1.2s ease-in-out infinite; }
.note-wave i:nth-child(1) { height: 8px; } .note-wave i:nth-child(2) { height: 16px; animation-delay: .15s; }
.note-wave i:nth-child(3) { height: 11px; animation-delay: .3s; } .note-wave i:nth-child(4) { height: 14px; animation-delay: .45s; }
@keyframes bob { 50% { transform: scaleY(.45); } }
.hero-bottom { position: absolute; bottom: 24px; left: 6vw; right: 6vw; display: flex; justify-content: space-between; font-size: 13px; color: var(--muted); }

/* ---------- notebook scroll stage ---------- */
.experience { height: 310vh; position: relative; background: var(--stage); color: var(--stage-ink); }
.experience-sticky { height: 100svh; min-height: 620px; position: sticky; top: 0; overflow: hidden; }
.experience-heading { position: absolute; top: 32px; left: 6vw; right: 6vw; z-index: 4; display: flex; justify-content: space-between; font-size: 13px; color: #9aa0b4; }
.notebook-wrap {
  position: absolute; top: 50%; left: 50%; width: min(32vw, 420px); min-width: 270px;
  aspect-ratio: .72; transform: translate(-50%, -50%); perspective: 1400px; z-index: 1;
}
.notebook { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; will-change: transform, opacity; }
.book-cover {
  height: 100%; width: 100%; position: absolute; z-index: 2; padding: 8%; overflow: hidden;
  background: linear-gradient(160deg, #232c6b, #141a45); color: #d8dcf0;
  border-radius: 4px 12px 12px 4px; display: flex; flex-direction: column;
  box-shadow: inset 10px 0 14px rgba(0, 0, 0, .35), inset -1px 0 1px rgba(255, 255, 255, .18);
}
.book-cover::before {
  content: ''; position: absolute; inset: 0; opacity: .12; pointer-events: none;
  background-image: repeating-linear-gradient(0deg, transparent 0 3px, #fff 4px), repeating-linear-gradient(90deg, transparent 0 3px, #fff 4px);
}
.cover-top, .cover-title, .cover-bottom { position: relative; z-index: 1; }
.cover-top, .cover-bottom { display: flex; justify-content: space-between; font-size: 10px; color: #98a0d0; }
.cover-title { margin: auto 0; display: flex; flex-direction: column; font: 800 clamp(44px, 6.6vw, 84px)/.88 var(--display); letter-spacing: -.06em; color: #e7e9f7; }
.cover-title-bottom { font-size: .56em; color: #aab3ee; letter-spacing: -.04em; }
.cover-bottom { border-top: 1px solid #4a5496; padding-top: 12px; }
.book-spine { position: absolute; top: 0; bottom: 0; left: 5%; width: 1px; background: rgba(255, 255, 255, .18); }
.book-pages {
  position: absolute; width: 98%; height: 99%; top: 5px; right: -8px; border-radius: 0 5px 5px 0;
  background: repeating-linear-gradient(90deg, #e8e8ee 0 2px, #b9bccb 3px, #e8e8ee 4px); transform: translateZ(-12px);
}
.notebook-shadow { position: absolute; inset: 15% -12% -4% 12%; background: #000; filter: blur(35px); opacity: .45; transform: translateZ(-40px); }
.chapter-copy { position: absolute; z-index: 3; left: 7vw; bottom: 13%; width: min(400px, 36vw); min-height: 180px; }
.chapter { position: absolute; bottom: 0; left: 0; width: 100%; transition: opacity .15s linear; }
.chapter h2 { font-size: clamp(28px, 3.4vw, 46px); line-height: 1.04; letter-spacing: -.04em; margin: 0 0 12px; font-weight: 800; }
.chapter p { color: #b3b8cc; font-size: 15px; line-height: 1.7; max-width: 350px; margin: 0; }
.progress-track { position: absolute; bottom: 40px; left: 7vw; right: 7vw; height: 2px; background: #2c3150; }
.progress-track span { display: block; height: 100%; background: var(--accent); transition: width .08s linear; }
.experience-counter { position: absolute; bottom: 54px; right: 7vw; font-size: 13px; color: #b3b8cc; }

/* ---------- features ---------- */
.features-section { padding: 90px 8vw 120px; }
.section-label { margin: 0 0 18px; font-size: 14px; font-weight: 600; color: var(--accent); }
.section-heading { margin-bottom: 90px; }
.section-heading h2, .help-intro h2, .closing h2 { font-size: clamp(44px, 6.6vw, 92px); letter-spacing: -.05em; line-height: .98; font-weight: 800; }

.feature { display: grid; grid-template-columns: 1fr 1.15fr; gap: 7vw; align-items: center; padding: 8vh 0; border-top: 1px solid var(--line); }
.feature-flip { grid-template-columns: 1.15fr 1fr; }
.feature-flip .feature-text { order: 2; }
.feature-text h3 { font-size: clamp(30px, 3.6vw, 50px); letter-spacing: -.04em; line-height: 1.02; margin-bottom: 18px; }
.feature-text > p { font-size: 17px; line-height: 1.65; color: var(--muted); margin: 0 0 24px; max-width: 460px; }
.feature-points { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.feature-points li { position: relative; padding-left: 26px; font-size: 15px; }
.feature-points li::before {
  content: ''; position: absolute; left: 0; top: 7px; width: 12px; height: 7px;
  border-left: 2px solid var(--accent); border-bottom: 2px solid var(--accent); transform: rotate(-45deg);
}

/* fly-in: one clear entrance, direction depends on side */
.reveal { opacity: 0; will-change: transform, opacity; transition: opacity .9s ease, transform 1.15s cubic-bezier(.16, 1, .3, 1); }
.fly-left { transform: translate3d(-16vw, 50px, 0) rotate(-2.5deg); }
.fly-right { transform: translate3d(16vw, 50px, 0) rotate(2.5deg); }
.fly-up { transform: translate3d(0, 70px, 0); }
.reveal.is-in { opacity: 1; transform: none; }
.feature-visual.reveal { transition-delay: .12s; }

.panel { background: var(--surface); border: 1px solid var(--line); border-radius: 20px; padding: 26px; box-shadow: var(--shadow); }
.panel-label { display: block; margin-bottom: 8px; font-size: 12px; font-weight: 600; color: var(--muted); }

/* voice */
.voice-top { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; }
.voice-time { margin-left: auto; color: var(--muted); font-variant-numeric: tabular-nums; }
.rec-dot { width: 10px; height: 10px; border-radius: 50%; background: #e5484d; animation: pulse 1.4s ease-in-out infinite; }
@keyframes pulse { 50% { box-shadow: 0 0 0 7px rgba(229, 72, 77, .18); } }
.wave { height: 110px; display: flex; align-items: center; justify-content: space-between; margin: 22px 0; }
.wave i { width: 5px; height: 100%; border-radius: 3px; background: var(--accent); transform: scaleY(.08); opacity: .35; transform-origin: center; }
.is-in .wave i { animation: voice 1.3s ease-in-out infinite; animation-delay: calc(var(--i) * -.11s); }
@keyframes voice { 0%, 100% { transform: scaleY(.12); opacity: .4; } 50% { transform: scaleY(calc(.3 + (var(--i) % 5) * .17)); opacity: 1; } }
.transcript { margin: 0; font-size: 16px; line-height: 1.6; min-height: 52px; }
.t-line { display: block; width: max-content; max-width: 100%; white-space: nowrap; overflow: hidden; clip-path: inset(0 100% 0 0); }
.is-in .t1 { animation: type 1.9s steps(36, end) .7s forwards; }
.is-in .t2 { animation: type 1.7s steps(34, end) 2.7s forwards; }
@keyframes type { to { clip-path: inset(0 0 0 0); } }

/* generation */
.gen-panel { display: grid; gap: 14px; }
.gen-raw p { margin: 0; padding: 14px 16px; border-radius: 12px; background: var(--bg); color: var(--muted); font-size: 14px; line-height: 1.55; font-style: italic; }
.gen-arrow { display: grid; place-items: center; color: var(--accent); }
.gen-note { padding: 18px; border-radius: 12px; border: 1px solid var(--accent); }
.gen-note h4 { font-size: 20px; letter-spacing: -.03em; margin-bottom: 6px; }
.gen-note p { margin: 0 0 12px; font-size: 14px; color: var(--muted); line-height: 1.5; }
.gen-note ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; font-size: 14px; }
.gen-note li { display: flex; align-items: center; gap: 10px; }
.gen-note li b { width: 16px; height: 16px; border-radius: 5px; border: 1.5px solid var(--accent); flex: none; }
.g1, .g2, .g3, .g4 { opacity: 0; transform: translateY(10px); }
.is-in .g1 { animation: line-in .6s ease 1s forwards; }
.is-in .g2 { animation: line-in .6s ease 1.5s forwards; }
.is-in .g3 { animation: line-in .6s ease 2s forwards; }
.is-in .g4 { animation: line-in .6s ease 2.4s forwards; }
@keyframes line-in { to { opacity: 1; transform: none; } }

/* mind map */
.map-panel { padding: 14px; }
.map-panel svg { display: block; width: 100%; height: auto; }
.map-line { fill: none; stroke: var(--line); stroke-width: 2; stroke-dasharray: 1; stroke-dashoffset: 1; }
:root[data-theme='dark'] .map-line { stroke: #3a4160; }
.is-in .map-line { animation: draw 1s ease forwards; animation-delay: calc(.6s + var(--d) * .22s); }
@keyframes draw { to { stroke-dashoffset: 0; } }
.map-node { opacity: 0; transform-box: fill-box; transform-origin: center; transform: scale(.4); }
.map-node rect { fill: var(--bg); stroke: var(--accent); stroke-width: 1.5; }
.map-node text { fill: var(--ink); font: 600 13px var(--body); }
.map-node.center rect { fill: var(--accent); }
.map-node.center text { fill: var(--accent-ink); font-size: 14px; }
.is-in .map-node { animation: pop .6s cubic-bezier(.3, 1.5, .5, 1) forwards; animation-delay: calc(1.1s + var(--d, 0) * .22s); }
.is-in .map-node.center { animation-delay: .35s; }
@keyframes pop { to { opacity: 1; transform: scale(1); } }

.also { margin-top: 60px; padding-top: 40px; border-top: 1px solid var(--line); }
.also > p { margin: 0 0 20px; font-size: 14px; font-weight: 600; color: var(--muted); }
.also ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; color: var(--muted); font-size: 15px; line-height: 1.6; }
.also b { display: block; color: var(--ink); font-family: var(--display); font-size: 18px; margin-bottom: 4px; }

/* ---------- help ---------- */
.help-section { padding: 120px 8vw; display: grid; grid-template-columns: 1fr 1.1fr; gap: 7vw; background: var(--surface); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.help-intro h2 { font-size: clamp(40px, 5vw, 68px); margin-bottom: 20px; }
.help-lead { color: var(--muted); font-size: 17px; line-height: 1.65; max-width: 400px; margin: 0 0 32px; }
.help-steps { margin: 0 0 32px; padding: 0; list-style: none; counter-reset: s; display: grid; gap: 14px; }
.help-steps li { counter-increment: s; display: flex; gap: 14px; align-items: baseline; font-size: 15px; line-height: 1.5; }
.help-steps li::before { content: counter(s); flex: none; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 50%; background: var(--accent); color: var(--accent-ink); font: 700 13px var(--display); }
.help-contact { font-size: 14px; color: var(--muted); }
.help-contact a { color: var(--ink); text-decoration: underline; text-underline-offset: 3px; }
.faq details { border-top: 1px solid var(--line); }
.faq details:last-child { border-bottom: 1px solid var(--line); }
.faq summary { list-style: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 22px 0; font: 600 18px var(--display); letter-spacing: -.02em; }
.faq summary::-webkit-details-marker { display: none; }
.faq-icon { position: relative; width: 14px; height: 14px; flex: none; }
.faq-icon::before, .faq-icon::after { content: ''; position: absolute; background: var(--ink); transition: transform .25s; }
.faq-icon::before { left: 0; right: 0; top: 6px; height: 2px; }
.faq-icon::after { top: 0; bottom: 0; left: 6px; width: 2px; }
.faq details[open] .faq-icon::after { transform: scaleY(0); }
.faq details p { margin: 0 0 24px; color: var(--muted); font-size: 15px; line-height: 1.7; max-width: 520px; animation: faq-open .35s ease; }
@keyframes faq-open { from { opacity: 0; transform: translateY(-6px); } }

/* ---------- closing + footer ---------- */
.closing { min-height: 70vh; background: var(--accent); color: var(--accent-ink); padding: 110px 8vw; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; gap: 40px; }
.closing .primary-button { background: var(--accent-ink); color: var(--accent); }
.closing .primary-button:hover { background: var(--ink); color: var(--bg); }
.page-footer { min-height: 85px; padding: 20px 6vw; display: flex; align-items: center; justify-content: space-between; gap: 20px; font-size: 13px; color: var(--muted); }

/* ---------- responsive ---------- */
@media (max-width: 900px) {
  .feature, .feature-flip, .help-section { grid-template-columns: 1fr; gap: 40px; }
  .feature-flip .feature-text { order: 0; }
  .also ul { grid-template-columns: 1fr; gap: 22px; }
}
@media (max-width: 700px) {
  .topbar { height: 66px; padding: 0 5vw; }
  .mobile-nav { top: 66px; }
  .desktop-nav, .nav-cta { display: none; }
  .menu-button { display: grid; }
  .hero { min-height: calc(100svh - 66px); padding: 70px 7vw 90px; align-items: flex-start; }
  .hero-copy { width: 100%; }
  .hero h1 { font-size: clamp(50px, 14vw, 88px); }
  .hero-description { font-size: 15px; }
  .hero-note { width: 190px; top: auto; bottom: 90px; right: 8%; padding: 16px; }
  .experience { height: 280vh; }
  .experience-sticky { min-height: 650px; }
  .notebook-wrap { width: 55vw; min-width: 210px; top: 37%; }
  .chapter-copy { left: 7vw; right: 7vw; bottom: 12%; width: auto; }
  .chapter h2 { font-size: 30px; }
  .chapter p { font-size: 14px; max-width: 320px; }
  .features-section { padding: 90px 6vw 80px; }
  .section-heading { margin-bottom: 50px; }
  .fly-left { transform: translate3d(-40px, 40px, 0) rotate(-2deg); }
  .fly-right { transform: translate3d(40px, 40px, 0) rotate(2deg); }
  .help-section { padding: 80px 6vw; }
  .closing { padding: 80px 7vw; }
  .page-footer { flex-wrap: wrap; padding: 25px 6vw; }
  .page-footer > span { order: 3; width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .reveal { opacity: 1; transform: none; }
  .t-line { clip-path: none; }
  .g1, .g2, .g3, .g4, .map-node { opacity: 1; transform: none; }
  .map-line { stroke-dashoffset: 0; }
  .wave i { transform: scaleY(.6); opacity: 1; }
}

/* ---------- pages & routing ---------- */
a.primary-button, a.ghost-button { display: inline-block; }
.desktop-nav a.active { color: var(--ink); border-bottom-color: var(--accent); }
.mobile-nav a.active { color: var(--accent); }
.page-enter-active, .page-leave-active { transition: opacity .25s ease; }
.page-enter-from, .page-leave-to { opacity: 0; }
.closing-links { display: flex; flex-wrap: wrap; gap: 12px; }
.ghost-button { border: 1.5px solid currentColor; border-radius: 999px; padding: 13px 26px; font-size: 15px; font-weight: 600; color: inherit; transition: background .2s, color .2s; }
.ghost-button:hover { background: var(--accent-ink); color: var(--accent); }
.text-link { display: inline-block; margin-top: 40px; font-weight: 600; text-decoration: underline; text-underline-offset: 4px; }
.help-section { border-top: 0; min-height: calc(100svh - 161px); align-content: start; }
a.nav-cta { display: inline-block; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; }
.hero-actions .ghost-button { background: transparent; color: var(--ink); }
.hero-actions .ghost-button:hover { background: var(--ink); color: var(--bg); }
/* ---------- workspace ---------- */
.feat-cta { display: flex; align-items: center; flex-wrap: wrap; gap: 28px; margin-top: 40px; }
.feat-cta .text-link { margin-top: 0; }
.ws { display: grid; grid-template-columns: 320px 1fr; min-height: calc(100svh - 161px); }
.ws-side { display: flex; flex-direction: column; gap: 16px; padding: 28px 24px; background: var(--surface); border-right: 1px solid var(--line); min-width: 0; }
.ws-side-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.ws-side-top h2 { font-size: 22px; letter-spacing: -.03em; }
.primary-button.small { padding: 9px 16px; font-size: 13px; }
.ws-search, .ws-body {
  width: 100%; border: 1px solid var(--line); background: var(--bg); color: var(--ink);
  font: inherit; font-size: 14px; border-radius: 10px; padding: 11px 14px;
}
.ws-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; overflow-y: auto; max-height: 60vh; }
.ws-list button { width: 100%; text-align: left; display: grid; gap: 3px; padding: 12px 14px; border-radius: 10px; border: 1px solid transparent; background: transparent; color: var(--ink); }
.ws-list button:hover { background: var(--bg); }
.ws-list button.on { background: var(--bg); border-color: var(--accent); }
.ws-list strong { font: 600 15px var(--display); }
.ws-list span { font-size: 13px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ws-list time { font-size: 12px; color: var(--muted); }
.ws-main { display: flex; flex-direction: column; gap: 14px; padding: 32px 5vw 60px; min-width: 0; }
.ws-title { width: 100%; border: 0; background: transparent; color: var(--ink); padding: 0; font: 800 clamp(28px, 3.4vw, 44px) var(--display); letter-spacing: -.04em; }
.ws-title::placeholder { color: var(--muted); opacity: .6; }
.ws-toolbar { display: flex; flex-wrap: wrap; gap: 8px; }
.tool { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); color: var(--ink); font-size: 14px; font-weight: 600; transition: border-color .2s, background .2s; }
.tool:hover { border-color: var(--accent); }
.tool.live { background: #e5484d; border-color: #e5484d; color: #fff; }
.tool.live .rec-dot { background: #fff; }
.tool.danger { margin-left: auto; color: #e5484d; }
.ws-body { min-height: 260px; resize: vertical; background: var(--surface); border-radius: 14px; font-size: 16px; line-height: 1.7; padding: 20px; }
.ws-interim { margin: 0; font-size: 14px; color: var(--muted); font-style: italic; }
.ws-hint { margin: 0; font-size: 13px; line-height: 1.5; color: var(--muted); }
.ws-alert { margin: 0; padding: 12px 14px; border-radius: 10px; font-size: 14px; background: color-mix(in srgb, #e5484d 12%, transparent); color: var(--ink); border: 1px solid color-mix(in srgb, #e5484d 40%, transparent); }
.ws-panel { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 22px; display: grid; gap: 10px; }
.ws-panel-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
.ws-panel-head h3 { font-size: 18px; letter-spacing: -.02em; }
.ws-panel-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.ws-panel h4 { font-size: 22px; letter-spacing: -.03em; }
.ws-panel p { margin: 0; line-height: 1.6; color: var(--muted); }
.ws-todo { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; font-size: 15px; }
.ws-todo li { display: flex; align-items: center; gap: 10px; }
.ws-todo b { width: 16px; height: 16px; flex: none; border-radius: 5px; border: 1.5px solid var(--accent); }
.ws-empty { margin: auto; max-width: 420px; text-align: center; display: grid; gap: 14px; justify-items: center; }
.ws-empty h2 { font-size: 32px; letter-spacing: -.04em; }
.ws-empty p { margin: 0; color: var(--muted); }
.ws-empty .hero-actions { justify-content: center; }
.wm { display: block; width: 100%; height: auto; overflow: visible; }
.wm-line { fill: none; stroke: var(--accent); stroke-width: 2; opacity: .55; stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw .8s ease forwards; animation-delay: calc(var(--d) * .12s); }
.wm-leaf-line { fill: none; stroke: var(--line); stroke-width: 1.5; }
.wm-dot { fill: var(--accent); }
.wm-leaf { fill: var(--muted); font: 500 13px var(--body); }
.wm-node { transform-box: fill-box; transform-origin: center; animation: wm-pop .5s cubic-bezier(.3, 1.5, .5, 1) both; }
.wm-node rect { fill: var(--bg); stroke: var(--accent); stroke-width: 1.5; }
.wm-node text { fill: var(--ink); font: 600 14px var(--body); }
.wm-node.center rect { fill: var(--accent); }
.wm-node.center text { fill: var(--accent-ink); }
@keyframes wm-pop { from { opacity: 0; transform: scale(.5); } to { opacity: 1; transform: scale(1); } }
.toast { position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 50; padding: 12px 20px; border-radius: 999px; background: var(--ink); color: var(--bg); font-size: 14px; font-weight: 500; box-shadow: var(--shadow); }
@media (max-width: 900px) {
  .ws { grid-template-columns: 1fr; }
  .ws-side { border-right: 0; border-bottom: 1px solid var(--line); }
  .ws-list { max-height: 220px; }
  .ws-main { padding: 28px 6vw 50px; }
}
@media (prefers-reduced-motion: reduce) {
  .wm-line { stroke-dashoffset: 0; animation: none; }
  .wm-node { animation: none; }
}


/* ---------- AI Studio: dedicated server-backed generation page ---------- */
.ai-page { min-height: calc(100svh - 161px); padding-bottom: 90px; }
.ai-hero { padding: 82px 8vw 48px; background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 7%, var(--bg)), var(--bg) 65%); }
.ai-hero .section-label { display: flex; align-items: center; gap: 10px; margin-bottom: 22px; }
.ai-hero h1 { font-size: clamp(44px, 7vw, 88px); line-height: .98; letter-spacing: -.055em; }
.ai-hero h1 span { color: var(--accent); }
.ai-lead { max-width: 670px; margin: 24px 0 0; color: var(--muted); font-size: 17px; line-height: 1.7; }
.ai-layout { padding: 0 8vw; display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(260px, .8fr); gap: 28px; align-items: stretch; }
.ai-generator-panel { display: grid; align-content: start; gap: 12px; border-radius: 24px; }
.ai-panel-heading { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 14px; }
.ai-sparkle { display: grid; place-items: center; flex: none; width: 44px; height: 44px; border-radius: 14px; background: var(--accent); color: var(--accent-ink); font-size: 23px; box-shadow: 0 10px 30px color-mix(in srgb, var(--accent) 28%, transparent); }
.ai-panel-heading h2 { font-size: 25px; letter-spacing: -.035em; }
.ai-panel-heading p { margin: 6px 0 0; color: var(--muted); line-height: 1.5; font-size: 14px; }
.ai-label { margin-top: 8px; font-size: 11px; letter-spacing: .12em; font-weight: 700; color: var(--muted); }
.ai-select, .ai-prompt { width: 100%; border: 1px solid var(--line); background: var(--bg); color: var(--ink); border-radius: 12px; font: inherit; padding: 13px 15px; outline-offset: 3px; }
.ai-select { min-height: 48px; }
.ai-prompt { line-height: 1.7; resize: vertical; min-height: 150px; }
.ai-prompt-meta { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; color: var(--muted); font-size: 12px; }
.ai-generate-button { justify-self: start; margin-top: 8px; display: inline-flex; align-items: center; gap: 10px; }
.primary-button:disabled, .tool:disabled { opacity: .55; cursor: not-allowed; }
.ai-security-note { margin: 4px 0 0; color: var(--muted); font-size: 12px; display: flex; gap: 8px; align-items: center; }
.ai-security-note span { color: var(--accent); font-size: 17px; }
.ai-loading-dot { width: 10px; height: 10px; display: inline-block; border-radius: 50%; background: currentColor; animation: ai-pulse .75s ease-in-out infinite alternate; }
@keyframes ai-pulse { to { opacity: .25; transform: scale(.65); } }
.ai-side-card { min-height: 100%; position: relative; overflow: hidden; padding: 36px 30px; border-radius: 24px; background: var(--stage); color: var(--stage-ink); box-shadow: var(--shadow); isolation: isolate; }
.ai-side-card .section-label { color: #aeb7ff; margin: 22px 0 14px; font-size: 11px; letter-spacing: .13em; }
.ai-side-card h3 { position: relative; z-index: 2; font-size: clamp(26px, 3vw, 37px); letter-spacing: -.04em; line-height: 1.08; max-width: 360px; }
.ai-side-card > p:not(.section-label) { position: relative; z-index: 2; color: #b8bed1; line-height: 1.65; font-size: 14px; }
.ai-orb { position: relative; z-index: 2; width: 58px; height: 58px; display: grid; place-items: center; border-radius: 20px; color: white; font-size: 28px; background: linear-gradient(135deg, #5a6bff, #9b6bff 70%, #d084ff); box-shadow: 0 0 55px rgba(106, 108, 255, .48); animation: orb-rotate 10s linear infinite; }
@keyframes orb-rotate { to { transform: rotate(360deg); } }
.ai-orbit { position: absolute; z-index: 0; right: -80px; top: 15px; width: 300px; height: 170px; border: 1px solid rgba(153, 161, 255, .18); border-radius: 50%; transform: rotate(-30deg); }
.orbit-two { right: -40px; top: 45px; transform: rotate(35deg); border-color: rgba(153, 161, 255, .11); }
.ai-example { position: relative; z-index: 2; margin-top: 34px; border-radius: 16px; padding: 19px; border: 1px solid rgba(255,255,255,.16); background: rgba(255,255,255,.055); backdrop-filter: blur(10px); }
.ai-example > span { color: #aeb7ff; letter-spacing: .13em; font-size: 10px; font-weight: 700; }
.ai-example p { margin: 10px 0 12px; color: #f0f1fa; font-size: 14px; line-height: 1.65; }
.ai-example .text-link { padding: 0; margin: 0; border: 0; color: #c2c8ff; background: transparent; cursor: pointer; font-size: 13px; }
.ai-result { margin: 32px 8vw 0; padding: 30px; border-radius: 24px; }
.ai-result-heading { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
.ai-result-heading .section-label { margin: 0 0 8px; font-size: 11px; letter-spacing: .13em; }
.ai-result-heading h2 { font-size: clamp(26px, 4vw, 42px); letter-spacing: -.04em; }
.result-period { color: var(--accent); }
.ai-result-badge { font-size: 10px; letter-spacing: .1em; border: 1px solid color-mix(in srgb, #269e70 45%, var(--line)); color: #269e70; border-radius: 999px; padding: 8px 11px; font-weight: 700; }
.ai-result-text { margin: 24px 0; padding: 24px; white-space: pre-wrap; overflow-wrap: anywhere; border-radius: 16px; background: var(--bg); color: var(--ink); line-height: 1.8; font-size: 15px; }
.ai-result-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
.ai-result-actions .ghost-button { color: var(--ink); }
.ai-saved-note { color: #269e70; font-size: 13px; margin: 15px 0 0; }
.ai-error { margin-top: 5px; }

/* Tags in the editor and note list */
.ws-tags-editor { display: grid; gap: 8px; margin: 2px 0 7px; }
.ws-tags-editor label { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; font-size: 11px; font-weight: 700; letter-spacing: .1em; color: var(--muted); }
.ws-tags-editor label span { letter-spacing: 0; text-transform: none; font-weight: 400; }
.ws-tags-editor input { width: 100%; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); color: var(--ink); font: inherit; font-size: 14px; padding: 11px 14px; }
.tag-pills { display: flex; gap: 6px; flex-wrap: wrap; }
.tag-pills span { border-radius: 999px; border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--line)); background: color-mix(in srgb, var(--accent) 8%, var(--surface)); color: var(--accent); padding: 4px 9px; font-size: 11px; }
.ws-list-tags { display: block; color: var(--accent) !important; font-size: 11px !important; }

/* Lightweight 3D depth and motion, respecting reduced-motion settings */
.hero-note { transform-style: preserve-3d; will-change: transform; transition: transform .45s cubic-bezier(.2,.8,.2,1), box-shadow .45s; }
.hero-note > * { transform: translateZ(10px); }
.hero-note:hover { transform: perspective(900px) rotateX(-5deg) rotateY(8deg) rotateZ(1deg) translateY(-7px); box-shadow: 0 40px 80px -34px rgba(18, 20, 28, .48); }
.panel, .ai-side-card { transform-style: preserve-3d; transition: transform .4s cubic-bezier(.2,.8,.2,1), box-shadow .4s; }
.panel:hover { transform: perspective(1200px) rotateX(1deg) rotateY(-.7deg) translateY(-3px); box-shadow: 0 34px 70px -38px rgba(18, 20, 28, .44); }
.ai-side-card:hover { transform: perspective(1000px) rotateY(-2deg) rotateX(1deg) translateY(-3px); }
.ai-generator-panel, .ai-result { animation: ai-enter .55s cubic-bezier(.16,1,.3,1) both; }
@keyframes ai-enter { from { opacity: 0; transform: translateY(22px) rotateX(2deg); } to { opacity: 1; transform: none; } }
@media (max-width: 900px) {
  .ai-layout { grid-template-columns: 1fr; padding: 0 6vw; }
  .ai-hero { padding: 65px 6vw 38px; }
  .ai-side-card { min-height: auto; }
  .ai-result { margin: 28px 6vw 0; }
}
@media (max-width: 700px) {
  .ai-hero h1 { font-size: clamp(42px, 12vw, 68px); }
  .ai-lead { font-size: 15px; }
  .ai-generator-panel, .ai-result { padding: 20px; }
  .ai-result-text { padding: 17px; font-size: 14px; }
  .ai-result-actions > * { width: 100%; text-align: center; }
}
@media (prefers-reduced-motion: reduce) {
  .hero-note, .ai-orb { animation: none !important; }
  .hero-note:hover, .panel:hover, .ai-side-card:hover { transform: none; }
}

</style>
