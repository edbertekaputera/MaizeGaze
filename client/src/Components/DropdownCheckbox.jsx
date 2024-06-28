import React from "react";
import { Checkbox, Dropdown, Label } from "flowbite-react";
import { BsArrowDownShort } from "react-icons/bs";

function DropdownCheckbox({ filter, setFilter, update_key, label, icon = null }) {
	return (
		<div className="flex flex-col w-full sm:w-1/2 md:w-fit">
			<Label className="mb-1 text-sm font-semibold">{label}:</Label>
			<Dropdown
				label="Dropdown button"
				className="drop-shadow-md "
				renderTrigger={() => (
					<div className="w-full flex p-2.5 pl-3 flex-row gap-2 justify-between items-center align-middle bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg hover:ring-custom-green-1 hover:border-custom-green-1">
						<div className="flex flex-row gap-2">
							{icon}
							{label}
						</div>
						<BsArrowDownShort size={20} />
					</div>
				)}
			>
				<div className="flex flex-row gap-2 my-2 mx-2 items-center w-full">
					<Checkbox
						checked={Object.values(filter[update_key]).every((value) => value === true)}
						onChange={() => {
							const allChecked = Object.values(filter[update_key]).every((value) => value === true);
							if (allChecked) {
								Object.keys(filter[update_key]).forEach((key) => {
									setFilter((prevFilter) => ({
										...prevFilter,
										[update_key]: {
											...prevFilter[update_key],
											[key]: false,
										},
									}));
								});
							} else {
								Object.keys(filter[update_key]).forEach((key) => {
									setFilter((prevFilter) => ({
										...prevFilter,
										[update_key]: {
											...prevFilter[update_key],
											[key]: true,
										},
									}));
								});
							}
						}}
					/>
					<Label htmlFor="buyer" className="grow">
						All
					</Label>
				</div>
				{Object.keys(filter[update_key]).map((key) => (
					<div key={key} className="flex flex-row flex-grow gap-2 my-2 mx-2 items-center w-full">
						<Checkbox
							id={key}
							checked={filter[update_key][key]}
							onChange={() => {
								setFilter({
									...filter,
									[update_key]: {
										...filter[update_key],
										[key]: !filter[update_key][key],
									},
								});
							}}
						/>
						<Label htmlFor="buyer" className="grow">
							{key}
						</Label>
					</div>
				))}
			</Dropdown>
		</div>
	);
}

export default DropdownCheckbox;
