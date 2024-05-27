// Imported packages
import React, { useEffect, useRef, useState } from "react";
import {
	addDays,
	addMonths,
	addYears,
	eachDayOfInterval,
	endOfMonth,
	format,
	getDate,
	getDay,
	isBefore,
	isFuture,
	isPast,
	isSameDay,
	isSameMonth,
	isSaturday,
	isSunday,
	isToday,
	startOfMonth,
	subDays,
	subMonths,
	subYears,
} from "date-fns";

// Imported icons
import { AiFillCalendar } from "react-icons/ai";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { Button } from "flowbite-react";

function DateButton({ date, max_date, selected, className, updateData }) {
	return (
		<div
			className={`p-2 rounded-lg
			${
				(isSameDay(date, max_date) || isBefore(date, max_date)) &&
				!isSameDay(date, selected) &&
				"text-black font-semibold hover:bg-gray-200"
			} 
			${
				isBefore(max_date, date) &&
				!isSameDay(date, max_date) &&
				"text-gray-300 hover:bg-transparent"
			} 
			${isSameDay(date, selected) && "bg-custom-green-2 font-semibold text-white"}
			${className}`}
			onClick={() => {
				if (isSameDay(date, max_date) || isBefore(date, max_date)) {
					updateData(date);
				}
			}}
		>
			{getDate(date)}
		</div>
	);
}

export default function DatePicker({
	data,
	setData,
	update_key,
	className,
	max_date,
	clearable = false,
}) {
	const [open, setOpen] = useState(false);
	const [viewed, setViewed] = useState(startOfMonth(new Date()));
	const selected = data[update_key];
	const dropdownRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target)
			) {
				setOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const updateData = (key, value) => {
		setData((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	return (
		<div
			id="select"
			className={className}
			onBlur={() => {
				if (open) {
					setOpen(false);
				}
			}}
		>
			<div
				className={`w-full flex p-2.5 pl-3 flex-row gap-2 justify-start items-center align-middle bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg hover:ring-custom-green-1 hover:border-custom-green-1`}
				onClick={() => setOpen(!open)}
				onBlur={() => setOpen(false)}
			>
				<AiFillCalendar size={20} className="text-gray-400" />
				<span
					className={`${
						(!selected || selected === -1) && "text-gray-400"
					}`}
				>
					{!selected || selected === -1
						? "Select date"
						: format(selected, "d MMM yyyy")}
				</span>
			</div>
			<div
				ref={dropdownRef}
				className={`z-50 absolute w-80 drop-shadow-md bg-white text-left flex-col mt-2 rounded-md 
							${open ? "h-auto" : "hidden"} `}
			>
				<div className="flex flex-row m-1 justify-center items-center gap-10 mb-2">
					<HiArrowLeft
						size={34}
						className={`p-2 text-gray-500 rounded-lg font-semibold 
                        ${
									!isSameMonth(viewed, subYears(max_date, 10)) &&
									"text-black hover:bg-gray-200"
								}`}
						onClick={() => {
							if (!isSameMonth(viewed, subYears(max_date, 10)))
								setViewed(subMonths(viewed, 1));
						}}
					/>
					<span className="p-2 px-0 mx-2 text-center rounded-md font-semibold w-32 text-black">
						{format(viewed, "MMMM yyyy")}
					</span>
					<HiArrowRight
						size={34}
						className={`p-2 text-gray-500 rounded-lg font-semibold 
                        ${
									!isSameMonth(viewed, max_date) &&
									"text-black hover:bg-gray-200"
								}
									`}
						onClick={() => {
							if (!isSameMonth(viewed, max_date))
								setViewed(addMonths(viewed, 1));
						}}
					/>
				</div>
				<div className="grid grid-cols-7 m-1 mx-3 justify-center items-center gap-1 text-center text-gray-400 font-sans font-semibold">
					<span className="p-2">Su</span>
					<span className="p-2">Mo</span>
					<span className="p-2">Tu</span>
					<span className="p-2">We</span>
					<span className="p-2">Th</span>
					<span className="p-2">Fr</span>
					<span className="p-2">Sa</span>
				</div>
				<div className="grid grid-cols-7 m-1 mx-3 justify-center items-center text-center gap-1 text-gray-900 font-sans font-semibold">
					{isSunday(viewed) ? (
						<></>
					) : (
						eachDayOfInterval({
							start: subDays(
								endOfMonth(subMonths(viewed, 1)),
								parseInt(getDay(viewed)) - 1
							),
							end: endOfMonth(subMonths(viewed, 1)),
						}).map((date) => (
							<DateButton
								key={date}
								className="text-gray-300"
								date={date}
								max_date={max_date}
								updateData={(val) => {
									updateData(update_key, val);
									setOpen(false);
								}}
								selected={selected}
							/>
						))
					)}
					{eachDayOfInterval({
						start: viewed,
						end: endOfMonth(viewed),
					}).map((date) => (
						<DateButton
							key={date}
							date={date}
							max_date={max_date}
							updateData={(val) => {
								updateData(update_key, val);
								setOpen(false);
							}}
							selected={selected}
						/>
					))}
					{isSaturday(endOfMonth(viewed)) ? (
						<></>
					) : (
						eachDayOfInterval({
							start: addMonths(viewed, 1),
							end: addDays(
								addMonths(viewed, 1),
								5 - parseInt(getDay(endOfMonth(viewed)))
							),
						}).map((date) => (
							<DateButton
								key={date}
								className="text-gray-300"
								date={date}
								max_date={max_date}
								updateData={(val) => {
									updateData(update_key, val);
									setOpen(false);
								}}
								selected={selected}
							/>
						))
					)}
				</div>

				<div className="m-3 mb-2 flex flex-row gap-3 justify-between items-center align-middle">
					<Button
						className="bg-custom-green-1 rounded-lg text-white text-center text-lg p-2 py-1 w-full m-1 hover:bg-custom-green-2 drop-shadow-sm"
						type="button"
						disabled={
							!isToday(max_date) && isBefore(max_date, new Date())
						}
						onClick={() => {
							updateData(update_key, new Date());
							setViewed(startOfMonth(new Date()));
							setOpen(false);
						}}
					>
						Today
					</Button>
					<Button
						className={`${
							!clearable && "hidden"
						} border rounded-lg text-black text-center text-lg p-2 py-1 w-full m-1 hover:bg-gray-200 drop-shadow-sm border-gray-500`}
						type="button"
						disabled={data[update_key] === -1}
						onClick={() => {
							updateData(update_key, -1);
							setViewed(startOfMonth(new Date()));
							setOpen(false);
						}}
					>
						Clear
					</Button>
				</div>
			</div>
		</div>
	);
}
