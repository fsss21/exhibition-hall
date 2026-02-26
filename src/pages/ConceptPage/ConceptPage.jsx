import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import MenuButtons from '../../components/MenuButtons/MenuButtons'
import Gallery from '../../components/Gallery/Gallery'
import WestIcon from '@mui/icons-material/West'
import EastIcon from '@mui/icons-material/East'
import styles from './ConceptPage.module.css'
import conceptImg from '../../assets/concept_img.png'
import conceptImg4k from '../../assets/concept_img-4k.png'
import conceptCatalogImg from '../../assets/concept_catalog_img.png'
import conceptCatalogImg4k from '../../assets/concept_catalog_img-4k.png'

const CURRENT_BUTTONS = [
  { id: 'concept', label: 'КОНЦЕПЦИЯ' },
  { id: 'catalog', label: 'КАТАЛОГ ЭКСПОНАТОВ' }
]

const CATALOG_CATEGORIES = {
  catalog: {
    name: 'Каталог экспонатов',
    subcategories: [{ id: 'all', name: 'Экспонаты' }]
  }
}

function ConceptPage({ title: titleProp, text: textProp, selectedTab: selectedTabProp, onTabSelect, onBack }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [is4K, setIs4K] = useState(false)
  const [data, setData] = useState(null)
  const [selectedTab, setSelectedTab] = useState(selectedTabProp ?? 'concept')
  const [currentExhibitionIndex, setCurrentExhibitionIndex] = useState(0)

  const exhibitions = useMemo(() => {
    if (Array.isArray(data?.exhibitions) && data.exhibitions.length > 0) return data.exhibitions
    const single = {
      title: titleProp ?? data?.concept?.title ?? 'НАЗВАНИЕ ВРЕМЕННОЙ ВЫСТАВКИ',
      text: textProp ?? data?.concept?.text ?? 'Текст концепции временной выставки.'
    }
    return [single]
  }, [data?.exhibitions, data?.concept, titleProp, textProp])
  const totalExhibitions = exhibitions.length
  const currentExhibition = exhibitions[currentExhibitionIndex] ?? exhibitions[0]
  const catalogItems = data?.catalog ?? []
  const catalogExhibits = { catalog: { all: catalogItems } }
  const backgroundSrc = selectedTab === 'catalog'
    ? (is4K ? conceptCatalogImg4k : conceptCatalogImg)
    : (is4K ? conceptImg4k : conceptImg)

  const handleBack = onBack ?? (() => navigate('/'))
  const handleTabSelect = onTabSelect ?? setSelectedTab
  const handleCatalogBack = () => setSelectedTab('concept')
  const handleExhibitSelect = (exhibit) => {
    navigate(`/concept/catalog/${exhibit.id}`)
  }
  const handlePrevExhibition = () => setCurrentExhibitionIndex((i) => (i > 0 ? i - 1 : totalExhibitions - 1))
  const handleNextExhibition = () => setCurrentExhibitionIndex((i) => (i < totalExhibitions - 1 ? i + 1 : 0))

  useEffect(() => {
    const update4K = () => setIs4K(window.innerWidth >= 2560 || window.innerHeight >= 1440)
    update4K()
    window.addEventListener('resize', update4K)
    return () => window.removeEventListener('resize', update4K)
  }, [])

  useEffect(() => {
    fetch('/data/currentExhibition.json')
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => setData(null))
  }, [])

  useEffect(() => {
    setCurrentExhibitionIndex((i) => Math.min(i, Math.max(0, totalExhibitions - 1)))
  }, [totalExhibitions])

  useEffect(() => {
    const tabFromState = location.state?.tab
    if (tabFromState === 'catalog') {
      setSelectedTab('catalog')
    }
  }, [location.state?.tab])

  return (
    <div className={styles.page}>
      <div
        className={styles.conceptBackground}
        style={{ backgroundImage: `url(${backgroundSrc})` }}
      />
      <div className={styles.sidebar}>
        <MenuButtons
          buttons={CURRENT_BUTTONS}
          selectedId={selectedTab}
          onSelect={handleTabSelect}
        />
      </div>
      <div className={`${styles.content} ${selectedTab === 'catalog' ? styles.contentCatalog : ''}`}>
        {selectedTab === 'concept' ? (
          <>
            <h1 className={styles.conceptTitle}>{currentExhibition?.title ?? ''}</h1>
            <div className={styles.textBlock}>{currentExhibition?.text ?? ''}</div>
            <div className={styles.bottomBar}>
              <button type="button" className={styles.backButton} onClick={handleBack}>
                Назад
              </button>
              {totalExhibitions > 1 ? (
                <div className={styles.textNav}>
                  <button
                    type="button"
                    className={styles.textNavArrow}
                    onClick={handlePrevExhibition}
                    title="Предыдущая выставка"
                    aria-label="Предыдущая выставка"
                  >
                    <WestIcon />
                  </button>
                  <span className={styles.textPageIndicator}>
                    {currentExhibitionIndex + 1} / {totalExhibitions}
                  </span>
                  <button
                    type="button"
                    className={styles.textNavArrow}
                    onClick={handleNextExhibition}
                    title="Следующая выставка"
                    aria-label="Следующая выставка"
                  >
                    <EastIcon />
                  </button>
                </div>
              ) : (
                <div className={styles.navPlaceholder} />
              )}
            </div>
          </>
        ) : (
          <Gallery
            categories={CATALOG_CATEGORIES}
            exhibits={catalogExhibits}
            category="catalog"
            onExhibitSelect={handleExhibitSelect}
            onBack={handleCatalogBack}
            conceptMode
            title={data?.title ?? 'НАЗВАНИЕ ВРЕМЕННОЙ ВЫСТАВКИ'}
          />
        )}
      </div>
    </div>
  )
}

export default ConceptPage
