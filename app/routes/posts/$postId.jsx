import { useLoaderData, Link, redirect } from "remix"
import { db } from "~/utils/db.server"

export async function loader({ params }) {
  const post = await db.post.findUnique({
    where: { id: params.postId },
  });

  if (!post) {
    throw new Error("Post not found")
  }

  const data = { post }
  return data;
}

export async function action({ request, params }) {
  const form = await request.formData()

  if (form.get("_method") === "delete") {
    const post = await db.post.findUnique({
      where: { id: params.postId },
    });

    if (!post) {
      throw new Error("Post not found")
    }

    await db.post.delete({
      where: { id: params.postId }
    });

    return redirect("/posts")
  }
}

export default function Post() {
  const { post } = useLoaderData(loader);
  
  return (
    <div>
      <div className="page-header">
        <h1>{post.title}</h1>
        <Link to="/posts" className="btn btn-reverse">
          Back
        </Link>
      </div>

      <div className="page-content">
        {post.body}
      </div>

      <div className="page-footer">
        <form method="POST">
          <input type="hidden" name="_method" value="delete" />
          <button className="btn btn-delete">Delete</button>
        </form>
      </div>
    </div>
  )
}