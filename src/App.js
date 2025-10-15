import './App.css';
// import { Link } from 'react-router-dom';
import Home from './components/Home';
import { BrowserRouter,Route,Routes } from 'react-router-dom';
import Login from './pages/Login';
import Users from './components/Users';
import Orders from './components/Orders';
import Dashboard from './components/Dashboard';
import SignUp from './pages/SignUp';
import TopBar from './components/TopBar';

function App() {
  return (
    
<BrowserRouter>
    <Routes>
<Route path="/Home" element={<Home/>}></Route>
<Route path='/' element={<Login/>}></Route>
<Route path='/Users' element={<Users/>}></Route>
<Route path='/Orders' element={<Orders/>}></Route>
<Route path="/Dashboard" element={<Dashboard/>}></Route>
<Route path='/SignUp' element={<SignUp/>}></Route>
<Route path='/TopBar' element={<TopBar/>}/>
{/* <Route path="/Recipe/:id" element={<RecipeDetails items={items}/>}></Route>
<Route path="/Pratice" element={<Pratice/>}></Route>
<Route path="/About" element={<About/>}></Route>
<Route path="/Contact" element={<Contact/>}></Route> */}

    </Routes>
    </BrowserRouter>
  );
}

export default App;
