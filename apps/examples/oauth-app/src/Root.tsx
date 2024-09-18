import { Route, Routes as RouterRoutes } from "react-router-dom";
import { Routes } from "./routes";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";

export function Root() {
  return (
    <RouterRoutes>
      <Route path={Routes.Base} element={<DashboardPage />} />
      <Route path={Routes.Login} element={<LoginPage />} />
      <Route path={Routes.Oauth} element={<LoginPage />} />
    </RouterRoutes>
  );
}
