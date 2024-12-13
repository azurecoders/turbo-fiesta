import { RequestHandler } from "express";
import { authentication, random } from "helpers";
import { createUser, getUserByEmail } from "./../db/users";

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      res.sendStatus(400); // Send 400 Bad Request
      return; // Early exit after sending the response
    }

    // Fetch user by email
    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password"
    );

    // If user does not exist or user.authentication is not present
    if (
      !user ||
      !user.authentication ||
      !user.authentication.salt ||
      !user.authentication.password
    ) {
      res.sendStatus(400); // Send 400 Bad Request
      return; // Early exit
    }

    // Compare the provided password with the stored hashed password
    const expectedHash = authentication(user.authentication.salt, password);

    // If password does not match
    if (user.authentication.password !== expectedHash) {
      res.sendStatus(400); // Send 400 Bad Request
      return; // Early exit
    }

    // At this point, the user is authenticated, but no further action is specified yet
    res.status(200).json({ message: "Login successful" }); // Send success response
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Send 500 Internal Server Error if something goes wrong
  }
};

export const register: RequestHandler = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      res.sendStatus(400); // Send response, but do not return it
      return;
    }

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      res.sendStatus(400); // Send response, but do not return it
      return;
    }

    const salt = random();
    const user = await createUser({
      email,
      name: username,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });

    res.status(201).json(user); // Send response, but do not return it
  } catch (error) {
    console.error(error);
    res.sendStatus(400); // Send response for errors
  }
};
