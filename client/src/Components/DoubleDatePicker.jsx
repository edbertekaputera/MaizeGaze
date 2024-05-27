import React, { useEffect } from "react";
import DatePicker from "./DatePicker";
import { subYears, isBefore, isSameDay } from "date-fns";
import { Label } from "flowbite-react";

function DoubleDatePicker({ filter, setFilter, min_date_key, max_date_key }) {
	useEffect(() => {
		if (
			!isSameDay(filter[max_date_key], filter[min_date_key]) &&
			isBefore(filter[max_date_key], filter[min_date_key])
		) {
			setFilter((prev) => ({
				...prev,
				[min_date_key]: filter[max_date_key],
			}));
		}
	}, [filter[max_date_key]]);

	return (
		<div className="flex flex-col sm:flex-row gap-4 w-full md:w-96">
			<div className="flex flex-col sm:w-1/2">
				<Label className="mb-1 text-sm font-semibold">Start Date:</Label>
				<DatePicker
					data={filter}
					setData={setFilter}
					update_key={min_date_key}
					max_date={filter[max_date_key]}
					className="w-full"
					clearable
				/>
			</div>
			<div className="flex flex-col sm:w-1/2">
				<Label className="mb-1 text-sm font-semibold">End Date:</Label>
				<DatePicker
					data={filter}
					setData={setFilter}
					update_key={max_date_key}
					max_date={new Date()}
					className="w-full"
				/>
			</div>
		</div>
	);
}

export default DoubleDatePicker;
