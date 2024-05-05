import React, { useContext, useState } from "react";
import axios from "axios";
import { Button, Spinner } from "flowbite-react";
import { AuthContext } from "../Components/Authentication/PrivateRoute";
import { useNavigate } from "react-router-dom";
import DropImageInput from "../Components/DropImageInput";

function UserHomePage() {
	const userInfo = useContext(AuthContext);
	const [file, setFile] = useState();
	const [status, setStatus] = useState("");
	const [result, setResult] = useState({});
	const navigate = useNavigate();

	const handleSubmit = (event) => {
		event.preventDefault();
		if (file != null) {
			var formData = new FormData();
			formData.append("image", file);
			axios
				.post("/api/detect/init_detection", formData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				})
				.then((res) => {
					if (res.data.success) {
						setStatus("RUNNING");
						fetchDetectionResult(res.data.result_id);
					} else {
						alert("ERROR");
					}
				})
				.catch((error) => {
					console.log(error);
					alert("ERROR");
				});
		} else {
			alert("Please provide an image...");
		}
	};

	const fetchDetectionResult = async (resultID) => {
		try {
			const res = await axios.get(
				`/api/detect/get_detection_result?result_id=${resultID}`
			);
			if (res.data.status === "ERROR") {
				setStatus(res.data.status);
				alert("ERROR");
			} else if (res.data.status === "SUCCESS") {
				setStatus(res.data.status);
				setResult(res.data.data);
			} else {
				console.log(res.data.status);
				setTimeout(fetchDetectionResult, 500, resultID);
			}
		} catch (error) {
			console.log(error);
			alert("ERROR");
		}
	};
	console.log(result);
	return (
		<div>
			<Button
				onClick={async () => {
					await axios
						.post("/api/authentication/logout")
						.then((res) => {
							if (res.data.status_code === 200) {
								navigate("/");
							}
						})
						.catch((error) => {
							console.log(error);
						});
				}}
			>
				Logout
			</Button>
			<Button onClick={(ev) => handleSubmit(ev)}>Detect</Button>
			<Button
				onClick={() => {
					setStatus("");
					setFile(null);
				}}
			>
				Reset
			</Button>
			Welcome {userInfo.name}... <br />
			Your email is {userInfo.email}, and you are a {userInfo.type}
			{status === "" && (
				<DropImageInput file={file} setFile={setFile} show={true} />
			)}
			{status === "RUNNING" && <Spinner />}
			{status === "ERROR" && "ERROR WHILE DETECTING"}
			{status === "SUCCESS" && (
				<>
					<img src={"data:image/png;base64," + result.annotated_image} />
					<span>COUNT OF TASSEL = {result.tassel_count}</span>
				</>
			)}
		</div>
	);
}

export default UserHomePage;
