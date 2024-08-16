import "./homepage.scss"
import Posts from "./posts/Posts"
import Share from "./share/Share"

function HomePage() {
    document.body.setAttribute("class", "home-page");
    return (
        <div className="home">
            <Share />
            <Posts />
        </div>
    )
}

export default HomePage;