import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ExhibitPage from '../ExhibitPage/ExhibitPage'
import styles from '../ExhibitPage/CatalogItem.module.css'

function ConceptCatalogExhibitPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/data/currentExhibition.json')
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  const catalog = data?.catalog ?? []
  const currentIndex = catalog.findIndex((e) => e.id === id || String(e.id) === String(id))
  const exhibit = currentIndex >= 0 ? catalog[currentIndex] : null
  const title = data?.title ?? 'Зал временных выставок'

  const handleClose = () => {
    navigate('/concept', { state: { tab: 'catalog' } })
  }

  const handleNavigate = (index) => {
    const nextExhibit = catalog[index]
    if (nextExhibit) {
      navigate(`/concept/catalog/${nextExhibit.id}`, { replace: true })
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
            onClick={() => navigate('/concept', { state: { tab: 'catalog' } })}
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
      category="catalog"
      subcategory="all"
      allExhibits={catalog}
      currentIndex={currentIndex}
      onClose={handleClose}
      onNavigate={handleNavigate}
      title={title}
    />
  )
}

export default ConceptCatalogExhibitPage
