import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { UsersPage } from "./pages/UsersPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import { ProductsPage } from "./pages/catalog/ProductsPage";
import { CollectionsPage } from "./pages/catalog/CollectionsPage";
import { OrdersPage } from "./pages/orders/OrdersPage";
import { OrderDetailPage } from "./pages/orders/OrderDetailPage";
import { CurrenciesPage } from "./pages/config/CurrenciesPage";
import { CountriesPage } from "./pages/config/CountriesPage";
import { TaxesPage } from "./pages/config/TaxesPage";
import { ShippingPage } from "./pages/config/ShippingPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppShell } from "./components/AppShell";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/currencies" element={<CurrenciesPage />} />
        <Route path="/countries" element={<CountriesPage />} />
        <Route path="/taxes" element={<TaxesPage />} />
        <Route path="/shipping" element={<ShippingPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/:id" element={<UserDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
