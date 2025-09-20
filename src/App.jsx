import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

// project imports
import router from 'routes';
import ThemeCustomization from 'themes';
import ScrollTop from 'components/ScrollTop';

// redux
import { fetchMe } from 'store/slices/authSlice';

export default function App() {
  const dispatch = useDispatch();

  // On app start, attempt to load the current user from the SESSION cookie
  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <ThemeCustomization>
      <ScrollTop>
        <RouterProvider router={router} />
      </ScrollTop>
    </ThemeCustomization>
  );
}
