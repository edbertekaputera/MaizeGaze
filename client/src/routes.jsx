import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UnAuthenticatedRoute from "./Components/Authentication/UnauthenticatedRoute";
import PrivateRoute from "./Components/Authentication/PrivateRoute";
import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";
import HomePage from "./Pages/HomePage";
import UserHomePage from "./Pages/UserHomePage";
import AdminHomePage from "./Pages/AdminHomePage";
import ActivateEmailPage from "./Pages/ActivateEmailPage";
import NavigationBar from "./Components/NavigationBar";
import DetectionPage from "./Pages/DetectionPage";

export default function AppRouter() {
	return (
		<BrowserRouter>
			{/* Routes */}
			<Routes>
				<Route
					exact
					path="/"
					element={
						<UnAuthenticatedRoute>
							<HomePage />
						</UnAuthenticatedRoute>
					}
				/>
				{/* Login Page Route */}
				<Route
					exact
					path="/login"
					element={
						<UnAuthenticatedRoute>
							<LoginPage />
						</UnAuthenticatedRoute>
					}
				/>
				{/* Register Page Route */}
				<Route
					exact
					path="/register"
					element={
						<UnAuthenticatedRoute>
							<SignupPage />
						</UnAuthenticatedRoute>
					}
				/>

				{/* Activation Email Route */}
				<Route
					exact
					path="/activate_account/:token"
					element={<ActivateEmailPage />}
				/>

				{/* Admin Routes */}
				<Route
					exact
					path="/administrator"
					element={
						<PrivateRoute requiredRoles={["ADMINISTRATOR"]}>
							<AdminHomePage />
						</PrivateRoute>
					}
				/>

				{/* User Routes */}
				<Route
					exact
					path="/user"
					element={
						<PrivateRoute
							requiredRoles={[
								"FREE_USER",
								"STANDARD_USER",
								"PREMIUM_USER",
							]}
						>
							<UserHomePage />
						</PrivateRoute>
					}
				/>

				<Route
					exact
					path="/user/detect"
					element={
						<PrivateRoute
							requiredRoles={[
								"FREE_USER",
								"STANDARD_USER",
								"PREMIUM_USER",
							]}
						>
							<DetectionPage />
						</PrivateRoute>
					}
				/>
				{/* <Route
					path="/"
					element={
						<PrivateRoute requiredRole="Administrator">
							<NavigationBar className="dark border-b border-gray-700 py-1 bg-gray-800" />
							<StudentDashboard />
						</PrivateRoute>
					}
				/> */}

				{/* Other routes */}
				{/* <Route exact path="/test" element={<TestPage />} /> */}
			</Routes>
		</BrowserRouter>
	);
}
