import { useState } from 'react'
import './App.css'

const MLB_TEAMS = [
  // American League East
  { value: 'BAL', name: 'Baltimore Orioles', division: 'AL East' },
  { value: 'BOS', name: 'Boston Red Sox', division: 'AL East' },
  { value: 'NYY', name: 'New York Yankees', division: 'AL East' },
  { value: 'TB', name: 'Tampa Bay Rays', division: 'AL East' },
  { value: 'TOR', name: 'Toronto Blue Jays', division: 'AL East' },
  // American League Central
  { value: 'CWS', name: 'Chicago White Sox', division: 'AL Central' },
  { value: 'CLE', name: 'Cleveland Guardians', division: 'AL Central' },
  { value: 'DET', name: 'Detroit Tigers', division: 'AL Central' },
  { value: 'KC', name: 'Kansas City Royals', division: 'AL Central' },
  { value: 'MIN', name: 'Minnesota Twins', division: 'AL Central' },
  // American League West
  { value: 'HOU', name: 'Houston Astros', division: 'AL West' },
  { value: 'LAA', name: 'Los Angeles Angels', division: 'AL West' },
  { value: 'OAK', name: 'Oakland Athletics', division: 'AL West' },
  { value: 'SEA', name: 'Seattle Mariners', division: 'AL West' },
  { value: 'TEX', name: 'Texas Rangers', division: 'AL West' },
  // National League East
  { value: 'ATL', name: 'Atlanta Braves', division: 'NL East' },
  { value: 'MIA', name: 'Miami Marlins', division: 'NL East' },
  { value: 'NYM', name: 'New York Mets', division: 'NL East' },
  { value: 'PHI', name: 'Philadelphia Phillies', division: 'NL East' },
  { value: 'WSH', name: 'Washington Nationals', division: 'NL East' },
  // National League Central
  { value: 'CHC', name: 'Chicago Cubs', division: 'NL Central' },
  { value: 'CIN', name: 'Cincinnati Reds', division: 'NL Central' },
  { value: 'MIL', name: 'Milwaukee Brewers', division: 'NL Central' },
  { value: 'PIT', name: 'Pittsburgh Pirates', division: 'NL Central' },
  { value: 'STL', name: 'St. Louis Cardinals', division: 'NL Central' },
  // National League West
  { value: 'ARI', name: 'Arizona Diamondbacks', division: 'NL West' },
  { value: 'COL', name: 'Colorado Rockies', division: 'NL West' },
  { value: 'LAD', name: 'Los Angeles Dodgers', division: 'NL West' },
  { value: 'SD', name: 'San Diego Padres', division: 'NL West' },
  { value: 'SF', name: 'San Francisco Giants', division: 'NL West' },
]

const DIVISIONS = [...new Set(MLB_TEAMS.map(t => t.division))]

