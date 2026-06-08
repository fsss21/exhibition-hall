import { useState, useEffect } from 'react'
import PhotoGallery from '../../components/PhotoGallery/PhotoGallery'
import styles from './CatalogItem.module.css'
import catalogItemImg from '../../assets/catalog_item_img.png'
import catalogItemImg4k from '../../assets/catalog_item_img-4k.png'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import FullscreenIcon from '@mui/icons-material/Fullscreen'

function ExhibitPage({ exhibit, category, subcategory, allExhibits, currentIndex, onClose, onNavigate, title = 'Зал временных выставок', showBackInPage = false }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentTextPage, setCurrentTextPage] = useState(0)
  const [textPages, setTextPages] = useState([])
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [imageSrc, setImageSrc] = useState(catalogItemImg)

  useEffect(() => {
    const is4K = window.innerWidth >= 2560 || window.innerHeight >= 1440
    setImageSrc(is4K ? catalogItemImg4k : catalogItemImg)
  }, [])

  useEffect(() => {
    setCurrentImageIndex(0)
    setCurrentTextPage(0)
  }, [exhibit])

  useEffect(() => {
    if (exhibit && exhibit.description) {
      const charsPerPage = 800
      const text = exhibit.description
      const pages = []
      if (text.length <= charsPerPage) {
        pages.push(text)
      } else {
        let idx = 0
        while (idx < text.length) {
          let end = idx + charsPerPage
          if (end < text.length) {
            const lastSpace = text.lastIndexOf(' ', end)
            const lastDot = text.lastIndexOf('.', end)
            const lastBreak = Math.max(lastSpace, lastDot)
            if (lastBreak > idx) end = lastBreak + 1
          }
          pages.push(text.slice(idx, end).trim())
          idx = end
        }
      }
      setTextPages(pages)
      setCurrentTextPage(0)
    }
  }, [exhibit])

  if (!exhibit) return null

  const images = exhibit.images || []
  const totalTextPages = textPages.length
  const currentText = textPages[currentTextPage] ?? exhibit.description ?? ''

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  const handlePrevTextPage = () => {
    setCurrentTextPage((prev) => (prev > 0 ? prev - 1 : totalTextPages - 1))
  }

  const handleNextTextPage = () => {
    setCurrentTextPage((prev) => (prev < totalTextPages - 1 ? prev + 1 : 0))
  }

  const handleFullscreen = () => setShowFullscreen(true)
  const handleCloseFullscreen = () => setShowFullscreen(false)

  const handlePrevExhibit = () => {
    if (allExhibits && currentIndex !== undefined) {
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : allExhibits.length - 1
      onNavigate?.(prevIndex)
    }
  }

  const handleNextExhibit = () => {
    if (allExhibits && currentIndex !== undefined) {
      const nextIndex = currentIndex < allExhibits.length - 1 ? currentIndex + 1 : 0
      onNavigate?.(nextIndex)
    }
  }

  return (
    <div className={styles.catalogItemPage}>
      <div
        className={styles.catalogItemBackground}
        style={{ '--background-image': `url(${imageSrc})` }}
      />
      <div className={styles.catalogItemContent}>
        {showBackInPage && onClose && (
          <div className={styles.catalogItemTopBar}>
            <button type="button" className={styles.catalogItemBackLink} onClick={onClose}>
              Назад
            </button>
            <div className={styles.navPlaceholder} />
          </div>
        )}
        <div className={styles.catalogItemMain}>
          <div className={styles.catalogItemTextBlock}>
            <h1 className={styles.catalogItemName}>{exhibit.name}</h1>

            {exhibit.date && (
              <div className={styles.catalogItemInfoRow}>
                <span className={styles.catalogItemInfoLabel}>Дата:</span>
                <span className={styles.catalogItemInfoValue}>{exhibit.date}</span>
              </div>
            )}

            {exhibit.material && (
              <div className={styles.catalogItemInfoRow}>
                <span className={styles.catalogItemInfoLabel}>Материал:</span>
                <span className={styles.catalogItemInfoValue}>{exhibit.material}</span>
              </div>
            )}

            {exhibit.size && (
              <div className={styles.catalogItemInfoRow}>
                <span className={styles.catalogItemInfoLabel}>Размер:</span>
                <span className={styles.catalogItemInfoValue}>{exhibit.size}</span>
              </div>
            )}

            <div
              className={styles.catalogItemDescription}
              dangerouslySetInnerHTML={{ __html: `<p>${currentText}</p>` }}
            />

            {totalTextPages > 1 && (
              <div className={styles.catalogItemTextNavigation}>
                <div className={styles.catalogItemTextCounter}>
                  {currentTextPage + 1} / {totalTextPages}
                </div>
                <div className={styles.catalogItemTextArrows}>
                  <button
                    type="button"
                    className={styles.catalogItemTextNavBtn}
                    onClick={handlePrevTextPage}
                    disabled={currentTextPage === 0}
                    aria-label="Предыдущий текст"
                  >
                    <ArrowBackIosNewIcon />
                  </button>
                  <button
                    type="button"
                    className={styles.catalogItemTextNavBtn}
                    onClick={handleNextTextPage}
                    disabled={currentTextPage === totalTextPages - 1}
                    aria-label="Следующий текст"
                  >
                    <ArrowForwardIosIcon />
                  </button>
                </div>
              </div>
            )}
          </div>

          {images.length > 0 && (
            <div className={styles.catalogItemPhotoBlock}>
              <div className={styles.catalogItemGallery}>
                <PhotoGallery
                  photos={images}
                  showFullscreen={showFullscreen}
                  onCloseFullscreen={handleCloseFullscreen}
                  showControls={false}
                  showArrows={false}
                  currentIndex={currentImageIndex}
                  onIndexChange={setCurrentImageIndex}
                />
              </div>

              <div className={styles.catalogItemPhotoNavigation}>
                <button
                  type="button"
                  className={styles.catalogItemPhotoNavBtn}
                  onClick={handlePrevImage}
                  disabled={images.length <= 1}
                  aria-label="Предыдущее фото"
                >
                  <ArrowBackIosNewIcon />
                </button>
                <div className={styles.catalogItemPhotoCounter}>
                  {currentImageIndex + 1} / {images.length}
                </div>
                <button
                  type="button"
                  className={styles.catalogItemPhotoNavBtn}
                  onClick={handleNextImage}
                  disabled={images.length <= 1}
                  aria-label="Следующее фото"
                >
                  <ArrowForwardIosIcon />
                </button>
                <button
                  type="button"
                  className={styles.catalogItemFullscreenBtn}
                  onClick={handleFullscreen}
                  aria-label="Полноэкранный режим"
                >
                  <FullscreenIcon fontSize="large" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExhibitPage
