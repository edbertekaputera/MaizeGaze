import { Avatar, Spinner, Tooltip } from "flowbite-react";
import React, { useContext } from "react";
import { FaStethoscope } from "react-icons/fa6";
import { AuthContext } from "../Authentication/PrivateRoute";
import { format } from "date-fns";
import { MdOutlineFileDownload } from "react-icons/md";

function ChatBubble({ user, time, children, image }) {
	const { userInfo } = useContext(AuthContext);

	const handleDownload = () => {
		if (image) {
			const reader = new FileReader();
			reader.onload = function (e) {
				const link = document.createElement("a");
				link.href = e.target.result;
				link.download = image.name;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			};
			reader.readAsDataURL(image);
		}
	};

	return (
		<div class="flex items-start gap-2.5 w-full">
			{user ? (
				<Avatar
					rounded
					placeholderInitials={userInfo.name
						.split(" ")
						.map((val) => val[0].toUpperCase())
						.join("")}
					bordered
					color={"success"}
					className="text-2xl"
				/>
			) : (
				<div>
					<FaStethoscope className=" text-custom-green-2  text-4xl" />
				</div>
			)}
			<div class="flex flex-col gap-3">
				<div class="flex items-center space-x-2 rtl:space-x-reverse">
					<span class="font-semibold text-gray-900 dark:text-white">{user ? userInfo.name : "Maize Doctor"}</span>
					{time && <span class="text-sm font-normal text-gray-500 dark:text-gray-400">{format(time, "HH:mm")}</span>}
				</div>
				<div class="leading-1.5 flex w-full flex-col pr-2">
					{children ? (
						children
					) : (
						<div className="flex flex-row gap-x-4 items-center">
							<Spinner size={"xl"} color={"success"} />
							<p>Generating Diagnosis...</p>
						</div>
					)}
					{image && (
						<div class="group relative my-2.5 max-w-[200px] sm:max-w-[320px]">
							<div class="absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
								<Tooltip content="Download Image">
									<button
										onClick={handleDownload}
										class="inline-flex items-center justify-center rounded-full h-10 w-10 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50"
									>
										<MdOutlineFileDownload class="text-white text-2xl" />
									</button>
								</Tooltip>
							</div>
							<img src={image.preview} onLoad={() => URL.revokeObjectURL(image.preview)} class="rounded-lg" />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default ChatBubble;
