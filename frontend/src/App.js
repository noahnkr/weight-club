import { Route, Routes } from 'react-router-dom'
import Layout from './components/layout'
import Home from './pages/home'
import About from './pages/about'
import Update from './pages/update'

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="update" element={<Update />} />
                    <Route path="about" element={<About />} />
                </Route>
            </Routes>
        </>
    )
}

export default App
