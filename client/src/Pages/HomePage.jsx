import React, { useEffect } from "react";
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";

function HomePage() {
	const navigate = useNavigate();
	useEffect(() => {
		navigate("/login");
	}, []);
}

export default HomePage;
