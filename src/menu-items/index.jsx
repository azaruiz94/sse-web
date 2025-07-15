// project import
import dashboard from './dashboard';
import pages from './page';
import utilities from './utilities';
import support from './support';
import getSystemMenu from './system.jsx';
import getAdminMenu from './admin.jsx';
import store from '../store/store.js'; // adjust path if needed

// Get current user permissions from Redux store
const state = store.getState();
const permissions = state.auth.user?.permissions || [];

// Build the system menu dynamically
const systemMenu = getSystemMenu(permissions);
const adminMenu = getAdminMenu(permissions);

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [dashboard, pages, utilities, support, systemMenu, adminMenu].filter(Boolean)
};



export default menuItems;
