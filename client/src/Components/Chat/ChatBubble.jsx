import { Avatar, Spinner, Tooltip } from "flowbite-react";
import React, { useContext } from "react";
import { FaStethoscope } from "react-icons/fa6";
import { AuthContext } from "../Authentication/PrivateRoute";
import { format } from "date-fns";
import { MdOutlineFileDownload } from "react-icons/md";

function ChatBubble({ name, icon, time, children, image }) {
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
		<div className="flex items-start gap-2.5 w-full">
			{icon}
			<div className="flex flex-col gap-3">
				<div className="flex items-center space-x-2 rtl:space-x-reverse">
					<span className="font-semibold text-gray-900 dark:text-white">{name}</span>
					{time && <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{format(time, "HH:mm")}</span>}
				</div>
				<div className="leading-1.5 flex w-full flex-col pr-2">
					{children ? (
						children
					) : (
						<div className="flex flex-row gap-x-4 items-center">
							<Spinner size={"xl"} color={"success"} />
							<p>Generating Diagnosis...</p>
						</div>
					)}
					{image && (
						<div className="group relative my-2.5 max-w-[200px] sm:max-w-[320px]">
							<div className="absolute w-full h-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
								<Tooltip content="Download Image">
									<button
										onClick={handleDownload}
										className="inline-flex items-center justify-center rounded-full h-10 w-10 bg-white/30 hover:bg-white/50 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50"
									>
										<MdOutlineFileDownload className="text-white text-2xl" />
									</button>
								</Tooltip>
							</div>
							<img src={image.preview} onLoad={() => URL.revokeObjectURL(image.preview)} className="rounded-lg" />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default ChatBubble;
