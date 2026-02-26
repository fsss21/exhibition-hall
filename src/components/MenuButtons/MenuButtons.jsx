import React from 'react'
import styles from './MenuButtons.module.css'

/**
 * @param {{ buttons: Array<{ id: string, label: string }>, selectedId?: string, onSelect: (id: string) => void }} props
 */
function MenuButtons({ buttons = [], selectedId, onSelect }) {
  return (
    <div className={styles.menuButtons}>
      <div className={styles.menuBlock}>
        {buttons.map((btn, index) => (
          <React.Fragment key={btn.id}>
            {index > 0 && <div className={styles.divider} />}
            <button
              type="button"
              className={`${styles.menuButton} ${selectedId === btn.id ? styles.active : ''}`}
              onClick={() => onSelect(btn.id)}
            >
              {btn.label}
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default MenuButtons
