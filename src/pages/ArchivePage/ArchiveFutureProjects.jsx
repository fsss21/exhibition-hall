import { useState } from 'react'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import styles from './ArchiveFutureProjects.module.css'

const PLACEHOLDER_IMAGE = '/data/images/placeholder.svg'
const ITEMS_PER_PAGE = 2

function ArchiveFutureProjects({ items = [], loading = false, onItemSelect, onBack }) {
  const [currentPage, setCurrentPage] = useState(0)
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE) || 1
  const currentItems = items.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  )

  const handlePrevPage = () => setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1))
  const handleNextPage = () => setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0))

  return (
    <div className={styles.futureProjects}>
      <h2 className={styles.title}>БУДУЩИЕ ПРОЕКТЫ</h2>
      <div className={styles.items}>
        {loading
          ? Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <div key={index} className={styles.item}>
              <div className={styles.skeletonImage} />
              <div className={styles.content}>
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLineShort} />
              </div>
            </div>
          ))
          : currentItems.map((item, index) => {
            const imageSrc = Array.isArray(item.images) && item.images.length > 0
              ? item.images[0]
              : PLACEHOLDER_IMAGE
            const showDivider = index === 0 && currentItems.length > 1

            return (
              <div
                key={item.id}
                className={`${styles.item} ${showDivider ? styles.itemWithDivider : ''}`}
                onClick={() => onItemSelect?.(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onItemSelect?.(item)
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <img
                  src={imageSrc}
                  alt={item.title ?? item.name ?? 'Проект'}
                  className={styles.image}
                  loading="lazy"
                />
                <div className={styles.content}>
                  <h3 className={styles.itemTitle}>{item.title ?? item.name ?? 'Проект'} →</h3>
                  <p className={styles.itemDescription}>{item.description ?? ''}</p>
                </div>
              </div>
            )
          })}
      </div>
      <div className={`${styles.navigation} ${totalPages <= 1 ? styles.navigationDimmed : ''}`}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          Назад
        </button>
        <div className={styles.navArrows}>
          <button
            type="button"
            className={`${styles.navArrow} ${totalPages <= 1 ? styles.navArrowDisabled : ''}`}
            onClick={handlePrevPage}
            disabled={totalPages <= 1}
            aria-label="Предыдущая страница"
          >
            <ArrowBackIosIcon />
          </button>

          <button
            type="button"
            className={`${styles.navArrow} ${totalPages <= 1 ? styles.navArrowDisabled : ''}`}
            onClick={handleNextPage}
            disabled={totalPages <= 1}
            aria-label="Следующая страница"
          >
            <ArrowForwardIosIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ArchiveFutureProjects
