import { useState } from 'react'
import styles from './Gallery.module.css'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

const Gallery = ({ categories = {}, exhibits = {}, category, onExhibitSelect, onBack, onCategoryChange, conceptMode = false, title: titleProp }) => {
  const [activeSubcategory, setActiveSubcategory] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 8
  const categoryData = categories[category]
  const exhibitsData = exhibits[category]
  const exhibitionTitle = titleProp ?? 'НАЗВАНИЕ ВРЕМЕННОЙ ВЫСТАВКИ'

  if (!categoryData) return null

  if (!exhibitsData) {
    return (
      <div className={styles.gallery}>
        {conceptMode && <h2 className={styles.galleryTitle}>{exhibitionTitle}</h2>}
        {!conceptMode && (
          <>
            <div className={styles.galleryCategories}>
              {categoryData.subcategories.map((sub) => (
                <button key={sub.id} className={styles.categoryButton} disabled>{sub.name}</button>
              ))}
            </div>
            <div className={styles.divider} />
          </>
        )}
        <div className={styles.galleryGrid}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className={`${styles.galleryItem} ${styles.galleryItemSkeleton}`}>
              <div className={styles.galleryItemInner}>
                <div className={styles.skeletonBlock} />
                <div className={styles.galleryItemContent}>
                  <div className={`${styles.galleryItemTitle} ${styles.skeletonLine}`} />
                  <div className={`${styles.galleryItemDescription} ${styles.skeletonLineShort}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={`${styles.galleryNavigation} ${styles.galleryNavigationSkeleton}`}>
          <button type="button" className={styles.backButton} disabled>Назад</button>
          <div className={styles.navArrow}>←</div>
          <div className={styles.pageIndicator}>Загрузка...</div>
          <div className={styles.navArrow}>→</div>
        </div>
      </div>
    )
  }

  const currentSubcategory = categoryData.subcategories[activeSubcategory]
  const exhibitsList = getExhibitsForSubcategory(exhibitsData, currentSubcategory.id)
  const totalPages = Math.ceil(exhibitsList.length / itemsPerPage)
  const currentExhibits = exhibitsList.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

  const handlePrevPage = () => setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1))
  const handleNextPage = () => setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0))

  const handleExhibitClick = (exhibit) => {
    if (onExhibitSelect) {
      const allExhibits = getExhibitsForSubcategory(exhibitsData, currentSubcategory.id)
      const currentIndex = allExhibits.findIndex((e) => e.id === exhibit.id)
      onExhibitSelect(exhibit, {
        category: categoryData.name,
        subcategory: currentSubcategory.name,
        allExhibits,
        currentIndex: currentIndex >= 0 ? currentIndex : 0
      })
    }
  }

  return (
    <div className={styles.gallery}>
      {conceptMode && <h2 className={styles.galleryTitle}>{exhibitionTitle}</h2>}
      {!conceptMode && (
        <>
          <div className={styles.galleryCategories}>
            {categoryData.subcategories.map((sub, index) => (
              <button
                key={sub.id}
                type="button"
                className={`${styles.categoryButton} ${activeSubcategory === index ? styles.active : ''}`}
                onClick={() => { setActiveSubcategory(index); setCurrentPage(0) }}
              >
                {sub.name}
              </button>
            ))}
          </div>
          <div className={styles.divider} />
        </>
      )}
      <div className={styles.galleryGrid}>
        {currentExhibits.map((exhibit) => (
          <div key={exhibit.id} className={styles.galleryItem} onClick={() => handleExhibitClick(exhibit)}>
            <div className={styles.galleryItemInner}>
              <img src={exhibit.images?.[0]} alt={exhibit.name} loading="lazy" />
              <div className={styles.galleryItemContent}>
                <h3 className={styles.galleryItemTitle}>{exhibit.name} →</h3>
                <p className={styles.galleryItemDescription}>{exhibit.description || ''}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={`${styles.galleryNavigation} ${totalPages <= 1 ? styles.galleryNavigationDimmed : ''}`}>
        <button type="button" className={styles.backButton} onClick={() => { onBack?.(); onCategoryChange?.() }}>
          Назад
        </button>
        <div className={styles.navArrows}>
          <button
            type="button"
            className={`${styles.navArrow} ${totalPages <= 1 ? styles.navArrowDisabled : ''}`}
            onClick={handlePrevPage}
            disabled={totalPages <= 1}
          >
            <ArrowBackIosIcon />
          </button>
          <button
            type="button"
            className={`${styles.navArrow} ${totalPages <= 1 ? styles.navArrowDisabled : ''}`}
            onClick={handleNextPage}
            disabled={totalPages <= 1}
          >
            <ArrowForwardIosIcon />
          </button>
        </div>
      </div>
    </div>
  )
};

const getExhibitsForSubcategory = (exhibitsData, subcategoryId) => {
  if (!exhibitsData) return []
  const subcategoryData = exhibitsData[subcategoryId]
  return subcategoryData || []
}

export default Gallery
