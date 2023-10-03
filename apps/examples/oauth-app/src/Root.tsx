import { Route, Routes } from "react-router-dom";
import { MainRoutes } from "./routes";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";

export function Root() {
  return (
    <Routes>
      <Route path={MainRoutes.Base} element={<DashboardPage />} />
      <Route path={MainRoutes.Login} element={<LoginPage />} />
      <Route path={MainRoutes.Oauth} element={<LoginPage />} />
    </Routes>
  );
}
