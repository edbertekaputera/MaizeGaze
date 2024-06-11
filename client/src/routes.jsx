import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UnAuthenticatedRoute from "./Components/Authentication/UnauthenticatedRoute";
import PrivateRoute from "./Components/Authentication/PrivateRoute";
import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";
import UserDashboard from "./Pages/UserDashboard";
import AdminHomePage from "./Pages/AdminHomePage";
import ActivateEmailPage from "./Pages/ActivateEmailPage";
import DetectionPage from "./Pages/DetectionPage";
import ResultHistoryPage from "./Pages/ResultHistoryPage";
import ResetPasswordPage from "./Pages/ResetPasswordPage";
import NewPasswordPage from "./Pages/NewPasswordPage";
import LandingPage from "./Pages/LandingPage";

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
							<LandingPage />
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

				{/* Reset Password Page Route */}
				<Route
					exact
					path="/reset_password"
					element={
						<UnAuthenticatedRoute>
							<ResetPasswordPage />
						</UnAuthenticatedRoute>
					}
				/>

				{/* TOKEN Activation Email Route */}
				<Route exact path="/activate_account/:token" element={<ActivateEmailPage />} />

				{/* TOKEN New Password Route */}
				<Route exact path="/new_password/:token" element={<NewPasswordPage />} />

				{/* Admin Routes */}
				<Route
					exact
					path="/administrator"
					element={
						<PrivateRoute admin_only>
							<AdminHomePage />
						</PrivateRoute>
					}
				/>

				{/* User Routes */}
				<Route
					exact
					path="/user"
					element={
						<PrivateRoute user_only>
							<UserDashboard />
						</PrivateRoute>
					}
				/>

				<Route
					exact
					path="/user/detect"
					element={
						<PrivateRoute user_only>
							<DetectionPage />
						</PrivateRoute>
					}
				/>

				<Route
					exact
					path="/user/result_history"
					element={
						<PrivateRoute user_only>
							<ResultHistoryPage />
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
				<Route
					path="*"
					element={
						<UnAuthenticatedRoute>
							<LandingPage />
						</UnAuthenticatedRoute>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}
