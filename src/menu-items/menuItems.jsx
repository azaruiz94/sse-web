import { useSelector } from 'react-redux';
import dashboard from './dashboard';
import pages from './page';
import utilities from './utilities';
import support from './support';
import getSystemMenu from './system.jsx';
import getAdminMenu from './admin.jsx';

const useMenuItems = () => {
  const permissions = useSelector(state => state.auth.user?.permissions || []);
  const systemMenu = getSystemMenu(permissions);
  const adminMenu = getAdminMenu(permissions);

  return {
    items: [dashboard, pages, utilities, support, systemMenu, adminMenu].filter(Boolean)
  };
};

export default useMenuItems;
