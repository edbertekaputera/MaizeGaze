import axios from "axios";
import React, { useContext } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { FaCircleXmark } from "react-icons/fa6";
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Authentication/PrivateRoute";

function PlanCard({ plan, setShowCancelPlanModal }) {
	const { userInfo } = useContext(AuthContext);
	const { tier, price, can_reannotate, can_chatbot, can_active_learn, can_diagnose, storage_limit, detection_quota_limit } = plan;
	console.log(plan);

	const navigate = useNavigate();
	const handlePurchase = () => {
		navigate(`/user/purchase_plan/${tier}`);
	};

	const convertStorageLimit = (storage_limit) => {
		if (storage_limit >= 1024) {
			return { value: storage_limit / 1024, unit: "GB" };
		}
		return { value: storage_limit, unit: "MB" };
	};

	const { value: storageValue, unit: storageUnit } = convertStorageLimit(storage_limit);

	return (
		<div className="w-full justify-center">
			<div className="text-center items-center border rounded-md bg-gray-100 border-custom-brown-1 text-custom-brown-1 shadow-lg p-5">
				<h1 className="font-bold text-lg lg:text-2xl lg:py-5 py-2">{tier}</h1>
				<p>
					S$ <span className="font-bold text-2xl lg:text-4xl lg:py-5 py-2">{price}</span> /month
				</p>
				<hr className="w-full border-custom-brown-1 my-6" />
				<ul className=" w-full text-black justify-between">
					<li className="w-full flex text-left justify-between items-center py-2">
						<span>Detect and Count Maize Tassel</span>
						<div className="text-custom-green-2 text-xl">
							<FaCheckCircle />
						</div>
					</li>
					<li className="w-full flex text-left justify-between items-center py-2">
						<span>Interactive Model Self-training</span>
						<div className="text-xl">
							{can_reannotate ? <FaCheckCircle className="text-custom-green-2" /> : <FaCircleXmark className="text-red-500" />}
						</div>
					</li>
					<li className="w-full flex text-left justify-between items-center py-2">
						<span>AI-powered Chatbot</span>
						<div className="text-xl">{can_chatbot ? <FaCheckCircle className="text-custom-green-2" /> : <FaCircleXmark className="text-red-500" />}</div>
					</li>
					<li className="w-full flex text-left justify-between items-center py-2">
						<span>Personalized Active Learning</span>
						<div className="text-xl">
							{can_active_learn ? <FaCheckCircle className="text-custom-green-2" /> : <FaCircleXmark className="text-red-500" />}
						</div>
					</li>
					<li className="w-full flex text-left justify-between items-center py-2">
						<span>Diagnose Maize Plant</span>
						<div className="text-xl">{can_diagnose ? <FaCheckCircle className="text-custom-green-2" /> : <FaCircleXmark className="text-red-500" />}</div>
					</li>
					<li className="w-full flex text-left justify-between items-center py-2">
						<span>Detection Quota</span>
						<div className="text-xl font-bold">{detection_quota_limit}</div>
					</li>
					<li className="w-full flex text-left justify-between items-center py-2">
						<span>Storage Limit</span>
						<div className="text-xl font-bold">
							{storageValue} <span className="text-xs"> {storageUnit} </span>
						</div>
					</li>
				</ul>
				<hr className="w-full border-custom-brown-1 my-6" />
				{userInfo.type === tier ? (
					<>
						{userInfo.type === "FREE_USER" ? (
							<div className="flex gap-x-5 justify-center">
								<Button className="bg-custom-brown-1">Current Plan</Button>
							</div>
						) : (
							<div className="flex gap-x-5 justify-center">
								<Button className="bg-custom-brown-1">Current Plan</Button>
								<Button
									className="bg-red-500 hover:bg-red-400"
									onClick={() => {
										setShowCancelPlanModal(true);
									}}
								>
									Cancel Plan
								</Button>
							</div>
						)}
					</>
				) : (
					<>
						{tier === "FREE_USER" ? (
							<div className="flex justify-center">
								<Button className="bg-custom-green-1 bg-transparent text-transparent">Purchase Plan</Button>
							</div>
						) : (
							<div className="flex justify-center">
								<Button className="flex bg-custom-green-1 hover:bg-custom-green-2 justify-center" onClick={handlePurchase}>
									Purchase Plan
								</Button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}

export default PlanCard;
