import React, { useContext } from "react";
import axios from "axios";
import { Button } from "flowbite-react";
import { AuthContext } from "../Components/Authentication/PrivateRoute";
import { useNavigate } from "react-router-dom";

function AdminHomePage() {
	const { userInfo } = useContext(AuthContext);
	const navigate = useNavigate();

	return (
		<div className="min-h-screen">
			Welcome {userInfo.name}... <br />
			Your email is {userInfo.email}, and you are a {userInfo.type}
		</div>
	);
}

export default AdminHomePage;
