import React from 'react'
import '../styles/StudioTicker.css'

const WORDS = [
  'Record',
  'Mix',
  'Master',
  'Produce',
  'Write',
  'Jam',
  'Collaborate',
  'Listen',
  'Learn',
  'Create',
]

/**
 * 
 * @returns the ifninte ticker with keywords related with the studio
 */
function StudioTicker() {
  // two copies side by side; sliding left by exactly one copy makes a seamless loop
  const items = [...WORDS, ...WORDS]

  return (
    <div className="ticker" aria-label={WORDS.join(', ')} role="img">
      <div className="ticker__track">
        {items.map((word, i) => (
          <span key={i} className="ticker__item" aria-hidden="true">
            {word}
            <span className="ticker__dot" />
          </span>
        ))}
      </div>
    </div>
  )
}

export default StudioTicker
