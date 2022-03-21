import { useActionData, json, redirect } from "remix";
import { db } from "~/utils/db.server";
import { login, createUserSession, register } from "~/utils/session.server";

function badRequest(data) {
  return json(data, { status: 400 });
}

function validateUsername(username) {
  if (typeof username !== "string" || username.length === 0) {
    return "Username can't be empty";
  }
}

function validatePassword(password) {
  if (typeof password !== "string" || password.length < 5) {
    return "Password must be greater than 5 characters";
  }
}

export const action = async ({ request }) => {
  const form = await request.formData();
  const loginType = form.get("loginType");
  const username = form.get("username");
  const password = form.get("password");

  const fields = { loginType, username, password };

  const fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password)
  };

  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  switch (loginType) {
    case "login": {
      // Find user
      const user = await login({ username, password });
      // Check user
      if (!user) {
        return badRequest({
          fields,
          fieldErrors: {
            username: "Invalid Credentials"
          }
        });
      }
      // Create user session
      return createUserSession(user.id, "/posts");
    }

    case "register":
      {
        // Check if user exists
        const userExists = await db.user.findFirst({
          where: { username }
        });

        if (userExists) {
          return badRequest({
            fields,
            fieldErrors: {
              username: `User ${username} already exists`
            }
          });
        }

        // Create user
        const user = await register({ username, password });

        if (!user) {
          return badRequest({
            fields,
            formError: "Something went wrong"
          });
        }

        // Create user session
        return createUserSession(user.id, "/posts");
      }
      break;

    default:
      return badRequest({ fieldErrors, formError: "Invalid login type" });
  }
};

export default function Login() {
  const actionData = useActionData();

  return (
    <div className="auth-container">
      <div className="page-header">
        <h1>Login</h1>
      </div>

      <div className="page-content">
        <form method="POST">
          <fieldset>
            <legend>Login or Register</legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked={
                  !actionData?.fields?.loginType ||
                  actionData?.fields?.loginType === "login"
                }
              />{" "}
              Login
            </label>

            <label>
              <input type="radio" name="loginType" value="register" /> Register
            </label>
          </fieldset>

          <div className="form-control">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              defaultValue={actionData?.fields?.username}
            />
            <div className="error">
              {actionData?.fieldErrors?.username &&
                actionData.fieldErrors.username}
            </div>
          </div>

          <div className="form-control">
            <label htmlFor="password">Password</label>
            <input type="password" name="password" id="password" />
            <div className="error">
              {actionData?.fieldErrors?.password &&
                actionData.fieldErrors.password}
            </div>
          </div>

          <button className="btn btn-block" type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
