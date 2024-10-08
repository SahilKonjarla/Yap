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
import {AuthContext} from "./Home/context/authContext";
import { QueryClient, QueryClientProvider} from '@tanstack/react-query';

function App() {
    const queryClient = new QueryClient();

    const {currentUser} = useContext(AuthContext)

    const {darkMode} = useContext(DarkModeContext)

    const ProtectedRoute = ({children}) => {
        if (!currentUser) {
            console.log("Not logged in")
            return <Navigate to="/login" />
        } else {
            return children;
        }
    }

    const Layout = () => {
        return (
            <QueryClientProvider client={queryClient}>
                <div className={`theme-${darkMode ? "dark" : "light"}`}>
                    <Navbar/>
                    <div style={{display: "flex"}}>
                        <LeftBar/>
                        <div style={{flex: 6}}>
                            <Outlet/>
                        </div>
                        <RightBar/>
                    </div>
                </div>
            </QueryClientProvider>
        );
    };

    const router = createBrowserRouter([
        {
            path: "/",
            element: (
                <ProtectedRoute>
                    <Layout/>
                </ProtectedRoute>),
            children: [
                {
                    path: "/",
                    element: <HomePage/>
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