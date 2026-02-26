import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header/Header'
import MainMenu from './pages/MainMenu/MainMenu'
import SubMenu from './pages/SubMenu/SubMenu'
import ConceptPage from './pages/ConceptPage/ConceptPage'
import ConceptCatalogExhibitPage from './pages/ConceptPage/ConceptCatalogExhibitPage'
import CurrentExhibitionPage from './pages/CurrentExhibitionPage/CurrentExhibitionPage'
import ArchivePage from './pages/ArchivePage/ArchivePage'
import ArchiveExhibitionPage from './pages/ArchivePage/ArchiveExhibitionPage'
import ArchiveCatalogExhibitPage from './pages/ArchivePage/ArchiveCatalogExhibitPage'
import ArchiveFutureProjectPage from './pages/ArchivePage/ArchiveFutureProjectPage'
import styles from './App.module.css'

function App() {
  const { pathname } = useLocation()
  const showHeader = pathname !== '/'

  return (
    <div className={styles.app}>
      {showHeader && <Header />}
      <main className={styles.mainContent}>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/history" element={<SubMenu />} />
          <Route path="/concept" element={<ConceptPage />} />
          <Route path="/concept/catalog/:id" element={<ConceptCatalogExhibitPage />} />
          <Route path="/exhibition" element={<CurrentExhibitionPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/archive/future/:id" element={<ArchiveFutureProjectPage />} />
          <Route path="/archive/:exhibitionId/catalog/:id" element={<ArchiveCatalogExhibitPage />} />
          <Route path="/archive/:exhibitionId" element={<ArchiveExhibitionPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
