import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import TopUsers from './pages/TopUsers';
import TrendingPosts from './pages/TrendingPosts';
import Feed from './pages/Feed';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 p-4 shadow-md">
          <div className="max-w-7xl mx-auto flex space-x-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-white px-4 py-2 rounded-md font-medium ${
                  isActive ? 'bg-blue-700' : 'hover:bg-blue-500'
                }`
              }
            >
              Top Users
            </NavLink>
            <NavLink
              to="/trending"
              className={({ isActive }) =>
                `text-white px-4 py-2 rounded-md font-medium ${
                  isActive ? 'bg-blue-700' : 'hover:bg-blue-500'
                }`
              }
            >
              Trending Posts
            </NavLink>
            <NavLink
              to="/feed"
              className={({ isActive }) =>
                `text-white px-4 py-2 rounded-md font-medium ${
                  isActive ? 'bg-blue-700' : 'hover:bg-blue-500'
                }`
              }
            >
              Feed
            </NavLink>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<TopUsers />} />
          <Route path="/trending" element={<TrendingPosts />} />
          <Route path="/feed" element={<Feed />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;