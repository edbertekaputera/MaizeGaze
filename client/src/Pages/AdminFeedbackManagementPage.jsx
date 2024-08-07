import axios from "axios";
import { Card, Label } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import LoadingCard from "../Components/LoadingCard";
import FeedbackManagementTable from "../Components/Admin/FeedbackManagementTable";
import DropdownDoubleSlider from "../Components/DropdownDoubleSlider";

function AdminFeedbackManagementPage() {
	const [feedbacks, setFeedbacks] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [filter, setFilter] = useState({
		minRating: 1,
		maxRating: 5,
	});
	const [sortOrder, setSortOrder] = useState("newest"); // 'newest' or 'oldest'

	const navigate = useNavigate();

	useEffect(() => {
		axios
			.get("/api/admin/feedback_management/query_all_feedbacks")
			.then((res) => {
				if (res.data.status_code === 200) {
					console.log("Received feedbacks:", res.data.feedbacks);
					setFeedbacks(res.data.feedbacks);
				} else {
					console.log(res.data.status_code);
					alert("Failed to load feedbacks. Please try again.");
					navigate("/administrator");
				}
			})
			.catch((err) => {
				console.log(err);
				alert("An error occurred while loading feedbacks. Please try again.");
				navigate("/administrator");
			})
			.finally(() => setIsLoading(false));
	}, []);

	const filterAndSortFeedbacks = () => {
		return feedbacks
			.filter((feedback) => feedback.rating >= filter.minRating && feedback.rating <= filter.maxRating)
			.sort((a, b) => {
				if (sortOrder === "newest") {
					return new Date(b.created_at) - new Date(a.created_at);
				} else {
					return new Date(a.created_at) - new Date(b.created_at);
				}
			});
	};

	return (
		<div className="min-h-screen">
			<LoadingCard show={isLoading}>Loading Feedback...</LoadingCard>

			<Card className="my-6 mx-4 lg:my:10 lg:mx-16 shadow-lg border xl:mb-20">
				<header className="flex flex-wrap flex-row gap-2 justify-between shadow-b border-b-2 pb-5 border-black">
					<h1 className="text-4xl font-extrabold">Feedback Management</h1>
				</header>

				<section className="flex flex-row justify-between gap-4 mt-4">
					<DropdownDoubleSlider
						label={"Rating"}
						dropdown_label={"Rating"}
						filter={filter}
						setFilter={setFilter}
						min_update_key="minRating"
						max_update_key="maxRating"
						upper_limit={5}
						lower_limit={1}
						icon={<FaStar size={20} className="text-gray-400" />}
					/>

					<div className="flex flex-col">
						<Label className="mb-1 text-sm font-semibold">Sort:</Label>
						<select
							className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
							onChange={(e) => setSortOrder(e.target.value)}
							value={sortOrder}
						>
							<option value="newest">Newest First</option>
							<option value="oldest">Oldest First</option>
						</select>
					</div>
				</section>
				<section className="">
					{isLoading ? (
						<p>Loading feedbacks...</p>
					) : feedbacks.length > 0 ? (
						<FeedbackManagementTable feedbacks={filterAndSortFeedbacks()} />
					) : (
						<p>No feedbacks available.</p>
					)}
				</section>
			</Card>
		</div>
	);
}

export default AdminFeedbackManagementPage;
