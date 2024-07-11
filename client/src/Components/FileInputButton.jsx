import React from "react";
import { IoAttachOutline } from "react-icons/io5";

function FileInputButton({ setSelectedFile, fileInputRef, disabled }) {
	const handleButtonClick = () => {
		fileInputRef.current.click();
	};

	function handleFileChange(event) {
		const file = event.target.files[0];
		if (file) {
			// Check if the file is an image
			if (!file.type.startsWith("image/")) {
				alert("Invalid file type. Please drop a proper image file.");
				return;
			}

			// Check if the file size is less than 10MB
			const file_size_mb = file.size / 1024 / 1024;
			if (file_size_mb > 10) {
				alert(`Image is too large (${Math.round(file_size_mb * 100) / 100}MB). Please upload images under 10MB.`);
				return;
			}

			setSelectedFile(
				Object.assign(file, {
					preview: URL.createObjectURL(file),
				})
			);
		}
	}

	return (
		<div className="">
			<IoAttachOutline disabled={disabled} onClick={handleButtonClick} className="p-1.5 bg-yellow-700 text-4xl text-white rounded-3xl hover:bg-custom-brown-1" />
			<input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
		</div>
	);
}

export default FileInputButton;
