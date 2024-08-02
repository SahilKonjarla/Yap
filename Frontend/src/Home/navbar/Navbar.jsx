import React, { useContext } from 'react'
import "./navbar.scss"
import { BiHomeAlt2, BiSearchAlt, BiGridAlt } from "react-icons/bi";
import { MdOutlinePerson, MdOutlineDarkMode, MdOutlineWbSunny } from "react-icons/md";
import { BiBell } from "react-icons/bi";
import { CiMail } from "react-icons/ci";
import {Link, useNavigate} from "react-router-dom";
import {DarkModeContext} from "../context/darkModeContext";

const Navbar = () => {

    const { toggle, darkMode } = useContext(DarkModeContext);

    const navigate = useNavigate();

    return (
        <div className="navbar">
            <div className="left">
                <Link to={'/'} style={{textDecoration: 'none'}}>
                    <span>Yap</span>
                </Link>
                <BiHomeAlt2 onClick={() => navigate("/")}/>
                {darkMode ? (
                    <MdOutlineWbSunny onClick={toggle}/>
                ) : (
                    <MdOutlineDarkMode onClick={toggle}/>
                )}
                <BiGridAlt />
                <div className={"search"}>
                    <BiSearchAlt />
                    <input type={"text"} placeholder={"Search"}/>
                </div>
            </div>
            <div className="right">
                <MdOutlinePerson />
                <CiMail />
                <BiBell />
                <div className="user">
                    <img src={"https://images.pexels.com/photos/3228727/pexels-photo-3228727.jpeg?auto=compress&cs=tinysrgb&w=1600"} alt={""}/>
                    <span>John Doe</span>
                </div>
            </div>
        </div>
    )
}

export default Navbar;