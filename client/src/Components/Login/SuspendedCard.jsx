import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { Card, Label } from "flowbite-react";
import axios from "axios";
import { format } from "date-fns";

function SuspendedCard() {
	const [suspensionInformation, setSuspensionInformation] = useState({
		end: new Date(),
		reason: "",
	});
	const navigation = useNavigate();

	useEffect(() => {
		axios
			.get("/api/user/get_suspension")
			.then((res) => {
				if (res.data.success) {
					const splitted = res.data.data.end.split(" ");
					const splitted_date = splitted[0].split("-");
					const splitted_time = splitted[1].split(":");
					const date_obj = new Date(
						splitted_date[0],
						parseInt(splitted_date[1]) - 1,
						splitted_date[2],
						splitted_time[0],
						splitted_time[1],
						splitted_time[2]
					);
					setSuspensionInformation((prev) => ({
						...prev,
						end: date_obj,
						reason: res.data.data.reason,
					}));
				}
			})
			.catch((error) => {
				console.log(error);
				logout();
				navigation("/login");
			});
	}, []);

	return (
		<Card>
			<div className="flex flex-col mb-2 text-center justify-center gap-4 px-10">
				<div className="flex flex-col">
					<Label
						className="text-xl"
						value="Your account is suspended until"
					/>
					<Label
						className="text-xl"
						value={format(
							suspensionInformation.end,
							"EEEE, dd MMMM yyyy, hh:mm a"
						)}
					/>
				</div>
				<div className="flex flex-col items-center gap-1">
					<Label className="text-xl" value="Reason:" />
					<p className="text-sm text-gray-700 text-justify">{suspensionInformation.reason}</p>
				</div>
			</div>
		</Card>
	);
}

export default SuspendedCard;
