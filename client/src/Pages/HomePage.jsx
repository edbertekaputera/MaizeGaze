import React from "react";
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";

function HomePage() {
	const navigate = useNavigate()
	return (
		<div>
			Home Page
			<Button onClick={() => navigate("/login")}>Login</Button>
		</div>
	);
}

export default HomePage;
