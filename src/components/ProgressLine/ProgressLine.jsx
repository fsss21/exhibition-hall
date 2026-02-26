import { useState } from 'react'
import styles from './ProgressLine.module.css'

function ProgressLine({ points, progressPoints, onPointClick, activeIndex }) {
  const pointsList = progressPoints?.length ? progressPoints : points ?? []
  const [internalActive, setInternalActive] = useState(0)
  const isControlled = activeIndex !== undefined && activeIndex !== null
  const activePoint = isControlled ? activeIndex : internalActive

  const handlePointClick = (index) => {
    if (!isControlled) setInternalActive(index)
    if (onPointClick) onPointClick(index)
  }

  return (
    <div className={styles.progressLine}>
      <div className={styles.progressLineLine}>
        {pointsList.map((point, index) => (
          <div
            key={point.id || index}
            className={`${styles.progressLinePoint} ${
              activePoint === index ? styles.progressLinePointActive : ''
            }`}
            onClick={() => handlePointClick(index)}
          >
            <div 
              className={styles.progressLineLabel}
              dangerouslySetInnerHTML={{ __html: point.label || `Точка ${index + 1}` }}
              onClick={(e) => {
                e.stopPropagation()
                handlePointClick(index)
              }}
            />
            <div className={styles.progressLineDot}></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProgressLine

