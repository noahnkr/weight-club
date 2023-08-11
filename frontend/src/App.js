import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout';
import Home from './components/home';
import Checkin from './components/checkin';

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='checkin' element={<Checkin />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
