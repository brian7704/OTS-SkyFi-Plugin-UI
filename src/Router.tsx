import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import SkyFi from "@/pages/SkyFi";
import packageJson from '../package.json';

const router = createBrowserRouter([
  {
    path: '/ui',
    element: <SkyFi />,
  },
], { basename: packageJson.basename });

export function Router() {
  return <RouterProvider router={router} />;
}
