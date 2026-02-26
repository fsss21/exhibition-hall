import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import MenuButtons from '../../components/MenuButtons/MenuButtons'
import Gallery from '../../components/Gallery/Gallery'
import styles from '../ConceptPage/ConceptPage.module.css'
import archiveImg from '../../assets/archive_img.png'
import archiveImg4k from '../../assets/archive_img-4k.png'
import archiveCatalogImg from '../../assets/archive_catalog_img.png'
import archiveCatalogImg4k from '../../assets/archive_catalog_img-4k.png'

const ARCHIVE_EXHIBITION_BUTTONS = [
  { id: 'concept', label: 'КОНЦЕПЦИЯ' },
  { id: 'catalog', label: 'КАТАЛОГ ЭКСПОНАТОВ' }
]

const ARCHIVE_CATALOG_CATEGORIES = {
  catalog: {
    name: 'Каталог экспонатов',
    subcategories: [{ id: 'all', name: 'Экспонаты' }]
  }
}

const ARCHIVE_TITLE_PREFIX = 'ПРОШЕДШИЕ ЭКСПОЗИЦИИ'

function ArchiveExhibitionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { exhibitionId } = useParams()
  const [is4K, setIs4K] = useState(false)
  const [data, setData] = useState(null)
  const [selectedTab, setSelectedTab] = useState('concept')

  useEffect(() => {
    fetch('/data/archive.json')
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => setData(null))
  }, [])

  useEffect(() => {
    const update4K = () => setIs4K(window.innerWidth >= 2560 || window.innerHeight >= 1440)
    update4K()
    window.addEventListener('resize', update4K)
    return () => window.removeEventListener('resize', update4K)
  }, [])

  useEffect(() => {
    const tabFromState = location.state?.tab
    if (tabFromState === 'catalog') setSelectedTab('catalog')
  }, [location.state?.tab])

  const exhibition = (data?.past ?? []).find(
    (e) => String(e.id) === String(exhibitionId)
  ) ?? null
  const catalog = exhibition?.catalog ?? []
  const catalogExhibits = { catalog: { all: catalog } }
  const pageTitle = exhibition
    ? `${ARCHIVE_TITLE_PREFIX} -> ${exhibition.title ?? exhibition.name ?? ''}`
    : ARCHIVE_TITLE_PREFIX

  const backgroundSrc = selectedTab === 'catalog'
    ? (is4K ? archiveCatalogImg4k : archiveCatalogImg)
    : (is4K ? archiveImg4k : archiveImg)

  const handleBack = () => navigate('/archive', { state: { tab: 'past' } })
  const handleCatalogBack = () => setSelectedTab('concept')
  const handleExhibitSelect = (exhibit) => {
    navigate(`/archive/${exhibitionId}/catalog/${exhibit.id}`)
  }

  if (!data) {
    return (
      <div className={styles.page}>
        <div className={styles.content}>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!exhibition) {
    return (
      <div className={styles.page}>
        <div className={styles.content}>
          <p>Выставка не найдена.</p>
          <button type="button" className={styles.backButton} onClick={() => navigate('/archive')}>
            В раздел «Прошедшие экспозиции»
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div
        className={styles.conceptBackground}
        style={{ backgroundImage: `url(${backgroundSrc})` }}
      />
      <div className={styles.sidebar}>
        <MenuButtons
          buttons={ARCHIVE_EXHIBITION_BUTTONS}
          selectedId={selectedTab}
          onSelect={setSelectedTab}
        />
      </div>
      <div className={`${styles.content} ${selectedTab === 'catalog' ? styles.contentCatalog : ''}`}>
        {selectedTab === 'concept' ? (
          <>
            <h1 className={styles.conceptTitle}>{exhibition.title ?? exhibition.name ?? ''}</h1>
            <div className={styles.textBlock}>
              {exhibition.concept?.text ?? 'Нет описания концепции.'}
            </div>
            <div className={styles.bottomBar}>
              <button type="button" className={styles.backButton} onClick={handleBack}>
                Назад
              </button>
              <div className={styles.navPlaceholder} />
            </div>
          </>
        ) : (
          <Gallery
            categories={ARCHIVE_CATALOG_CATEGORIES}
            exhibits={catalogExhibits}
            category="catalog"
            onExhibitSelect={handleExhibitSelect}
            onBack={handleCatalogBack}
            conceptMode
            title={pageTitle}
          />
        )}
      </div>
    </div>
  )
}

export default ArchiveExhibitionPage
