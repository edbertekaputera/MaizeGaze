import { Button } from "flowbite-react";
import { useDropzone } from "react-dropzone";
import React, { useEffect } from "react";

function DropImageInput({ file, setFile, disabled }) {
	const { getRootProps, getInputProps } = useDropzone({
		accept: "image/*",
		noKeyboard: true,
		onDrop: (acceptedFiles) => {
			const acceptedFile = acceptedFiles[0];
			if (acceptedFile.type.startsWith("image/")) {
				const file_size_mb = acceptedFile.size / 1024 / 1024;
				if (file_size_mb <= 10) {
					setFile(
						Object.assign(acceptedFiles[0], {
							preview: URL.createObjectURL(acceptedFiles[0]),
						})
					);
				} else {
					alert(
						`Image is too large (${
							Math.round(file_size_mb * 100) / 100
						}MB). Please upload images under 10MB.`
					);
				}
			} else {
				alert("Invalid file type. Please drop a proper image file.");
			}
		},
	});

	return (
		<div className="flex items-center justify-center w-full h-full">
			<label
				htmlFor="dropzone-file"
				className={
					"flex flex-col items-center justify-center h-full min-h-138 p-5 w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
				}
			>
				{file ? (
					<div className="text-black flex flex-col items-center gap-4 mt-4">
						<img
							src={file.preview}
							onLoad={() => URL.revokeObjectURL(file.preview)}
							className="w-1/2 h-full"
						/>
						{file.name}{" "}
						<span>
							{Math.round((file.size / 1024 / 1024) * 100) / 100}MB
						</span>
						<Button
							size={"xs"}
							color={"red"}
							onClick={() => setFile(null)}
						>
							Remove
						</Button>
					</div>
				) : (
					<div {...getRootProps()}>
						<div className="flex flex-col items-center justify-center pt-5 pb-6">
							<svg
								aria-hidden="true"
								className="w-10 h-10 mb-3 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
								></path>
							</svg>
							<p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
								<span className="font-semibold">Click to upload</span>{" "}
								or drag and drop
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								SVG, PNG, JPG, JPEG or GIF (max 10MB)
							</p>
						</div>
						<input
							id="dropzone-file"
							{...getInputProps()}
							type="file"
							className="hidden"
							disabled={disabled || !file}
						/>
					</div>
				)}
			</label>
		</div>
	);
}

export default DropImageInput;
