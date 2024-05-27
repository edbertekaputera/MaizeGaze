import { Label } from "flowbite-react";
import React from "react";

function DoubleSlider({
	label,
	filter,
	setFilter,
	min_update_key,
	max_update_key,
	max,
	min = 0,
}) {
	return (
		<div className="flex flex-col">
			<Label className="font-normal">{label}:</Label>
			<div className="w-full bg-gray-200 rounded-full h-1.5 relative mt-6">
				<div
					className="bg-indigo-300 h-1.5 rounded-full absolute"
					style={{
						left: `${(filter[min_update_key] / max) * 100}%`,
						right: `${100 - (filter[max_update_key] / max) * 100}%`,
					}}
				></div>
			</div>
			<div className="relative mb-6 top-[-7px]">
				<input
					onChange={(e) => {
						const value = parseInt(e.target.value);
						if (value < filter[max_update_key]) {
							setFilter({
								...filter,
								[min_update_key]: value,
							});
						}
					}}
					min={min}
					max={max}
					id="medium-range"
					type="range"
					value={filter[min_update_key]}
					className="absolute w-full h-2 bg-gray-200 bg-transparent rounded-lg appearance-none dark:bg-gray-700 pointer-events-none focus:outline-none"
				></input>
				<input
					onChange={(e) => {
						const value = parseInt(e.target.value);
						if (value > filter[min_update_key]) {
							setFilter({
								...filter,
								[max_update_key]: value,
							});
						}
					}}
					min={0}
					max={max}
					id="medium-range"
					type="range"
					value={filter[max_update_key]}
					className="absolute w-full h-2 bg-gray-200 bg-transparent rounded-lg appearance-none dark:bg-gray-700 pointer-events-none focus:outline-none"
				></input>
				<style>
					{`
                        input::-webkit-slider-thumb {
                            pointer-events: auto;
                        }
                        `}
				</style>
			</div>
			<div className="flex flex-row justify-between">
				<Label className="font-normal">{filter[min_update_key]} </Label>
				<Label className="font-normal">{filter[max_update_key]} </Label>
			</div>
		</div>
	);
}

export default DoubleSlider;
