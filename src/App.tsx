import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import AgesPage from './pages/AgesPage'
import NotFound from './pages/NotFound'
import MaterialsIndex from './materials/MaterialsIndex'
import MaterialPage from './materials/MaterialPage'
import LessonsIndex from './lessons/LessonsIndex'
import LessonPage from './lessons/LessonPage'
import WorksheetsIndex from './worksheets/WorksheetsIndex'
import BuilderPage from './worksheets/BuilderPage'
import ParentsIndex from './parents/ParentsIndex'
import GuidePage from './parents/GuidePage'
import KitsIndex from './kits/KitsIndex'
import KitPage from './kits/KitPage'
import PlannerPage from './planner/PlannerPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="materials" element={<MaterialsIndex />} />
        <Route path="materials/:slug" element={<MaterialPage />} />
        <Route path="lessons" element={<LessonsIndex />} />
        <Route path="lessons/:slug" element={<LessonPage />} />
        <Route path="worksheets" element={<WorksheetsIndex />} />
        <Route path="worksheets/:slug" element={<BuilderPage />} />
        <Route path="kits" element={<KitsIndex />} />
        <Route path="kits/:slug" element={<KitPage />} />
        <Route path="planner" element={<PlannerPage />} />
        <Route path="parents" element={<ParentsIndex />} />
        <Route path="parents/:slug" element={<GuidePage />} />
        <Route path="ages" element={<AgesPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
