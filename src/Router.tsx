import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from './pages/Home.page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
], { basename: "/api/plugins/ots_plugin_template" }); // <-------- TODO: Change this line

export function Router() {
  return <RouterProvider router={router} />;
}
