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
import AdminUserManagementPage from "./Pages/AdminUserManagementPage";
import UserProfile from "./Pages/UserProfile";
import AdminTierManagementPage from "./Pages/AdminTierManagementPage";
import UserPlanManagementPage from "./Pages/UserPlanManagementPage";
import PurchasePlanPage from "./Pages/PurchasePlanPage";
import MaizeDoctorPage from "./Pages/MaizeDoctorPage";
import ConsultationPage from "./Pages/ConsultationPage";
import ReannotationPage from "./Pages/ReannotationPage";
import FarmManagementPage from "./Pages/FarmManagementPage";
import ReportFeedbackPage from "./Pages/ReportFeedbackPage"
import AdminFeedbackManagementPage from "./Pages/AdminFeedbackManagementPage"
import ModelManagementPage from "./Pages/ModelManagementPage";
import ActiveLearningPage from "./Pages/ActiveLearningPage";

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
				{/* <Route
					exact
					path="/administrator"
					element={
						<PrivateRoute admin_only>
							<AdminHomePage />
						</PrivateRoute>
					}
				/> */}
				<Route
					exact
					path="/administrator/user_management"
					element={
						<PrivateRoute admin_only>
							<AdminUserManagementPage />
						</PrivateRoute>
					}
				/>

				<Route
					exact
					path="/administrator/tier_management"
					element={
						<PrivateRoute admin_only>
							<AdminTierManagementPage />
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

				<Route
					exact
					path="/user/maize_doctor"
					element={
						<PrivateRoute user_only can_diagnose>
							<MaizeDoctorPage />
						</PrivateRoute>
					}
				/>

				<Route
					exact
					path="/user/consultation"
					element={
						<PrivateRoute user_only can_chatbot>
							<ConsultationPage />
						</PrivateRoute>
					}
				/>

				<Route
					exact
					path="/user/active_learn"
					element={
						<PrivateRoute user_only can_active_learn>
							<ActiveLearningPage />
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

				{/* User Profile Route */}
				<Route
					exact
					path="/user/profile"
					element={
						<PrivateRoute user_only>
							<UserProfile />
						</PrivateRoute>
					}
				/>
				{/* User Plan Management Route */}
				<Route
					exact
					path="/user/plan_management"
					element={
						<PrivateRoute user_only>
							<UserPlanManagementPage />
						</PrivateRoute>
					}
				/>

				<Route
					exact
					path="/user/farm_management"
					element={
						<PrivateRoute user_only>
							<FarmManagementPage />
						</PrivateRoute>
					}
				/>

				{/* Purchase Plan Route */}
				<Route
					exact
					path="/user/purchase_plan/:plan_name"
					element={
						<PrivateRoute user_only>
							<PurchasePlanPage />
						</PrivateRoute>
					}
				/>

				{/* Re-annotation (After saving detection result) Route */}
				<Route
					exact
					path="/user/reannotate"
					element={
						<PrivateRoute user_only can_reannotate>
							<ReannotationPage />
						</PrivateRoute>
					}
				/>

				{/* Feedback report Route */}
				<Route
					exact
					path="/user/report_feedback"
					element={
						<PrivateRoute user_only>
							<ReportFeedbackPage />
						</PrivateRoute>
					}
				/>

				{/* Model Management */}
				<Route
					exact
					path="/user/model_management"
					element={
						<PrivateRoute user_only can_active_learn>
							<ModelManagementPage />
						</PrivateRoute>
					}
				/>
				{/* Admin view feedback Route */}
				<Route
					exact
					path="/administrator/feedback_management"
					element={
						<PrivateRoute admin_only>
							<AdminFeedbackManagementPage />
						</PrivateRoute>
					}
				/>

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
