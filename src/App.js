import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { CombinedProvider } from "./contexts/useContext";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./utils/ProtectedRoute";

const SelectionPage = lazy(() => import("./pages/SelectionPage"));
const SignupPage = lazy(() => import("./pages/Signup"));
const LoginTanod = lazy(() => import("./pages/LoginTanod"));
const LoginResident = lazy(() => import("./pages/ResidentLogin"));

//Admin routes
const AdminDashboard = lazy(() => import("./components/users/admin/AdminDashboard"));
const ManageTanod = lazy(() => import("./components/users/admin/Personels"));
const Resources = lazy(() => import("./components/users/admin/Resources"));
const ManageSchedule = lazy(() => import("./components/users/admin/ManageSchedule"));

// Tanod routes
const Dashboard = lazy(() => import("./components/users/tanods/Dashboard"));
const Patrolmap = lazy(() => import("./components/users/tanods/Map"));
const Equipments = lazy(() => import("./components/users/tanods/Equipment"));
const Performance = lazy(() => import("./components/users/tanods/Performance"));
const Schedule = lazy(() => import("./components/users/tanods/Schedule"));
const Incidents = lazy(() => import("./components/users/tanods/Incidents"));
const MyAccount = lazy(() => import("./components/users/tanods/MyAcc"));

// Resident routes
const ResidentRating = lazy(() => import("./components/users/residents/TanodPersonels"));
const Home= lazy(() => import("./components/users/residents/Home"));

function App() {
  return (
    <div className="flex-1 p-6 bg-background text-text">
      <BrowserRouter>
        <CombinedProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <ToastContainer />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<SelectionPage />} />
              <Route path="/tanod-login" element={<LoginTanod />} />
              <Route path="/resident-login" element={<LoginResident />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route element={<Layout />}>
              <Route path="/myaccount" element={<MyAccount />}/>
              </Route>
              {/* Protected Routes for Tanod */}
              <Route element={<Layout />}>
                <Route
                  path="/dashboard"
                  element={<ProtectedRoute userTypeAllowed={["tanod"]}><Dashboard /></ProtectedRoute>}
                />
                <Route
                  path="/patrolmap"
                  element={<ProtectedRoute userTypeAllowed={["tanod"]}><Patrolmap /></ProtectedRoute>}
                />
                <Route
                  path="/equipments"
                  element={<ProtectedRoute userTypeAllowed={["tanod"]}><Equipments /></ProtectedRoute>}
                />
                <Route
                  path="/performance"
                  element={<ProtectedRoute userTypeAllowed={["tanod"]}><Performance /></ProtectedRoute>}
                />
                <Route
                  path="/schedule"
                  element={<ProtectedRoute userTypeAllowed={["tanod"]}><Schedule /></ProtectedRoute>}
                />
                <Route
                  path="/incidents"
                  element={<ProtectedRoute userTypeAllowed={["tanod"]}><Incidents /></ProtectedRoute>}
                />
                
              </Route>

              {/* Protected Routes for Residents */}
              <Route element={<Layout />}>
                <Route
                  path="/home"
                  element={<ProtectedRoute userTypeAllowed={["resident"]}><Home /></ProtectedRoute>}
                />
                <Route
                  path="/ratetanod"
                  element={<ProtectedRoute userTypeAllowed={["resident"]}><ResidentRating /></ProtectedRoute>}
                />
              </Route>
              
              {/* Protected Routes for Admin */}
              <Route element={<Layout />}>
                <Route
                  path="/admindashboard"
                  element={<ProtectedRoute userTypeAllowed={["admin"]}><AdminDashboard /></ProtectedRoute>}
                />
                <Route
                  path="/ManageTanod"
                  element={<ProtectedRoute userTypeAllowed={["admin"]}><ManageTanod /></ProtectedRoute>}
                />
                <Route
                  path="/Resources"
                  element={<ProtectedRoute userTypeAllowed={["admin"]}><Resources /></ProtectedRoute>}
                />
                <Route
                  path="/ManageSchedule"
                  element={<ProtectedRoute userTypeAllowed={["admin"]}><ManageSchedule /></ProtectedRoute>}
                />
              </Route>
              

            </Routes>
          </Suspense>
        </CombinedProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
