import "./homepage.scss"
import Posts from "./posts/Posts"

function HomePage() {
    document.body.setAttribute("class", "home-page");
    return (
        <div className="home">
            <Posts />
        </div>
    )
}

export default HomePage;