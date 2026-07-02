import { useState, useEffect, useMemo } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import styles from './Header.module.css'

import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'

const DEFAULT_TITLE = 'ЗАЛ ВРЕМЕННЫХ ВЫСТАВОК'

const isConceptCatalogItem = (pathname) => /^\/concept\/catalog\/[^/]+$/.test(pathname)
const isArchiveCatalogItem = (pathname) => /^\/archive\/[^/]+\/catalog\/[^/]+$/.test(pathname)
const isArchiveExhibitionPage = (pathname) =>
  pathname.startsWith('/archive/') &&
  !pathname.includes('/catalog') &&
  !pathname.startsWith('/archive/future')
const isArchiveFutureProjectPage = (pathname) => /^\/archive\/future\/[^/]+$/.test(pathname)
const isCatalogItemPage = (pathname) =>
  isConceptCatalogItem(pathname) || isArchiveCatalogItem(pathname)

function getCatalogItemIdFromPathname(pathname) {
  if (isConceptCatalogItem(pathname)) {
    const m = pathname.match(/^\/concept\/catalog\/([^/]+)$/)
    return m ? m[1] : null
  }
  if (isArchiveCatalogItem(pathname)) {
    const m = pathname.match(/^\/archive\/[^/]+\/catalog\/([^/]+)$/)
    return m ? m[1] : null
  }
  return null
}

