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

// ==============================|| MENU ITEMS - ADMIN ||============================== //

const getAdminMenu = (permissions = []) => {
  const children = [
    permissions.includes('VER_ESTADO') && {
      id: 'estados',
      title: 'Estados',
      type: 'item',
      url: '/estados',
      icon: icons.BarsOutlined,
      breadcrumbs: false
    },
    permissions.includes('VER_DEPENDENCIA') && {
      id: 'dependencias',
      title: 'Dependencias',
      type: 'item',
      url: '/dependencias',
      icon: icons.ApartmentOutlined
    },
    permissions.includes('VER_USUARIO') && {
      id: 'usuarios',
      title: 'Usuarios',
      type: 'item',
      url: '/usuarios',
      icon: icons.TeamOutlined
    },
    permissions.includes('VER_ROL') && {
      id: 'roles',
      title: 'Roles',
      type: 'item',
      url: '/roles',
      icon: icons.KeyOutlined
    },
    permissions.includes('VER_AUDITORIA') && {
      id: 'auditoria',
      title: 'Auditoría',
      type: 'item',
      url: '/auditoria',
      icon: icons.AppstoreAddOutlined
    }
  ].filter(Boolean);

  if (children.length === 0) return null;

  return {
    id: 'configuracion',
    title: 'Configuración',
    type: 'group',
    children
  };
};

export default getAdminMenu;