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
      icon: icons.BarsOutlined,
      breadcrumbs: false
    },
    permissions.includes('VER_EXPEDIENTE') && {
      id: 'expedientes',
      title: 'Expedientes',
      type: 'item',
      url: '/expedientes',
      icon: icons.BarsOutlined,
      breadcrumbs: false
    },
    permissions.includes('VER_RESOLUCION') && {
      id: 'plantillas',
      title: 'Plantillas',
      type: 'item',
      url: '/templates',
      icon: icons.BarsOutlined,
      breadcrumbs: false
    },
    permissions.includes('VER_RESOLUCION') && {
      id: 'resoluciones',
      title: 'Resoluciones',
      type: 'item',
      url: '/resoluciones',
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