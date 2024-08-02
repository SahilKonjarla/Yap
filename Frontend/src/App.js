import React, {useContext} from "react";
import './App.css';
import "./Home/style.scss"
import LoginForm from './Login/LoginForm';
import Signup from './Signup/Signup';
import HomePage from './Home/HomePage';
import {createBrowserRouter, Navigate, Outlet, RouterProvider} from "react-router-dom";
import Navbar from "./Home/navbar/Navbar";
import LeftBar from "./Home/leftbar/LeftBar";
import RightBar from "./Home/rightbar/RightBar";
import Profile from "./Profile/Profile";
import {DarkModeContext} from "./Home/context/darkModeContext";

function App() {

    const currentUser = true

    const {darkMode} = useContext(DarkModeContext)

    const ProtectedRoute = ({children}) => {
        if (!currentUser) {
            return <Navigate to="/login" />
        }
        return children
    }

    const Layout = () => {
        return (
            <div className={`theme-${darkMode ? "dark" : "light"}`}>
                <Navbar />
                <div style={{display: "flex"}}>
                    <LeftBar />
                    <div style={{flex: 6}}>
                        <Outlet />
                    </div>
                    <RightBar />
                </div>
            </div>
        )
    }

    const router = createBrowserRouter([
        {
          path: "/",
          element: (
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>),
            children: [
                {
                    path: "/",
                    element: <HomePage />
                },
                {
                    path: "/profile/:id",
                    element: <Profile />
                }
            ]
        },
        {
            path: "/login",
            element: <LoginForm />
        },
        {
            path: "/signup",
            element: <Signup />
        }
    ])

    return (
        <div>
            <RouterProvider router={router} />
        </div>
    );
}


export default App;