import { createPortal } from 'react-dom'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import styles from './PhotoGallery.module.css'

function PhotoGallery({
  photos = [],
  currentIndex = 0,
  onIndexChange,
  showFullscreen = false,
  onCloseFullscreen,
  showArrows = false,
  showControls = false
}) {
  const photo = photos[currentIndex]
  const src = typeof photo === 'string' ? photo : photo?.url ?? photo?.src

  const handlePrev = () => {
    const prev = currentIndex > 0 ? currentIndex - 1 : photos.length - 1
    onIndexChange?.(prev)
  }

  const handleNext = () => {
    const next = currentIndex < photos.length - 1 ? currentIndex + 1 : 0
    onIndexChange?.(next)
  }

  if (!photos.length) {
    return <div className={styles.placeholder}>Нет фото</div>
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.imageWrap}>
        <img src={src} alt="" className={styles.image} />
      </div>
      {showFullscreen &&
        createPortal(
          <div className={styles.fullscreenOverlay} onClick={onCloseFullscreen}>
            <button
              type="button"
              className={styles.fullscreenClose}
              onClick={(e) => {
                e.stopPropagation()
                onCloseFullscreen?.()
              }}
              aria-label="Закрыть"
            >
              ×
            </button>
            <img
              src={src}
              alt=""
              className={styles.fullscreenImage}
              onClick={(e) => e.stopPropagation()}
            />
            {showArrows && photos.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.fullscreenArrow} ${styles.fullscreenArrowPrev}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePrev()
                  }}
                  aria-label="Предыдущее"
                >
                  <ArrowBackIosNewIcon />
                </button>
                <button
                  type="button"
                  className={`${styles.fullscreenArrow} ${styles.fullscreenArrowNext}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNext()
                  }}
                  aria-label="Следующее"
                >
                  <ArrowForwardIosIcon />
                </button>
              </>
            )}
          </div>,
          document.body
        )}
    </div>
  )
}

export default PhotoGallery
