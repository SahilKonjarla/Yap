import "./posts.scss"
import Post from "../post/Post"
import { useQuery } from '@tanstack/react-query'

const Posts = ({userID}) => {

    const { isPending, error, data } = useQuery({
        queryKey: ['posts'],
        queryFn: () =>
            fetch('https://localhost:5001/getposts').then((res) => {
                return res.json()
            })
    })

    if (isPending) return 'Loading...'

    if (error) return 'An error has occurred: ' + error.message

    console.log(data)
    return (
        <div className="posts">
            {error
                ? "Something went wrong!"
                : isPending
                ? "loading"
                    : data.map((post) => <Post post={post} key={post.id}/>)}
        </div>
    )
};

export default Posts