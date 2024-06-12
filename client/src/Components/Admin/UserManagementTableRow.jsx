import { Button, Checkbox, Table } from "flowbite-react";
import React, { useState } from "react";
import ViewUserModal from "./ViewUserModal";
import { format } from "date-fns";

function UserManagementTableRow({ email, name, tier, suspension_details, email_verified, selected, setSelected }) {
	const [showView, setShowView] = useState(false);

	const handleCheckbox = () => {
		if (selected) {
			setSelected((prev) => {
				let new_set = new Set(prev);
				new_set.delete(email);
				return new_set;
			});
		} else {
			setSelected((prev) => new Set(prev).add(email));
		}
	};

	const getStatus = () => {
		if (suspension_details) {
			const splitted = suspension_details.end_date.split(" ");
			const splitted_date = splitted[0].split("-");
			const splitted_time = splitted[1].split(":");
			const date_obj = new Date(splitted_date[0], parseInt(splitted_date[1]) - 1, splitted_date[2], splitted_time[0], splitted_time[1], splitted_time[2]);
			return `Suspended until ${format(date_obj, "dd MMM yyyy")}`;
		}
		if (!email_verified) {
			return "Unverified";
		}
		if (!suspension_details) {
			return "Active";
		}
		
	};

	return (
		<>
			<ViewUserModal state={showView} setState={setShowView} email={email} suspension_details={suspension_details} />
			<Table.Row className="bg-white">
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">
					<Checkbox checked={selected} onChange={handleCheckbox} />
				</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{name}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{email}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{tier}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">{getStatus()}</Table.Cell>
				<Table.Cell className="whitespace-nowrap font-medium text-gray-900 p-4">
					<Button
						type="button"
						className="bg-custom-green-1 px-2 py-0 hover:bg-custom-green-2 shadow-md ring-custom-green-2"
						onClick={() => setShowView(true)}
					>
						View
					</Button>
				</Table.Cell>
			</Table.Row>
		</>
	);
}

export default UserManagementTableRow;
