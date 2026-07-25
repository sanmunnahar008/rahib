import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute, RoleRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { Toaster } from 'sonner';

import { AuthPage } from './pages/AuthPage';
import { PendingApprovalPage } from './pages/PendingApprovalPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { DealersPage } from './pages/DealersPage';
import { SalesPage } from './pages/SalesPage';
import { AccountsPage } from './pages/AccountsPage';
import { GodownsPage } from './pages/GodownsPage';
import { StockPage } from './pages/StockPage';
import { ProductionPage } from './pages/ProductionPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { RawMaterialsPage } from './pages/RawMaterialsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { AreasPage } from './pages/AreasPage';
import { TerritoriesPage } from './pages/TerritoriesPage';
import { OfficersPage } from './pages/OfficersPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { UsersPage } from './pages/UsersPage';
import { ReportsPage } from './pages/ReportsPage';
import { AreaReportsPage } from './pages/AreaReportsPage';
import { AlertsPage } from './pages/AlertsPage';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-right" richColors closeButton />
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/pending-approval" element={<PendingApprovalPage />} />

          {/* Protected Application Routes inside AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/dealers" element={<DealersPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/godowns" element={<GodownsPage />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/production" element={<ProductionPage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/raw-materials" element={<RawMaterialsPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/areas" element={<AreasPage />} />
            <Route path="/territories" element={<TerritoriesPage />} />
            <Route path="/officers" element={<OfficersPage />} />
            <Route path="/employees" element={<EmployeesPage />} />

            {/* Admin Only Routes */}
            <Route
              path="/users"
              element={
                <RoleRoute roles={['admin']}>
                  <UsersPage />
                </RoleRoute>
              }
            />

            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/area-wise" element={<AreaReportsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
          </Route>

          {/* Catch-all redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
  );
}
