import React, { useLayoutEffect, useRef, useState } from 'react'
import '../styles/StudioTicker.css'

const WORDS = [
  'Record', 'Mix', 'Master', 'Produce', 'Write',
  'Jam', 'Collaborate', 'Listen', 'Learn', 'Create',
]

/**
 * @returns the infinite ticker with keywords related to the studio
 */
function StudioTicker() {
  const tickerRef = useRef(null)
  const groupRef = useRef(null)
  const [copies, setCopies] = useState(2)

  useLayoutEffect(() => {
    const update = () => {
      const tickerW = tickerRef.current?.offsetWidth
      const groupW = groupRef.current?.offsetWidth
      if (!tickerW || !groupW) return
      // enough copies to cover the screen, plus one to slide in from the right
      setCopies(Math.max(2, Math.ceil(tickerW / groupW) + 1))
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(tickerRef.current)
    ro.observe(groupRef.current)
    document.fonts?.ready.then(update) // heading font changes the width once loaded
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={tickerRef} className="ticker" aria-label={WORDS.join(', ')} role="img">
      {Array.from({ length: copies }, (_, c) => (
        <div
          key={c}
          ref={c === 0 ? groupRef : undefined}
          className="ticker__group"
          aria-hidden="true"
        >
          {WORDS.map((word) => (
            <span key={word} className="ticker__item">
              {word}
              <span className="ticker__dot" />
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

export default StudioTicker