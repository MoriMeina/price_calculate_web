import Home from './pages/home'
import {HashRouter, Navigate, Route, Routes} from 'react-router-dom'

function App() {
  return (
      <HashRouter>
        <Routes>
          <Route path={"/"} element={<Navigate to="/home"/>}/>
          <Route path={"/home"} element={<Home/>}/>
        </Routes>
      </HashRouter>
  )
}

export default App