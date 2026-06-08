import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import MenuButtons from '../../components/MenuButtons/MenuButtons'
import Gallery from '../../components/Gallery/Gallery'
import ArchiveFutureProjects from './ArchiveFutureProjects'
import styles from '../ConceptPage/ConceptPage.module.css'
import archiveImg from '../../assets/archive_img.png'
import archiveImg4k from '../../assets/archive_img-4k.png'
import archiveCatalogImg from '../../assets/archive_catalog_img.png'
import archiveCatalogImg4k from '../../assets/archive_catalog_img-4k.png'

const ARCHIVE_MENU_BUTTONS = [
  { id: 'past', label: 'ПРОШЕДШИЕ ЭКСПОЗИЦИИ' },
  { id: 'future', label: 'БУДУЩИЕ ПРОЕКТЫ' }
]

const ARCHIVE_CATEGORIES = {
  past: {
    name: 'Прошедшие экспозиции',
    subcategories: [{ id: 'all', name: 'Выставки' }]
  }
}

const PLACEHOLDER_IMAGE = '/data/images/placeholder.svg'

function ArchivePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [is4K, setIs4K] = useState(false)
  const [data, setData] = useState(null)
  const [selectedTab, setSelectedTab] = useState('past')

  useEffect(() => {
    fetch('/data/archive.json')
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => setData(null))
  }, [])

  useEffect(() => {
    const tabFromState = location.state?.tab
    if (tabFromState === 'past') setSelectedTab('past')
    if (tabFromState === 'future') setSelectedTab('future')
  }, [location.state?.tab])

  useEffect(() => {
    const update4K = () => setIs4K(window.innerWidth >= 2560 || window.innerHeight >= 1440)
    update4K()
    window.addEventListener('resize', update4K)
    return () => window.removeEventListener('resize', update4K)
  }, [])

  const pastExhibitions = data?.past ?? []
  const futureItems = data?.future ?? []
  const archiveExhibitsForGallery = useMemo(() => {
    const items = pastExhibitions.map((exhibition) => {
      const firstImage = exhibition.catalog?.[0]?.images?.[0] ?? PLACEHOLDER_IMAGE
      return {
        id: exhibition.id,
        name: exhibition.title ?? exhibition.name ?? 'Выставка',
        description: exhibition.concept?.text?.slice(0, 120) ?? '',
        images: Array.isArray(exhibition.catalog?.[0]?.images) ? exhibition.catalog[0].images : [firstImage]
      }
    })
    return { past: { all: items } }
  }, [pastExhibitions])

  const backgroundSrc = selectedTab === 'past'
    ? (is4K ? archiveCatalogImg4k : archiveCatalogImg)
    : (is4K ? archiveImg4k : archiveImg)

  const handleExhibitionSelect = (exhibit) => {
    navigate(`/archive/${exhibit.id}`)
  }

  const handleFutureProjectSelect = (exhibit) => {
    navigate(`/archive/future/${exhibit.id}`)
  }

  return (
    <div className={styles.page}>
      <div
        className={styles.conceptBackground}
        style={{ '--background-image': `url(${backgroundSrc})` }}
      />
      <div className={styles.sidebar}>
        <MenuButtons
          buttons={ARCHIVE_MENU_BUTTONS}
          selectedId={selectedTab}
          onSelect={setSelectedTab}
        />
      </div>
      <div className={`${styles.content} ${selectedTab === 'past' || selectedTab === 'future' ? styles.contentCatalog : ''}`}>
        {selectedTab === 'past' ? (
          <Gallery
            categories={ARCHIVE_CATEGORIES}
            exhibits={archiveExhibitsForGallery}
            category="past"
            onExhibitSelect={handleExhibitionSelect}
            onBack={() => navigate('/')}
            conceptMode
            title="ПРОШЕДШИЕ ЭКСПОЗИЦИИ"
          />
        ) : (
          <ArchiveFutureProjects
            items={futureItems}
            loading={!data}
            onItemSelect={handleFutureProjectSelect}
            onBack={() => navigate('/')}
          />
        )}
      </div>
    </div>
  )
}

export default ArchivePage
