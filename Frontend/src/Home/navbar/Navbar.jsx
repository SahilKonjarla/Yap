import React, { useContext } from 'react'
import "./navbar.scss"
import { BiHomeAlt2, BiSearchAlt, BiGridAlt } from "react-icons/bi";
import { MdOutlinePerson, MdOutlineDarkMode, MdOutlineWbSunny } from "react-icons/md";
import { BiBell } from "react-icons/bi";
import { CiMail } from "react-icons/ci";
import {Link, useNavigate} from "react-router-dom";
import {DarkModeContext} from "../context/darkModeContext";
import {AuthContext} from "../context/authContext";

const Navbar = () => {

    const { toggle, darkMode } = useContext(DarkModeContext);
    const { currentUser } = useContext(AuthContext);

    const navigate = useNavigate();

    return (
        <div className="navbar">
            <div className="left">
                <Link to={'/'} style={{textDecoration: 'none'}}>
                    <span>Yap</span>
                </Link>
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
                <CiMail />
                <BiBell />
                <div className="user">
                    <img src={`${process.env.PUBLIC_URL}/${currentUser.profilepic}`} alt={""}/>
                    <Link
                        to={`/profile/${currentUser.uuid}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        <span className="name">{currentUser.name}</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Navbar;