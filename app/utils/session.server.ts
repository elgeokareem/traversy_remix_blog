import bcrypt from "bcrypt";
import { db } from "./db.server";
import { createCookieSessionStorage, redirect } from "remix";

export async function login({ username, password }) {
  const user = await db.user.findUnique({
    where: {
      username
    }
  });

  if (!user) {
    return null;
  }

  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isCorrectPassword) {
    return null;
  }

  return user;
}

// Register new user
export async function register({ username, password }) {
  const passwordHash = await bcrypt.hash(password, 10);
  return db.user.create({
    data: {
      username,
      passwordHash
    }
  });
}

// Get session secret
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error("No session secret");
}

// Create a session storage that uses cookies
const storage = createCookieSessionStorage({
  cookie: {
    name: "remix-session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
    httpOnly: true
  }
});

// Create a session middleware
export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession();
  console.log("session", session);
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session)
    }
  });
}

// Get use session
export function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

// Get user
export async function getUser(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");

  if (!userId) {
    return null;
  }

  try {
    const user = await db.user.findUnique({
      where: {
        id: userId
      }
    });

    return user;
  } catch (error) {
    return null;
  }
}

// Log out user and destroy session
export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));

  return redirect("/auth/logout", {
    headers: { "Set-Cookie": await storage.destroySession(session) }
  });
}
