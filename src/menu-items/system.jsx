// assets
import {
  AppstoreAddOutlined,
  AntDesignOutlined,
  BarcodeOutlined,
  BgColorsOutlined,
  FontSizeOutlined,
  LoadingOutlined,
  TeamOutlined,
  BarsOutlined,
  ApartmentOutlined,
  KeyOutlined
} from '@ant-design/icons';

// icons
const icons = {
  FontSizeOutlined,
  BgColorsOutlined,
  BarcodeOutlined,
  AntDesignOutlined,
  LoadingOutlined,
  AppstoreAddOutlined,
  TeamOutlined,
  BarsOutlined,
  ApartmentOutlined,
  KeyOutlined 
};

// ==============================|| MENU ITEMS - SYSTEM ||============================== //

const getSystemMenu = (permissions = []) => {
  const children = [
    permissions.includes('VER_SOLICITANTE') && {
      id: 'solicitantes',
      title: 'Solicitantes',
      type: 'item',
      url: '/solicitantes',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    },
    permissions.includes('VER_RESOLUCION') && {
      id: 'templates',
      title: 'templates',
      type: 'item',
      url: '/templates',
      icon: icons.BarsOutlined,
      breadcrumbs: false
    }
    // ...add more items here as needed
  ].filter(Boolean);

  if (children.length === 0) return null;

  return {
    id: 'sistema',
    title: 'Sistema',
    type: 'group',
    children
  };
};

export default getSystemMenu;