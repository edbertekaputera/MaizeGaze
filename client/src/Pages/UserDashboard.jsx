import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Button, Spinner } from "flowbite-react";
import { AuthContext } from "../Components/Authentication/PrivateRoute";
import { useNavigate } from "react-router-dom";
import DropImageInput from "../Components/DropImageInput";
import TasselCountSummaryCard from "../Components/Dashboard/TasselCountSummaryCard";
import background_jumbotron from "../assets/corn_bg.png";
import { HiMiniArrowSmallRight } from "react-icons/hi2";
import { HiArrowNarrowRight } from "react-icons/hi";

function UserDashboard() {
	const { userInfo } = useContext(AuthContext);
	const navigate = useNavigate();

	return (
		<div className="min-h-screen flex flex-col gap-y-5">
			<section class="relative bg-gray-900 bg-blend-multiply overflow-y-hidden">
				<img
					src={background_jumbotron}
					className="z-0 absolute w-full opacity-20"
				/>
				<div class="relative z-10 px-4 mx-auto max-w-screen-xl text-center py-24 lg:py-56">
					<h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl">
						Welcome {userInfo.name}!
					</h1>
					<p class="mb-8 text-lg font-normal text-gray-300 lg:text-xl sm:px-16 lg:px-48">
						Here at{" "}
						<span className="text-custom-brown-2 font-bold">
							MaizeGaze
						</span>{" "}
						we provide you with a{" "}
						<span className="text-custom-brown-2 font-semibold ">
							cutting-edge deep learning technology
						</span>{" "}
						that allows the automation of tassel detection and calculation
						within a blink of an eye. Say goodbye to tiresome human labor
						and experience the future of agriculture!
					</p>
					<div class="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:gap-x-4">
						<Button
							className="bg-custom-green-2 hover:bg-custom-green-1 focus:ring-4 focus:ring-custom-green-3"
							onClick={() => navigate("/user/detect")}
						>
							<div className="flex flex-row justify-center items-center align-middle py-1 px-1 rounded-lg ">
								<span className="text-lg text-white font-medium">
									Start Detecting
								</span>
								<HiArrowNarrowRight
									className="text-center ml-2"
									size={24}
								/>
							</div>
						</Button>
						<Button
							className="hover:text-gray-900 items-center py-1 px-1 sm:ms-4 text-base font-medium text-center text-white rounded-lg border border-white hover:bg-gray-100 focus:ring-4 focus:ring-gray-400"
							onClick={() => navigate("/user/detect")}
						>
							<div className="flex flex-row justify-center items-center align-middle py-1 px-1 rounded-lg ">
								<span className="text-lg font-medium">
									View My Profile
								</span>
							</div>
						</Button>
					</div>
				</div>
			</section>
			<TasselCountSummaryCard className="mt-2" />
		</div>
	);
}

export default UserDashboard;
