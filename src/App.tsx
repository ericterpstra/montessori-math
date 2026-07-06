import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import SectionStub from './pages/SectionStub'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="materials" element={<SectionStub title="Virtual Materials" />} />
        <Route path="lessons" element={<SectionStub title="Lessons" />} />
        <Route path="worksheets" element={<SectionStub title="Worksheets" />} />
        <Route path="parents" element={<SectionStub title="For Parents" />} />
        <Route path="ages" element={<SectionStub title="Browse by Age" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
