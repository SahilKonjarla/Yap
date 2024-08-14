import "./profile.scss";
import { MdOutlinePlace } from "react-icons/md";
import { IoMdMore } from "react-icons/io";
import Posts from "../Home/posts/Posts"
import { AuthContext } from "../Home/context/authContext"
import { useContext } from "react";

const Profile = () => {
    const {currentUser} = useContext(AuthContext);

    return (
        <div className="profile">
            <div className="images">
                <img
                    src="https://images.pexels.com/photos/13440765/pexels-photo-13440765.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt=""
                    className="cover"
                />
                <img
                    src={`${process.env.PUBLIC_URL}/${currentUser.profilepic}`}
                    alt=""
                    className="profilePic"
                />
            </div>
            <div className="profileContainer">
                <div className="uInfo">
                    <div className="center" >
                        <span>{currentUser.name}</span>
                        <div className="info">
                            <div className="item">
                                <MdOutlinePlace />
                                <span>USA</span>
                            </div>
                        </div>
                        <button>Follow</button>
                    </div>
                    <div className="right">
                        <IoMdMore />
                    </div>
                </div>
                <Posts/>
            </div>
        </div>
    );
};

export default Profile;