function TeamDropdown({ value, onChange, onRemove, showRemove }) {
  return (
    <div className="dropdown-row">
      <div className="select-wrapper">
        <select value={value} onChange={e => onChange(e.target.value)} className="team-select">
          <option value="">-- Select a Team --</option>
          {DIVISIONS.map(division => (
            <optgroup key={division} label={division}>
              {MLB_TEAMS.filter(t => t.division === division).map(team => (
                <option key={team.value} value={team.value}>
                  {team.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      {showRemove && (
        <button className="remove-btn" onClick={onRemove} title="Remove">×</button>
      )}
    </div>
  )
}

function App() {
  const [selections, setSelections] = useState([''])

  const updateSelection = (index, value) => {
    setSelections(prev => prev.map((s, i) => i === index ? value : s))
  }

  const addDropdown = () => {
    setSelections(prev => [...prev, ''])
  }

  const removeDropdown = (index) => {
    setSelections(prev => prev.filter((_, i) => i !== index))
  }

  const [orderDoesntMatter, setOrderDoesntMatter] = useState(false)
  const [reversible, setReversible] = useState(false)
  const [startDay, setStartDay] = useState('')
  const [activeDays, setActiveDays] = useState({
    Monday: false, Tuesday: false, Wednesday: false, Thursday: false,
    Friday: false, Saturday: false, Sunday: false,
  })

  const toggleDay = (day) => {
    setActiveDays(prev => ({ ...prev, [day]: !prev[day] }))
  }

  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState('default')
  const [showOrderWarning, setShowOrderWarning] = useState(false)

  const handleSubmit = async () => {
    const teams = selections.filter(s => s !== '')
    if (orderDoesntMatter && teams.length > 5) {
      setShowOrderWarning(true)
      return
    }
    setResult(null)
    setError(null)
    setLoading(true)
    try {
      const dayNumbers = { Thursday: 1, Friday: 2, Saturday: 3, Sunday: 4, Monday: 5, Tuesday: 6, Wednesday: 0 }
      const startDays = Object.entries(activeDays)
        .filter(([, active]) => active)
        .map(([day]) => dayNumbers[day])
        .sort((a, b) => a - b)
        .join(',')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/route?teams=${teams.join(',')}&reversible=${reversible ? 1 : 0}&order=${orderDoesntMatter ? 1 : 0}&startDays=${startDays}`)
      const data = await response.json()
      setResult(data)
    } catch (e) {
      setError('Failed to fetch results.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>MLB Roadtrip Calculator</h1>
      <p className="subtitle">Find which days you can see your favorite teams play at home in consecutive days</p>

      <div className="dropdowns-list">
        {selections.map((value, index) => (
          <TeamDropdown
            key={index}
            value={value}
            onChange={val => updateSelection(index, val)}
            onRemove={() => removeDropdown(index)}
            showRemove={selections.length > 1}
          />
        ))}
      </div>

      <button className="add-btn" onClick={addDropdown}>+</button>

      <div className="section">
        <label className="field-label">Starting Day</label>
        <div className="day-checkboxes">
          {Object.keys(activeDays).map(day => (
            <label key={day} className="day-label">
              <input
                type="checkbox"
                checked={activeDays[day]}
                onChange={() => toggleDay(day)}
                className="day-checkbox"
              />
              <span className="day-text">{day}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="options-row">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={orderDoesntMatter}
            onChange={e => setOrderDoesntMatter(e.target.checked)}
            className="toggle-input"
          />
          <span className="toggle-track">
            <span className="toggle-thumb" />
          </span>
          <span className="toggle-text">Order doesn't matter</span>
        </label>
      </div>

      <div className="options-row">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={reversible}
            onChange={e => setReversible(e.target.checked)}
            className="toggle-input"
          />
          <span className="toggle-track">
            <span className="toggle-thumb" />
          </span>
          <span className="toggle-text">Reversible</span>
        </label>

        <button className="submit-btn" onClick={handleSubmit}>Submit</button>
      </div>

      {showOrderWarning && (
        <div className="modal-overlay" onClick={() => setShowOrderWarning(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <p>Only 5 teams can be selected when the Order doesn't matter toggle is selected.</p>
            <button className="modal-close-btn" onClick={() => setShowOrderWarning(false)}>OK</button>
          </div>
        </div>
      )}

      {loading && <div className="spinner-wrapper"><div className="spinner" /></div>}
      {error && <div className="result-error">{error}</div>}
      {result && (() => {
        const DAY_ORDER = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 }
        const parsed = result.map((trip, i) => {
          const games = trip.split(', ').map(entry => {
            const [datePart, matchup] = entry.split(': ')
            const [away, home] = matchup.split(' @ ')
            return { date: datePart, away, home }
          })
          const startDate = games.length > 0 ? new Date(games[0].date + 'T12:00:00') : null
          const startDayName = startDate ? startDate.toLocaleDateString('en-US', { weekday: 'long' }) : ''
          return { games, startDate, startDayName, originalIndex: i }
        })

        const sorted = [...parsed].sort((a, b) => {
          if (sortBy === 'day') return DAY_ORDER[a.startDayName] - DAY_ORDER[b.startDayName]
          if (sortBy === 'date') return a.startDate - b.startDate
          return a.originalIndex - b.originalIndex
        })

        return (
          <div className="results-section">
            <div className="results-header">
              <h2 className="results-title">{result.length} Trip Option{result.length !== 1 ? 's' : ''} Found</h2>
            </div>
            <div className="sort-controls">
                <span className="sort-label">Sort by:</span>
                <button className={`sort-btn${sortBy === 'default' ? ' active' : ''}`} onClick={() => setSortBy('default')}>Default</button>
                <button className={`sort-btn${sortBy === 'day' ? ' active' : ''}`} onClick={() => setSortBy('day')}>Day of Week</button>
                <button className={`sort-btn${sortBy === 'date' ? ' active' : ''}`} onClick={() => setSortBy('date')}>Date</button>
            </div>
            {sorted.map(({ games, startDayName, startDate }, i) => (
              <div key={i} className="trip-card">
                <div className="trip-header">
                  {startDayName && startDate
                    ? `STARTS ${startDayName}, ${startDate.toLocaleDateString('en-US', { month: 'long' })} ${startDate.getDate()}`
                    : `Option ${i + 1}`}
                </div>
                {games.map((game, j) => (
                  <div key={j} className="game-row">
                    <span className="game-date">{game.date}</span>
                    <span className="game-matchup">
                      <span className="team-away">{game.away}</span>
                      <span className="at-sign">@</span>
                      <span className="team-home">{game.home}</span>
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )
      })()}
    </div>
  )
}

export default App
