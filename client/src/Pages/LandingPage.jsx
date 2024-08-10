import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Navbar } from "flowbite-react";
import logo from "../assets/full_logo.png";
import logo2 from "../assets/logo.png";
import dashboard_bg from "../assets/dashboard_bg.png";
import dashboard2_bg from "../assets/dashboard2_bg.png";
import { RiAccountCircleLine } from "react-icons/ri";
import { TbHandClick } from "react-icons/tb";
import RadialBar from "../Components/Storage/RadialBar";
import { BiLineChart } from "react-icons/bi";
import { GiCorn } from "react-icons/gi";
import { TiWeatherPartlySunny } from "react-icons/ti";
import { TbMessageQuestion } from "react-icons/tb";
import { TbReportAnalytics } from "react-icons/tb";
import { MdOutlineYoutubeSearchedFor } from "react-icons/md";
import { GiPlantSeed } from "react-icons/gi";
import { GiArtificialIntelligence } from "react-icons/gi";
import { IoMdLogIn } from "react-icons/io";
import { RiQuestionAnswerLine } from "react-icons/ri";
import { FaCheckCircle } from "react-icons/fa";
import { MdSettingsSuggest } from "react-icons/md";
import { Footer } from "flowbite-react";
import { FaUserDoctor } from "react-icons/fa6";
import { TbMathMaxMin } from "react-icons/tb";

