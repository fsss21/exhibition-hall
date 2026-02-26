import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './MainMenu.module.css'
import mainMenuImg from '../../assets/main_menu_img.png'
import mainMenuImg4k from '../../assets/main_menu_img-4k.png'

const ROUTES = {
  history: '/history',
  current: '/concept',
  archive: '/archive'
}

function MainMenu() {
  const navigate = useNavigate()
  const [buttons, setButtons] = useState([])
  const [backgroundSrc, setBackgroundSrc] = useState(mainMenuImg)

  useEffect(() => {
    const updateBackground = () => {
      const is4K = window.innerWidth >= 2560 || window.innerHeight >= 1440
      setBackgroundSrc(is4K ? mainMenuImg4k : mainMenuImg)
    }
    updateBackground()
    window.addEventListener('resize', updateBackground)
    return () => window.removeEventListener('resize', updateBackground)
  }, [])

  useEffect(() => {
    fetch('/data/mainMenu.json')
      .then((res) => (res.ok ? res.json() : Promise.resolve(null)))
      .then((data) => {
        if (data?.buttons?.length) setButtons(data.buttons)
        else {
          setButtons([
            { id: 'history', label: 'ИСТОРИЯ УТКИНОЙ ДАЧИ' },
            { id: 'current', label: 'ТЕКУЩАЯ ВЫСТАВКА' },
            { id: 'archive', label: 'АРХИВ ВЫСТАВОК' }
          ])
        }
      })
      .catch(() => {
        setButtons([
          { id: 'history', label: 'ИСТОРИЯ УТКИНОЙ ДАЧИ' },
          { id: 'current', label: 'ТЕКУЩАЯ ВЫСТАВКА' },
          { id: 'archive', label: 'АРХИВ ВЫСТАВОК' }
        ])
      })
  }, [])

  const handleClick = (id) => {
    const path = ROUTES[id]
    if (path) navigate(path)
  }

  return (
    <div className={styles.mainMenu}>
      <div
        className={styles.mainMenuBackground}
        style={{ backgroundImage: `url(${backgroundSrc})` }}
      />
      <h1 className={styles.title}>ЗАЛ ВРЕМЕННЫХ ВЫСТАВОК</h1>
      <div className={styles.buttons}>
        {buttons.map((btn) => (
          <div key={btn.id} className={styles.menuItem}>
            <div className={styles.menuItemText} dangerouslySetInnerHTML={{ __html: btn.label }} />
            <button
              type="button"
              className={styles.menuButton}
              onClick={() => handleClick(btn.id)}
            >
              Подробнее
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MainMenu
