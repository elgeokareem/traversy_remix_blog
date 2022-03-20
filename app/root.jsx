import { Outlet, LiveReload, Link, Links, Meta } from "remix"
import globalStylesUrl from "~/styles/global.css"

export const links = () => [{ rel: "stylesheet", href: globalStylesUrl }]

export const meta = () => {
  const description = "A cool blog build with remix"
  const keywords = "remix, blog, javascript"

  return { description, keywords }
}

export default function App() {
  return (
    <Document title="kek">
      <Layout>
        <Outlet />
      </Layout>
    </Document>
  );
}

function Document({ children, title }) {
  return (
    <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <Meta />
      <Links />
      <title>{ title ? title : "Me remix blog" }</title>
    </head>
    <body>
      {children}
      {process.env.NODE_ENV === "development" && <LiveReload />}
    </body>
    </html>
  )
}

function Layout({ children }) {
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="logo">
          Remix
        </Link>

        <ul>
          <li>
            <Link to='/posts'>Posts</Link>
          </li>
        </ul>
      </nav>

      <div className="container">
        {children}
      </div>
    </>
  )
}

export function ErrorBoundary({ error }) {
  console.log(error);
  return (
    <Document>
      <Layout>
        <h1>Error</h1>
        <p>
          {error.message}
        </p>
      </Layout>
    </Document>
  )
}
