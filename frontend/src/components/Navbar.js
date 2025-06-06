import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../utils/userContext';
import "../styles/navbar.css"

function Navbar() {
  const { user, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentSection = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/request-leave') return 'requestLeave';
    if (path === '/history') return 'history';
    if (path === '/team-history') return 'team-history';
    if (path === '/calendar') return 'calendar';
    if (path === '/requests') return 'requests';
    if (path === '/profile') return 'profile';
    if (path === '/users') return 'users';
    if (path === '/leave-types') return 'leave-types';
    if (path === '/add-user') return 'add-user';
    if (path === '/add-many-users') return 'add-many-user';
    return 'home';
  };

  if (!user || location.pathname === '/login') return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddUser = () => {
    navigate('/add-user');
  };

  const handleNavClick = (sectionId) => {
    const routeMap = {
      'home': '/',
      'requestLeave': '/request-leave',
      'history': '/history',
      'team-history': '/team-history',
      'calendar': '/calendar',
      'requests': '/requests',
      'profile': '/profile',
      'users': '/users',
      'leave-types': '/leave-types'
    };

    const route = routeMap[sectionId] || '/';
    navigate(route);
  };

  const getNavItems = () => {
    if (user.role.name === 'admin') {
      return [
        { id: 'home', label: 'Home' },
        { id: 'requests', label: 'Requests' },
        { id: 'calendar', label: 'Calendar' },
        { id: 'team-history', label: 'Team History' },
        { id: 'users', label: 'Users' },
        { id: 'leave-types', label: 'Leave Types' }
      ];
    } else {
      const baseNavItems = [
        { id: 'home', label: 'Home' },
        { id: 'requestLeave', label: 'Request Leave' },
        { id: 'history', label: 'History' }
      ];
      
      if (user.role.name !== 'employee') {
        baseNavItems.push(
          { id: 'calendar', label: 'Calendar' },
          { id: 'requests', label: 'Requests' },
          { id: 'team-history', label: 'Team History' },
        );
      }
      
      baseNavItems.push({ id: 'profile', label: 'Profile' });
      
      return baseNavItems;
    }
  };

  const renderHeaderButtons = () => {
    if (user.role.name === 'admin') {
      return (
        <div className="header-buttons">
          <button onClick={handleAddUser} className="add-user-btn">Add User</button>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      );
    } else {
      return (
        <div className="header-buttons">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      );
    }
  };

  const headerClass = user.role.name === 'admin' ? 'admin-header' : 'home-header-enhanced';
  const navbarClass = user.role.name === 'admin' ? 'admin-navbar' : 'home-navbar';

  return (
    <header className={headerClass}>
      <div className="header-top">
        <h2 className='welcome-message'>
          {user.role.name === 'admin' ? (
            <>Welcome <span>Admin</span>!</>
          ) : (
            <>Welcome <span>{user.name}</span>!</>
          )}
        </h2>
        {renderHeaderButtons()}
      </div>

      <nav className={navbarClass}>
        {getNavItems().map(item => (
          <button
            key={item.id}
            className={`nav-btn ${getCurrentSection() === item.id ? 'active' : ''}`}
            onClick={() => handleNavClick(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;