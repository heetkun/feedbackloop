import { useState } from 'react'

const API_KEY = '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'

export default function App() {
  const [bullets, setBullets] = useState('')
  const [reviewType, setReviewType] = useState('Manager to report')
  const [tone, setTone] = useState('Balanced')
  const [focusArea, setFocusArea] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const bulletCount = bullets.split('\n').filter(l => l.trim()).length

  const handleGenerate = async () => {
    if (!bullets.trim()) return
    setLoading(true)
    setOutput('')

    const prompt = `You are a professional HR writing assistant. Transform these bullet-point notes into a polished, professional performance review.

Rules:
- Remove vague language ("rockstar", "ninja", "crushing it")
- Remove gender-coded language
- Write in third person for manager reviews, first person for self-assessments, second person for peer reviews
- Structure: achievement then impact then growth area
- Tone: ${tone} (Supportive = warm and encouraging, Balanced = objective and fair, Direct = clear and unvarnished)
- Review type: ${reviewType}
- Length: 2-3 paragraphs, around 150-200 words
- Never invent facts not in the bullet points
- Focus area to emphasize: ${focusArea || 'none'}
- Output only the review text, no preamble

Here are the bullet points:

${bullets}`

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
         model: 'stepfun/step-3.5-flash:free',
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await response.json()
      console.log('Response:', data)
      if (data.choices && data.choices[0]) {
        setOutput(data.choices[0].message.content)
      } else {
        setOutput('Error: ' + JSON.stringify(data))
      }
    } catch (err) {
      setOutput('Error: ' + err.message)
    }

    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = output.split(/\s+/).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">FeedbackLoop</h1>
          <p className="text-sm text-gray-500 mt-1">AI performance review writer</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Bullet points about this person's work
          </label>
          <textarea
            className="w-full h-36 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 font-mono"
            placeholder={"- Shipped the new dashboard ahead of schedule\n- Mentored two junior devs\n- Needs to improve estimation accuracy"}
            value={bullets}
            onChange={e => setBullets(e.target.value)}
          />
          <p className="text-xs text-gray-400 text-right mt-1">{bulletCount} bullet{bulletCount !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Review type</label>
              <select
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                value={reviewType}
                onChange={e => setReviewType(e.target.value)}
              >
                <option>Manager to report</option>
                <option>Self-assessment</option>
                <option>Peer review</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Tone</label>
              <select
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                value={tone}
                onChange={e => setTone(e.target.value)}
              >
                <option>Supportive</option>
                <option>Balanced</option>
                <option>Direct</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Focus area</label>
              <input
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="e.g. leadership"
                value={focusArea}
                onChange={e => setFocusArea(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !bullets.trim()}
            className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Generating...' : 'Generate review'}
          </button>
        </div>

        {(output || loading) && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Generated review</span>
                {output && (
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                    {wordCount} words
                  </span>
                )}
              </div>
              {output && (
                <button
                  onClick={handleCopy}
                  className="text-xs border border-gray-200 rounded-lg px-3 py-1 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy text'}
                </button>
              )}
            </div>
            {loading ? (
              <div className="text-sm text-gray-400 animate-pulse">Writing your review...</div>
            ) : (
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{output}</div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}