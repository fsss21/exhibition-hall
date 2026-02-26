import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ExhibitPage from '../ExhibitPage/ExhibitPage'
import styles from '../ExhibitPage/CatalogItem.module.css'

function ArchiveCatalogExhibitPage() {
  const navigate = useNavigate()
  const { exhibitionId, id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/data/archive.json')
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  const exhibition = (data?.past ?? []).find((e) => String(e.id) === String(exhibitionId))
  const catalog = exhibition?.catalog ?? []
  const currentIndex = catalog.findIndex((e) => e.id === id || String(e.id) === String(id))
  const exhibit = currentIndex >= 0 ? catalog[currentIndex] : null

  const handleClose = () => {
    navigate(`/archive/${exhibitionId}`, { state: { tab: 'past' } })
  }

  const handleNavigate = (index) => {
    const nextExhibit = catalog[index]
    if (nextExhibit) {
      navigate(`/archive/${exhibitionId}/catalog/${nextExhibit.id}`, { replace: true })
    }
  }

  if (loading) {
    return (
      <div className={styles.catalogItemPage}>
        <div className={styles.catalogItemContent}>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!exhibit) {
    return (
      <div className={styles.catalogItemPage}>
        <div className={styles.catalogItemContent}>
          <p>Экспонат не найден.</p>
          <button
            type="button"
            className={styles.catalogItemBackLink}
            onClick={() => navigate(`/archive/${exhibitionId}`, { state: { tab: 'past' } })}
          >
            Вернуться в каталог
          </button>
        </div>
      </div>
    )
  }

  return (
    <ExhibitPage
      exhibit={exhibit}
      category="past"
      subcategory="all"
      allExhibits={catalog}
      currentIndex={currentIndex}
      onClose={handleClose}
      onNavigate={handleNavigate}
    />
  )
}

export default ArchiveCatalogExhibitPage