function Header() {
  const location = useLocation()
  const params = useParams()
  const navigate = useNavigate()
  const pathname = location.pathname

  const onCatalogItemPage = isCatalogItemPage(pathname)
  const isConceptCatalog = isConceptCatalogItem(pathname)
  const isArchiveCatalog = isArchiveCatalogItem(pathname)
  const id = params.id ?? getCatalogItemIdFromPathname(pathname)

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [catalogItemsForNav, setCatalogItemsForNav] = useState([])
  const [archiveExhibitionTitle, setArchiveExhibitionTitle] = useState('')
  const [archiveFutureProjectName, setArchiveFutureProjectName] = useState('')

  useEffect(() => {
    if (!onCatalogItemPage) {
      setCatalogItemsForNav([])
      return
    }
    if (isConceptCatalog) {
      fetch('/data/currentExhibition.json')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setCatalogItemsForNav(data?.catalog ?? []))
        .catch(() => setCatalogItemsForNav([]))
      return
    }
    if (isArchiveCatalog) {
      const exhibitionId = pathname.match(/^\/archive\/([^/]+)\/catalog\//)?.[1]
      fetch('/data/archive.json')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const past = data?.past ?? []
          const exhibition = past.find((e) => String(e.id) === String(exhibitionId))
          setCatalogItemsForNav(exhibition?.catalog ?? [])
        })
        .catch(() => setCatalogItemsForNav([]))
      return
    }
    setCatalogItemsForNav([])
  }, [onCatalogItemPage, isConceptCatalog, isArchiveCatalog, pathname])

  useEffect(() => {
    const isArchiveExh = isArchiveExhibitionPage(pathname)
    const isFuture = isArchiveFutureProjectPage(pathname)
    if (!isArchiveExh && !isFuture) {
      setArchiveExhibitionTitle('')
      setArchiveFutureProjectName('')
      return
    }
    fetch('/data/archive.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return
        if (isArchiveExh) {
          const exhibitionId = pathname.replace(/^\/archive\//, '').split('/')[0]
          const past = data.past ?? []
          const exhibition = past.find((e) => String(e.id) === String(exhibitionId))
          setArchiveExhibitionTitle(exhibition?.title ?? exhibition?.name ?? '')
        }
        if (isFuture) {
          const projectId = pathname.replace(/^\/archive\/future\//, '')
          const future = data.future ?? []
          const project = future.find((e) => String(e.id) === String(projectId))
          setArchiveFutureProjectName(project?.title ?? project?.name ?? '')
        }
      })
      .catch(() => {
        setArchiveExhibitionTitle('')
        setArchiveFutureProjectName('')
      })
  }, [pathname])

  const currentItem = useMemo(() => {
    if (id == null || id === '' || !catalogItemsForNav.length) return null
    const idStr = String(id)
    return (
      catalogItemsForNav.find(
        (i) => String(i.id) === idStr || i.id === id || i.id === parseInt(id, 10)
      ) ?? null
    )
  }, [id, catalogItemsForNav])

  const currentNavIndex = useMemo(() => {
    if (!currentItem || !catalogItemsForNav.length) return -1
    const idx = catalogItemsForNav.findIndex(
      (i) => i.id === currentItem.id || String(i.id) === String(currentItem.id)
    )
    return idx >= 0 ? idx : -1
  }, [currentItem, catalogItemsForNav])

  const prevItem = currentNavIndex > 0 ? catalogItemsForNav[currentNavIndex - 1] : null
  const nextItem =
    currentNavIndex >= 0 && currentNavIndex < catalogItemsForNav.length - 1
      ? catalogItemsForNav[currentNavIndex + 1]
      : null

  const baseCatalogPath = isConceptCatalog
    ? '/concept/catalog'
    : isArchiveCatalog
      ? `/archive/${pathname.split('/')[2]}/catalog`
      : '/concept/catalog'
  const closePath = isConceptCatalog ? '/concept' : isArchiveCatalog ? `/archive/${pathname.split('/')[2]}` : '/concept'

  const handlePrevItem = () => {
    if (prevItem) navigate(`${baseCatalogPath}/${prevItem.id}`, { replace: true })
  }
  const handleNextItem = () => {
    if (nextItem) navigate(`${baseCatalogPath}/${nextItem.id}`, { replace: true })
  }
  const handleCloseItem = () => {
    const state = isConceptCatalog ? { state: { tab: 'catalog' } } : isArchiveCatalog ? { state: { tab: 'past' } } : undefined
    navigate(closePath, state)
  }

  const handleSearchToggle = () => setSearchOpen((prev) => !prev)
  const handleOverlayClick = () => setSearchOpen(false)
  const handleSearchSubmit = (e) => {
    e?.preventDefault?.()
    setSearchOpen(false)
  }

  const archiveExhibitionHeaderTitle =
    archiveExhibitionTitle ? `ПРОШЕДШИЕ ЭКСПОЗИЦИИ -> ${archiveExhibitionTitle}` : 'ПРОШЕДШИЕ ЭКСПОЗИЦИИ'
  const isFutureProjectPage = isArchiveFutureProjectPage(pathname)
  const headerTitle =
    onCatalogItemPage && currentItem
      ? (currentItem.name ?? DEFAULT_TITLE)
      : isArchiveExhibitionPage(pathname)
        ? archiveExhibitionHeaderTitle
        : isFutureProjectPage
          ? DEFAULT_TITLE
          : DEFAULT_TITLE
  const headerSubtitle = isFutureProjectPage && archiveFutureProjectName
    ? `БУДУЩИЕ ПРОЕКТЫ -> ${archiveFutureProjectName}`
    : null
  const showOverlay = searchOpen && isArchiveCatalog
  const showHeaderActions = onCatalogItemPage

  return (
    <>
      <header
        className={`${styles.header} ${isFutureProjectPage ? styles.headerFutureProject : ''}`}
      >
        <div
          className={`${styles.headerTitleBlock} ${isFutureProjectPage ? styles.headerFutureProjectTitleBlock : ''}`}
        >
          <h1 className={styles.headerTitle}>{headerTitle}</h1>
          {headerSubtitle && <p className={styles.headerSubtitle}>{headerSubtitle}</p>}
        </div>

        {showHeaderActions && (
          <div className={styles.headerActions}>
            {isConceptCatalog && (
              <>
                <div className={styles.headerItemNavArrows}>
                  <button
                    type="button"
                    className={styles.headerItemNavBtn}
                    onClick={handlePrevItem}
                    disabled={!prevItem}
                    aria-label="Предыдущий предмет"
                  >
                    <ArrowBackIosNewIcon />
                  </button>
                  <button
                    type="button"
                    className={styles.headerItemNavBtn}
                    onClick={handleNextItem}
                    disabled={!nextItem}
                    aria-label="Следующий предмет"
                  >
                    <ArrowForwardIosIcon />
                  </button>
                </div>
                <button
                  type="button"
                  className={styles.headerItemNavClose}
                  onClick={handleCloseItem}
                  aria-label="Закрыть, вернуться в каталог"
                >
                  <CloseIcon fontSize="large" />
                </button>

              </>
            )}

            {isArchiveCatalog && (
              <>

                <div className={styles.headerItemNavArrows}>
                  <button
                    type="button"
                    className={styles.headerItemNavBtn}
                    onClick={handlePrevItem}
                    disabled={!prevItem}
                    aria-label="Предыдущий предмет"
                  >
                    <ArrowBackIosNewIcon />
                  </button>
                  <button
                    type="button"
                    className={styles.headerItemNavBtn}
                    onClick={handleNextItem}
                    disabled={!nextItem}
                    aria-label="Следующий предмет"
                  >
                    <ArrowForwardIosIcon />
                  </button>
                </div>
                <button
                  type="button"
                  className={styles.headerItemNavClose}
                  onClick={handleCloseItem}
                  aria-label="Закрыть, вернуться в каталог"
                >
                  <CloseIcon fontSize="large" />
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {showHeaderActions && showOverlay && (
        <div
          className={styles.headerOverlay}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}
    </>
  )
}

export default Header