function LandingPage() {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen">
			<section id="about-us" className="relative bg-blend-multiply overflow-y-hidden">
				<img src={dashboard_bg} className="z-0 absolute w-full h-full" alt="Background" />
				<Navbar fluid rounded className="relative z-20 bg-transparent">
					<Navbar.Brand>
						<img src={logo} width={180} alt="Logo" />
					</Navbar.Brand>
					<div className="flex md:order-2 gap-x-2">
						<Button
							className="text-gray-900 items-center py-1 px-1 sm:ms-4 text-base font-medium text-center rounded-lg border border-custom-green-2 hover:bg-gray-100 focus:ring-4 focus:ring-gray-400"
							onClick={() => navigate("/login")}
						>
							<div className="flex items-center gap-x-1">
								<RiAccountCircleLine size={22} />
								<span className="text-sm">Sign In</span>
							</div>
						</Button>
						<Button className="bg-custom-green-2 hover:bg-custom-green-1 focus:ring-4 focus:ring-custom-green-3" onClick={() => navigate("/register")}>
							<div className="flex items-center gap-x-1">
								<TbHandClick size={22} />
								<span className="text-sm">Register</span>
							</div>
						</Button>
						<Navbar.Toggle className="hover:bg-custom-green-3" />
					</div>
					<Navbar.Collapse className="rounded-lg bg-gray-50 md:mt-0 md:border-0">
						<Navbar.Link href="#about-us" className="hover:bg-custom-green-3 border-gray-200 rounded-sm">
							About Us
						</Navbar.Link>
						<Navbar.Link href="#benefits" className="hover:bg-custom-green-3 border-gray-200 rounded-sm">
							Benefits
						</Navbar.Link>
						<Navbar.Link href="#features" className="hover:bg-custom-green-3 border-gray-200 rounded-sm">
							Features
						</Navbar.Link>
						<Navbar.Link href="#plans" className="hover:bg-custom-green-3 border-gray-200 rounded-sm">
							Plans
						</Navbar.Link>
					</Navbar.Collapse>
				</Navbar>
				<div className="relative z-10 px-4 mx-auto max-w-screen-xl py-4 lg:py-16">
					<div className="w-1/2">
						<h1 className="text-md font-extrabold md:text-3xl lg:text-4xl text-center">A New Way to Optimize Your Farming Experience!</h1>
						<p className="mt-5 text-sm px-4 md:text-lg md:mt-7 lg:text-2xl lg:px-8 lg:mt-16">
							Here at <span className="text-custom-brown-1 font-bold">MaizeGaze</span> we provide you with a{" "}
							<span className="text-custom-brown-1 font-semibold ">cutting-edge deep learning technology</span> that allows the automation of tassel
							detection and calculation within a blink of an eye. Say goodbye to tiresome human labor and experience the future of agriculture!
						</p>
					</div>
				</div>
			</section>
			<section>
				<div className="flex w-full bg-custom-green-3 justify-center items-center gap-x-4">
					<div className="w-1/2">
						<RadialBar data={92} />
					</div>
					<div className="w-1/2 flex flex-col items-center justify-center">
						<BiLineChart className="text-red-500" size={100} />
						<dt class="mb-2 text-2xl md:text-2xl font-extrabold">4.42</dt>
						<dd class="font-bold">Mean Absolute Error</dd>
					</div>
				</div>
			</section>
			<section id="benefits" className="relative bg-blend-multiply overflow-y-hidden">
				<img src={dashboard2_bg} className="z-0 absolute w-full h-full" alt="Background" />
				<div className="flex relative z-10 px-4 mx-auto max-w-screen-xl py-4 lg:py-16">
					<div className="w-1/2"></div>
					<div className="w-1/2 ">
						<h1 className="text-md font-extrabold md:text-3xl lg:text-4xl text-center">
							Boost Your Yield with <span className="text-custom-brown-1 font-bold">MaizeGaze</span>'s Powerful Benefits
						</h1>
						<div className="lg:mt-8 mt-4 flex flex-col lg:flex-row gap-4 justify-center">
							<div className="w-full lg:w-1/2 border rounded-lg shadow-md shadow-custom-green-2 hover:shadow-custom-green-1 lg:p-10 p-5">
								<h1 className="font-bold text-md lg:text-xl lg:mb-5 mb-3">Increased Crop Yield</h1>
								<p className="text-sm lg:text-lg text-gray-500">Optimize tassel detection and maximize your harvest.</p>
							</div>
							<div className="w-full lg:w-1/2 border rounded-lg shadow-md shadow-custom-green-2 hover:shadow-custom-green-1 lg:p-10 p-5">
								<h1 className="font-bold text-md lg:text-xl lg:mb-5 mb-3">Cost Savings</h1>
								<p className="text-sm lg:text-lg text-gray-500">Reduce labor costs and streamline operations.</p>
							</div>
						</div>
						<div className="lg:mt-8 mt-4 flex flex-col lg:flex-row gap-4 justify-center">
							<div className="w-full lg:w-1/2 border rounded-lg shadow-md shadow-custom-green-2 hover:shadow-custom-green-1 lg:p-10 p-5">
								<h1 className="font-bold text-md lg:text-xl lg:mb-5 mb-3">Scalability and Flexibility</h1>
								<p className="text-sm lg:text-lg text-gray-500">Adaptable technology for farms of all sizes.</p>
							</div>
							<div className="w-full lg:w-1/2 border rounded-lg shadow-md shadow-custom-green-2 hover:shadow-custom-green-1 lg:p-10 p-5">
								<h1 className="font-bold text-md lg:text-xl lg:mb-5 mb-3">Consultation and Support</h1>
								<p className="text-sm lg:text-lg text-gray-500">Get advice for your farming questions and concerns.</p>
							</div>
						</div>
					</div>
				</div>
			</section>
			<section id="features">
				<div className="w-full bg-custom-green-3 py-4 lg:py-16 justify-center">
					<h1 className="text-md font-extrabold md:text-3xl lg:text-4xl text-center">Features</h1>
					<div className="w-full flex flex-wrap p-5">
						<div className="w-1/2 md:w-1/4 lg:w-1/4 justify-center mb-4 lg:mb-0">
							<div className="flex flex-col text-center items-center hover:border rounded-md border-custom-brown-3 hover:shadow-md p-5">
								<GiCorn className="text-custom-green-2" size={100} />
								<h1 className="font-bold text-md lg:text-xl lg:py-8 py-5">Tassel Detection</h1>
								<p className="text-sm lg:text-lg text-gray-500">Identify and count maize tassels</p>
							</div>
						</div>
						<div className="w-1/2 md:w-1/4 lg:w-1/4 justify-center mb-4 lg:mb-0">
							<div className="flex flex-col text-center items-center hover:border rounded-md border-custom-brown-3 hover:shadow-md p-5">
								<TiWeatherPartlySunny className="text-yellow-300" size={100} />
								<h1 className="font-bold text-md lg:text-xl lg:py-8 py-5">Weather Forecast</h1>
								<p className="text-sm lg:text-lg text-gray-500">Access accurate weather predictions</p>
							</div>
						</div>
						<div className="w-1/2 md:w-1/4 lg:w-1/4 justify-center mb-4 lg:mb-0">
							<div className="flex flex-col text-center items-center hover:border rounded-md border-custom-brown-3 hover:shadow-md p-5">
								<TbMessageQuestion className="text-black" size={100} />
								<h1 className="font-bold text-md lg:text-xl lg:py-8 py-5">Consultation</h1>
								<p className="text-sm lg:text-lg text-gray-500">Get advice for your farming needs</p>
							</div>
						</div>
						<div className="w-1/2 md:w-1/4 lg:w-1/4 justify-center mb-4 lg:mb-0">
							<div className="flex flex-col text-center items-center hover:border rounded-md border-custom-brown-3 hover:shadow-md p-5">
								<TbReportAnalytics className="text-custom-brown-1" size={100} />
								<h1 className="font-bold text-md lg:text-xl lg:py-8 py-5">Analyze Results</h1>
								<p className="text-sm lg:text-lg text-gray-500">Review and analyze detection outcomes</p>
							</div>
						</div>
						<div className="w-1/2 md:w-1/4 lg:w-1/4 justify-center mb-4 lg:mb-0">
							<div className="flex flex-col text-center items-center hover:border rounded-md border-custom-brown-3 hover:shadow-md p-5">
								<MdOutlineYoutubeSearchedFor className="text-gray-500" size={100} />
								<h1 className="font-bold text-md lg:text-xl lg:py-8 py-5">Re-annotate Results</h1>
								<p className="text-sm lg:text-lg text-gray-500">Update and improve annotations</p>
							</div>
						</div>
						<div className="w-1/2 md:w-1/4 lg:w-1/4 justify-center mb-4 lg:mb-0">
							<div className="flex flex-col text-center items-center hover:border rounded-md border-custom-brown-3 hover:shadow-md p-5">
								<GiPlantSeed className="text-custom-green-1" size={100} />
								<h1 className="font-bold text-md lg:text-xl lg:py-8 py-5">Land Management</h1>
								<p className="text-sm lg:text-lg text-gray-500">View and manage land data</p>
							</div>
						</div>
						<div className="w-1/2 md:w-1/4 lg:w-1/4 justify-center mb-4 lg:mb-0">
							<div className="flex flex-col text-center items-center hover:border rounded-md border-custom-brown-3 hover:shadow-md p-5">
								<GiArtificialIntelligence className="text-purple-500" size={100} />
								<h1 className="font-bold text-md lg:text-xl lg:py-8 py-5">Active Learning</h1>
								<p className="text-sm lg:text-lg text-gray-500">Continuously improve detection models</p>
							</div>
						</div>
						<div className="w-1/2 md:w-1/4 lg:w-1/4 justify-center mb-4 lg:mb-0">
							<div className="flex flex-col text-center items-center hover:border rounded-md border-custom-brown-3 hover:shadow-md p-5">
								<FaUserDoctor className="text-custom-green-2" size={100} />
								<h1 className="font-bold text-md lg:text-xl lg:py-8 py-5">Maize Doctor</h1>
								<p className="text-sm lg:text-lg text-gray-500">Get Diagnosis on maize plant's health condition</p>
							</div>
						</div>
						<div className="w-1/2 md:w-1/4 lg:w-1/4 justify-center mb-4 lg:mb-0">
							<div className="flex flex-col text-center items-center hover:border rounded-md border-custom-brown-3 hover:shadow-md p-5">
								<TbMathMaxMin className="text-red-600" size={100} />
								<h1 className="font-bold text-md lg:text-xl lg:py-8 py-5">Tassel Count Interpolation</h1>
								<p className="text-sm lg:text-lg text-gray-500">Interpolate total farm tassel count based on a subset</p>
							</div>
						</div>
						<div className="w-1/2 md:w-1/4 lg:w-1/4 justify-center mb-4 lg:mb-0">
							<div className="flex flex-col text-center items-center hover:border rounded-md border-custom-brown-3 hover:shadow-md p-5">
								<IoMdLogIn className="text-blue-600" size={100} />
								<h1 className="font-bold text-md lg:text-xl lg:py-8 py-5">Fast Login</h1>
								<p className="text-sm lg:text-lg text-gray-500">Quick and easy access</p>
							</div>
						</div>
					</div>
				</div>
			</section>
			<section id="plans">
				<div className="w-full py-4 lg:py-16 justify-center px-10">
					<h1 className="text-md font-extrabold md:text-3xl lg:text-4xl">Subscription Plans</h1>
					<div className="w-full flex flex-wrap lg:py-10 py-5 items-center">
						<div className="w-full md:w-1/3 lg:w-1/3 justify-center mb-4 lg:mb-0 px-5">
							<div className="flex flex-col text-center items-center border rounded-md hover:bg-gray-50 bg-yellow-50 border-yellow-300 text-yellow-300 shadow-lg py-5">
								<h1 className="font-bold text-lg lg:text-2xl lg:py-5 py-2">STANDARD</h1>
								<RiQuestionAnswerLine size={100} />
								<p className="text-sm lg:text-lg lg:py-5 py-2 font-bold text-black">ENJOY ALL THESE FEATURES</p>
								<div className="flex flex-col justify-start text-start lg:py-2">
									<div className="flex flex-row gap-x-2 py-1">
										<FaCheckCircle />
										<span className="text-sm font-bold text-black">Ask questions for farming needs</span>
									</div>
									<div className="flex flex-row gap-x-2 py-1">
										<FaCheckCircle />
										<span className="text-sm font-bold text-black">Re-annotate results</span>
									</div>
									<div className="flex flex-row gap-x-2 py-1">
										<FaCheckCircle />
										<span className="text-sm font-bold text-black">Save and download detection results</span>
									</div>
									<div className="flex flex-row gap-x-2 py-1">
										<FaCheckCircle />
										<span className="text-sm font-bold text-black">Detect and count maize tassel</span>
									</div>
									<div className="flex flex-row gap-x-2 py-1">
										<FaCheckCircle />
										<span className="text-sm font-bold text-black">Visualize maize tassel</span>
									</div>
									<div className="flex flex-row gap-x-2 py-1">
										<FaCheckCircle />
										<span className="text-sm font-bold text-black">Look at weather forecast</span>
									</div>
									<div className="flex flex-row gap-x-2 py-1">
										<FaCheckCircle />
										<span className="text-sm font-bold text-black">Tassel Count Interpolation</span>
									</div>
								</div>
							</div>
						</div>
						<div className="w-full md:w-1/3 lg:w-1/3 justify-center mb-4 lg:mb-0 px-5">
							<div className="flex flex-col text-center items-center border rounded-md hover:bg-gray-50 border-custom-green-2 text-custom-green-2 bg-custom-green-3 shadow-2xl p-5">
								<h1 className="font-bold text-lg lg:text-2xl lg:py-5 py-2">PREMIUM</h1>
								<MdSettingsSuggest size={100} />
								<p className="text-sm lg:text-lg lg:py-5 py-2 font-bold text-black">ENJOY ALL THESE FEATURES</p>
								<div className="flex flex-col text-start justify-start lg:py-2">
									<div className="flex flex-row gap-x-2 py-1">
										<FaCheckCircle />
										<span className="text-sm font-bold text-black">Train model using own datasets</span>
									</div>
									<div className="flex flex-row gap-x-2 py-1">
										<FaCheckCircle />
										<span className="text-sm font-bold text-black">Ask questions for farming needs</span>
									</div>
									<div className="flex flex-row gap-x-2 py-1">
										<FaCheckCircle />
										<span className="text-sm font-bold text-black">Re-annotate results</span>
									</div>
									<div className="flex flex-row gap-x-2 py-1">
										<FaCheckCircle />
										<span className="text-sm font-bold text-black">Save and download detection results</span>
									</div>
									<div className="flex flex-row gap-x-2 py-1">
										<FaCheckCircle />
										<span className="text-sm font-bold text-black">Detect and count maize tassel</span>
									</div>
									<div className="flex flex-row gap-x-2 py-1">
										<FaCheckCircle />
										<span className="text-sm font-bold text-black">Visualize maize tassel</span>
									</div>
									<div className="flex flex-row gap-x-2 py-1">
										<FaCheckCircle />
										<span className="text-sm font-bold text-black">Look at weather forecast</span>
									</div>
									<div className="flex flex-row gap-x-2 py-1">
										<FaCheckCircle />
										<span className="text-sm font-bold text-black">Maize Doctor</span>
									</div>
									<div className="flex flex-row gap-x-2 py-1">
										<FaCheckCircle />
										<span className="text-sm font-bold text-black">Tassel Count Interpolation</span>
									</div>
								</div>
							</div>
						</div>
						<div className="w-full md:w-1/3 lg:w-1/3 justify-center mb-4 lg:mb-0 px-5">
							<div className="flex flex-col text-center items-center border rounded-md hover:bg-gray-50 bg-gray-100 border-custom-brown-1 text-custom-brown-1 shadow-lg p-5 pb-22">
								<h1 className="font-bold text-lg lg:text-2xl lg:py-5 py-2">FREE</h1>
								<TiWeatherPartlySunny size={100} />
								<p className="text-sm lg:text-lg lg:py-5 py-2 font-bold text-black">ENJOY ALL THESE FEATURES</p>
								<div className="flex flex-col text-start justify-start lg:py-2">
									<div className="flex flex-row gap-x-2 py-1">
										<FaCheckCircle />
										<span className="text-sm font-bold text-black">Detect and count maize tassel</span>
									</div>
									<div className="flex flex-row gap-x-2 py-1">
										<FaCheckCircle />
										<span className="text-sm font-bold text-black">Visualize maize tassel</span>
									</div>
									<div className="flex flex-row gap-x-2 py-1">
										<FaCheckCircle />
										<span className="text-sm font-bold text-black">Look at weather forecast</span>
									</div>
									<div className="flex flex-row gap-x-2 py-1">
										<FaCheckCircle />
										<span className="text-sm font-bold text-black">Save and download detection results</span>
									</div>
									<div className="flex flex-row gap-x-2 py-1 pb-10">
										<FaCheckCircle />
										<span className="text-sm font-bold text-black">Tassel Count Interpolation</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
			<Footer container className="flex flex-row justify-between items-center bg-custom-brown-3 rounded-none gap-2">
				{/* <Footer.Brand href="#" src={logo} alt="Flowbite Logo" /> */}
				<img src={logo2} alt="Flowbite Logo" width={32} />
				<Footer.Copyright className="text-lg font-bold text-custom-brown-1" by="MaizeGaze" year={2024} />
			</Footer>
		</div>
	);
}

export default LandingPage;
