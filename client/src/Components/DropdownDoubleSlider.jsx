import { Dropdown, Label } from "flowbite-react";
import React from "react";
import DoubleSlider from "./DoubleSlider";
import { BsArrowDownShort } from "react-icons/bs";

function DropdownDoubleSlider({ filter, setFilter, min_update_key, max_update_key, upper_limit, label, dropdown_label, icon = null }) {
	return (
		<div className="flex flex-col sm:w-1/2 md:w-fit">
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
				<div className="px-4">
					<DoubleSlider
						label={dropdown_label}
						filter={filter}
						setFilter={setFilter}
						min_update_key={min_update_key}
						max_update_key={max_update_key}
						min={0}
						max={upper_limit}
					/>
				</div>
			</Dropdown>
		</div>
	);
}

export default DropdownDoubleSlider;
