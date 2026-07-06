import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import SectionStub from './pages/SectionStub'
import NotFound from './pages/NotFound'
import MaterialsIndex from './materials/MaterialsIndex'
import MaterialPage from './materials/MaterialPage'
import LessonsIndex from './lessons/LessonsIndex'
import LessonPage from './lessons/LessonPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="materials" element={<MaterialsIndex />} />
        <Route path="materials/:slug" element={<MaterialPage />} />
        <Route path="lessons" element={<LessonsIndex />} />
        <Route path="lessons/:slug" element={<LessonPage />} />
        <Route path="worksheets" element={<SectionStub title="Worksheets" />} />
        <Route path="parents" element={<SectionStub title="For Parents" />} />
        <Route path="ages" element={<SectionStub title="Browse by Age" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
