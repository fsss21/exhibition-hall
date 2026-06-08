import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PhotoGallery from '../../components/PhotoGallery/PhotoGallery'
import styles from '../SubMenu/SubMenu.module.css'
import futureItemImg from '../../assets/future_item_img.png'
import futureItemImg4k from '../../assets/future_item_img-4k.png'
import futureItemNoPhotoImg from '../../assets/future_item_noPhoto_img.png'
import futureItemNoPhotoImg4k from '../../assets/future_item_noPhoto_img-4k.png'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import FullscreenIcon from '@mui/icons-material/Fullscreen'

function ArchiveFutureProjectPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imageSrc, setImageSrc] = useState(futureItemImg)
  const [noPhotoImageSrc, setNoPhotoImageSrc] = useState(futureItemNoPhotoImg)

  useEffect(() => {
    setLoading(true)
    fetch('/data/archive.json')
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const is4K = window.innerWidth >= 2560 || window.innerHeight >= 1440
    setImageSrc(is4K ? futureItemImg4k : futureItemImg)
    setNoPhotoImageSrc(is4K ? futureItemNoPhotoImg4k : futureItemNoPhotoImg)
  }, [])

  useEffect(() => {
    const onResize = () => {
      const is4K = window.innerWidth >= 2560 || window.innerHeight >= 1440
      setImageSrc(is4K ? futureItemImg4k : futureItemImg)
      setNoPhotoImageSrc(is4K ? futureItemNoPhotoImg4k : futureItemNoPhotoImg)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const futureItems = data?.future ?? []
  const project = futureItems.find((item) => String(item.id) === String(id)) ?? null
  const photos = project?.images ?? project?.photos ?? []
  const hasPhotos = Array.isArray(photos) && photos.length > 0
  const backgroundImageSrc = hasPhotos ? imageSrc : noPhotoImageSrc

  const handleBack = () => {
    navigate('/archive', { state: { tab: 'future' } })
  }

  const handleNextPhoto = () => {
    if (photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
    }
  }

  const handlePrevPhoto = () => {
    if (photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
    }
  }

  const handleCloseFullscreen = () => setIsFullscreen(false)

  if (loading) {
    return (
      <div className={styles.subMenu}>
        <div className={styles.subMenuContent}>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className={styles.subMenu}>
        <div className={styles.subMenuContent}>
          <p>Проект не найден.</p>
          <button type="button" className={styles.subMenuBtnBack} onClick={() => navigate('/archive', { state: { tab: 'future' } })}>
            Назад
          </button>
        </div>
      </div>
    )
  }

  const displayTitle = project.title ?? project.name ?? 'Проект'

  return (
    <div className={styles.subMenu}>
      <div
        className={styles.subMenuBackground}
        style={{ '--background-image': `url(${backgroundImageSrc})` }}
      />
      <div className={styles.subMenuContent}>
        <div className={`${styles.futureProjectMainContent} ${!hasPhotos ? styles.futureProjectMainContentCentered : ''}`}>
          <div className={styles.subMenuMainContentMenu}>
            <div className={`${styles.subMenuTextBlock} ${!hasPhotos ? styles.subMenuTextBlockCentered : ''}`}>
              <h2 className={styles.subMenuTextPoint}>{displayTitle}</h2>
              <p className={styles.subMenuTextDescription}>{project.description ?? ''}</p>
              <div className={styles.subMenuBottomNavigation}>
                <button className={`${styles.subMenuBtn} ${styles.subMenuBtnBack}`} onClick={handleBack}>
                  Назад
                </button>
              </div>
            </div>
          </div>

          {hasPhotos && (
            <div className={styles.subMenuGalleryBlock}>
              <div className={styles.subMenuGalleryWrapper}>
                <PhotoGallery
                  photos={photos}
                  showControls={false}
                  showArrows={isFullscreen}
                  showFullscreen={isFullscreen}
                  onCloseFullscreen={handleCloseFullscreen}
                  currentIndex={currentPhotoIndex}
                  onIndexChange={setCurrentPhotoIndex}
                />
              </div>
              <div className={styles.subMenuGalleryControls}>
                <div className={styles.subMenuNav}>
                  <button
                    type="button"
                    className={styles.subMenuGalleryNavBtn}
                    onClick={handlePrevPhoto}
                    disabled={photos.length <= 1}
                    aria-label="Предыдущее фото"
                  >
                    <ArrowBackIosNewIcon />
                  </button>
                  <span className={styles.subMenuGalleryCounter}>
                    {currentPhotoIndex + 1} / {photos.length}
                  </span>
                  <button
                    type="button"
                    className={styles.subMenuGalleryNavBtn}
                    onClick={handleNextPhoto}
                    disabled={photos.length <= 1}
                    aria-label="Следующее фото"
                  >
                    <ArrowForwardIosIcon />
                  </button>
                </div>
                <button
                  type="button"
                  className={styles.fullscreenButton}
                  onClick={() => setIsFullscreen(true)}
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

export default ArchiveFutureProjectPage
