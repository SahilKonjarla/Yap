const express = require("express"); // Creating express var
const app = express(); // Initializing express
const cors = require("cors")
const session = require('express-session')
const cookieParser = require('cookie-parser')
const bcrypt = require("bcrypt");
const pool = require("./db");
const {values} = require("pg/lib/native/query");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

// Middleware
app.use(cors({
   origin: 'http://localhost:3000',
   credentials: true
}));
app.use(express.json()); //req.body
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
   secret: 'secret',
   resave: false,
   sameSite: 'none',
   saveUninitialized: false,
   cookie: {
      secure: 'auto',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24
   }
}));

const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

//ROUTES//

// User Related Middleware //
app.get('/get', (req, res) => {
   if (req.session.username) {
      return res.status(200).json({valid: true, username: req.session.username, message: "Username exists"})
   } else {
      return res.status(404).json({valid: false})
   }
})

// Create New User (Registration)
app.post("/signup",async(req, res) => {
   const { username, email, password } = req.body;

   try {
      const existingUserQuery = "SELECT * FROM users WHERE username = $1 OR email = $2";
      const existingUser = await pool.query(existingUserQuery, [username, email]);

      if (existingUser.rows.length > 0) {
         // If a user is found, return an error
         return res.status(409).json({ message: "Username or email already exists" });
      }

      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const query = "INSERT INTO users (username, email, password) VALUES($1, $2, $3) RETURNING *";
      const values = [username, email, hashedPassword];
      const result  = await pool.query(query, values)

      if (result.rows.length > 0) {
         const { password, ...newUser } = result.rows[0];
         res.status(201).json({newUser, Signup: true, success: true});
      } else {
         throw new Error("Insert Failed");
      }
   } catch (err) {
      console.error("Error on /signup:", err)
      res.status(500).json('Server Error');
   }
})

// Get a User by email or username
app.post("/login", async (req, res) => {
   const { username, password } = req.body;

   try {
      const query = "SELECT * FROM users WHERE username = $1 OR email = $1";
      const { rows } = await pool.query(query, [username]);
      if (rows.length === 0) {
         return res.status(404).json({ success: false, message: "User not found" });
      }

      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
         const q = "SELECT uuid FROM user_data where name = $1"
         const results = await pool.query(q, [username]);
         const token = jwt.sign({ id: results.rows[0].uuid }, "12345678")
         console.log(results.rows[0].uuid)
         req.session.username = user.username;
         res.cookie("accessToken", token, { httpOnly: true }).status(200);
         res.json({ Login: true, success: true, message: "Login successful" });
      } else {
         res.status(401).json({ Login: false, success: false, message: "Invalid password or username" });
      }
   } catch (err) {
      console.error("Error on /login:", err.message);
      res.status(500).json({ success: false, message: "Server Error" });
   }
});

app.post("/logout", async (req, res) => {
   try {
      res.clearCookie("accessToken", {
         secure: 'true',
         sameSite: 'none',
      }).status(200).json({ message: "Logout successful" });
   } catch (err) {
      console.error("Error on /logout:", err.message);
      res.status(501).json({ success: false, message: "Server Error" });
   }
})

// Update a User by email or username
app.put("/update/put", async(req,res) => {
   const { login, newPassword } = req.query;
   const token = req.cookies.accessToken;
   if (!token) return res.status(401).json("Not logged in!");

   jwt.verify(token, "12345678", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
   })

   if (!login) {
      return res.status(400).json({ error: "Missing 'login' query parameter" });
   }
   if (!newPassword) {
      return res.status(400).json({ error: "Missing 'newPassword' query parameter" });
   }

   let query, values;
   if (email_pattern.test(login)) {
      query = "Update users SET password = $1 WHERE email = $2";
      values = [newPassword, login];
   } else {
      query = "UPDATE users SET password = $1 WHERE username = $2";
      values = [newPassword, login];
   }

   try {
      const updateUser = await pool.query(query, values);

      if (updateUser.rows.length > 0) {
         res.status(200).json(updateUser.rows[0]);
      } else {
         res.status(404).json({error: "User not found"});
      }
   } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Server Error" })
   }
});

// Delete a User by email or username
app.delete("/userdelete/delete", async(req,res) => {
   const { login, password } = req.query;
   const token = req.cookies.accessToken;
   if (!token) return res.status(401).json("Not logged in!");

   jwt.verify(token, "12345678", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
   })

   if (!login || !password) {
      return res.status(400).json({ error: "Missing 'login' and/or 'password' query parameter" });
   }

   let findQuery, deleteQuery, values;

   if (email_pattern.test(login)) {
      findQuery = "SELECT * FROM users WHERE email = $1";
      deleteQuery = "DELETE FROM users WHERE email = $2 RETURNING *";
      values = [login];
   } else {
      findQuery = "SELECT * FROM users WHERE username = $1";
      deleteQuery = "DELETE FROM users WHERE username = $2 RETURNING *";
      values = [login];
   }

   try {
      const result = await pool.query(findQuery, values);
      if (result.rows.length === 0) {
         return res.status(404).json({error: "User not found"});
      }
      const user = result.rows[0];
      if (password !== user.password) {
         return res.status(403).json({error: "Passwords do not match"});
      }

      const deleteResult = await pool.query(deleteQuery, values);
      if (deleteResult.rows.length > 0) {
         res.status(200).json(deleteResult.rows[0]);
      } else {
         res.status(404).json({error: "User not found"});
      }
   } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Server Error" })
   }
});

// Delete all data
app.delete("/delete", async (req, res) => {
   try {
      const result = await pool.query("DELETE FROM users");
      res.status(200).json({ message: `Deleted ${result.rowCount} users` });
   } catch (err) {
      console.error(err.message);
      res.status(500).json({error: "Server Error"})
   }
});

// End of User Related Middleware //

// User Data Middleware //
app.post("/createuser", async (req, res) => {
   const { name, profilepic, coverpic} = req.body;

   try {
      existingUserQuery = "SELECT * FROM user_data WHERE name = $1";
      const existingUser = await pool.query(existingUserQuery, [name]);
      if (existingUser.rows.length > 0) {
         return res.status(400).json({error: "user_data already exists"});
      }
      const query = "INSERT INTO user_data (name, profilepic, coverpic) VALUES($1, $2, $3) RETURNING *";
      const values = [name, profilepic, coverpic];
      const result = await pool.query(query, values);

      if (result.rows.length) {
         res.status(201).json({success: true});
      } else {
         throw new Error("Insert Failed");
      }
   } catch (err) {
      console.error("Error on /createuser:", err)
      res.status(500).json('Server Error');
   }
})

// Get a user metadata
app.post("/getuser", async (req, res) => {
   const { name }  = req.body;

   try {
      const query = "SELECT * FROM user_data WHERE name = $1";
      const values = [name];
      const results = await pool.query(query, values);

      if (results.rows.length > 0) {
         res.status(200).json(results.rows[0]);
      } else {
         res.status(404).json({error: "User not found"});
      }
   } catch (err) {
      console.error(err.message);
   }
})

// Get a user metadata on uuid
app.post("/userinfo", async (req, res) => {
   const { uuid }  = req.body;

   try {
      const query = "SELECT * FROM user_data WHERE uuid = $1";
      const values = [uuid];
      const results = await pool.query(query, values);

      if (results.rows.length > 0) {
         res.status(200).json(results.rows[0]);
      } else {
         res.status(404).json({error: "User not found"});
      }
   } catch (err) {
      console.error(err.message);
   }
})

// Post Middleware //

// Get user posts
app.post("/getposts", async (req, res) => {
   const token = req.cookies.accessToken;
   if (!token) return res.status(401).json("Not logged in!");

   const currentUserid = jwt.verify(token, "12345678", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
      return userInfo.id;
   })


   try {
      const query =
          currentUserid === "undefined"
              ? "SELECT p.*, u.uuid AS userId, name, profilepic FROM posts AS p JOIN user_data AS u ON (u.uuid = p.userId) WHERE p.userid = $1 ORDER BY p.created DESC"
              : "SELECT p.*, u.uuid AS userId, name, profilepic FROM posts AS p JOIN user_data AS u ON (u.uuid = p.userId) LEFT JOIN relationships AS r ON (p.userid = r.followeduserid) WHERE r.followeruserid= $1 OR p.userid = $2 ORDER BY p.created DESC";
      const values = currentUserid === "undefined" ? [currentUserid] : [currentUserid, currentUserid];
      const result = await pool.query(query, values);

      if (result.rows.length > 0) {
         res.status(200).json(result.rows);
      } else {
         res.status(404).json({error: "Post not found"});
      }
   } catch (err) {
      console.error(err.message);
      res.status(500).json('Server Error');
   }
})

// Make a post
app.post("/addpost", async (req, res) => {
   const { content } = req.body;
   const token = req.cookies.accessToken;
   if (!token) return res.status(401).json("Not logged in!");

   const currentUserid = jwt.verify(token, "12345678", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
      return userInfo.id;
   })

   try {
      const query = "INSERT INTO posts(userid, content, created) VALUES ($1, $2, NOW()) RETURNING *"
      const values = [currentUserid, content.content];
      const results = await pool.query(query, values);
      if (results.rows.length > 0) {
         res.status(200).json({success: true});
      } else {
         throw new Error("Insert Failed");
      }
   } catch (err) {
      console.error(err.message);
      res.status(500).json('Server Error');
   }
})

// Delete a post
app.post("/deletepost", async (req, res) => {
   const { postid } = req.body;
   const token = req.cookies.accessToken;
   if (!token) return res.status(401).json("Not logged in!");

   const currentUserid = jwt.verify(token, "12345678", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
      return userInfo.id;
   })

   try {
      const query = "DELETE FROM posts WHERE postid = $1 and userid = $2"
      const values = [postid, currentUserid];
      const result = await pool.query(query, values);

      if (result.rows.length > 0) {
         res.status(200).json({success: true});
      }
   } catch (err) {
      console.log(err)
      res.status(500).json('Server Error');
   }
})

// End of post Middleware

// Relationships Middleware //

// Get a relationship
app.post("/getrelationship", async (req, res) => {
   const { followedUserid } = req.body;

   try {
      const query = 'SELECT followeruserid FROM relationships WHERE followeduserid = $1'
      const values = [followedUserid];
      const result = await pool.query(query, values);

      if (result.rows.length > 0) {
         res.status(200).json({success: true});
      }
   } catch (err) {
      console.error(err.message);
      res.status(500).json('Server Error');
   }
});

// Add a relationship
app.post("/addrelationship", async (req, res) => {
   const { followedid } = req.body;
   const token = req.cookies.accessToken;
   if (!token) return res.status(401).json("Not logged in!");

   const currentUserid = jwt.verify(token, "12345678", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
      return userInfo.id;
   })

   try {
      const query = "INSERT INTO relationships(followeruserid, followeduserid) VALUES ($1, $2) RETURNING *"
      const values = [currentUserid, followedid];
      const result = await pool.query(query, values);

      if (result.rows.length > 0) {
         res.status(200).json({success: true});
      } else {
         throw new Error("Insert Failed");
      }
   } catch (err) {
      console.error(err.message);
      res.status(500).json('Server Error');
   }
})

// Delete relationship
app.post("/deleterelationship", async (req, res) => {
   const { followedUserid } = req.body;
   const token = req.cookies.accessToken;
   if (!token) return res.status(401).json("Not logged in!");

   const currentUserid = jwt.verify(token, "12345678", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
      return userInfo.id;
   })

   try {
      const query = "DELETE FROM relationships WHERE followerUserId = $1 AND followedUserId = $2"
      const values = [currentUserid, followedUserid];
      const result = await pool.query(query, values);

      if (result.rows.length > 0) {
         res.status(200).json({success: true});
      }
   } catch (err) {
      console.error(err.message);
      res.status(500).json('Server Error');
   }
})

// End of Relationship Middleware //

// Comments Middleware //

// Get Comments
app.post("/getcomments", async (req, res) => {
   const { postId } = req.body;
   const token = req.cookies.accessToken;
   if (!token) return res.status(401).json("Not logged in!");

   jwt.verify(token, "12345678", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
   })

   try {
      const query = "SELECT c.*, u.uuid AS userId, name, profilepic FROM comments AS c JOIN user_data AS u ON (u.uuid = c.commentuserid) WHERE c.commentpostid = $1 ORDER BY c.created DESC"
      const values = [postId]
      const result = await pool.query(query, values);

      if (result.rows.length > 0) {
         res.status(200).json(result.rows);
      }
   } catch (err) {
      console.error(err.message);
      res.status(500).json('Server Error');
   }
})

// Add a Comment
app.post("/addcomment", async (req, res) => {
   const { content, postid } = req.body;
   const token = req.cookies.accessToken;
   if (!token) return res.status(401).json("Not logged in!");

   const currentUserid = jwt.verify(token, "12345678", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
      return userInfo.id;
   })

   try {
      const query = "INSERT INTO comments(content, created, commentuserid, commentpostid) VALUES ($1, NOW(), $2, $3) RETURNING *";
      const values = [content, currentUserid, postid]
      const result = await pool.query(query, values);

      if (result.rows.length > 0) {
         res.status(200).json({success: true});
      } else {
         throw new Error("Insert Failed");
      }
   } catch (err) {
      console.error(err.message);
      res.status(500).json('Server Error');
   }
})

// Delete Comment
app.post("/deletecomment", async (req, res) => {
   const { commentid } = req.body;
   const token = req.cookies.accessToken;
   if (!token) return res.status(401).json("Not logged in!");

   const currentUserid = jwt.verify(token, "12345678", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
      return userInfo.id;
   })

   try {
      const query = 'DELETE FROM comments WHERE commentid = $1 AND commentuserid = $2';
      const values = [commentid, currentUserid];
      const result = await pool.query(query, values);

      if (result.rows.length > 0) {
         res.status(200).json({success: true});
      }
   } catch (err) {
      console.error(err.message);
      res.status(500).json('Server Error');
   }
})

// End of Comments Middleware //

// Likes Middleware //

// Get likes
app.post("/getlikes", async (req, res) => {
   const { postid } = req.body;

   try {
      const query = "SELECT likesuserid FROM likes WHERE likespostid = $1"
      const values = [postid]
      const result = await pool.query(query, values);

      if (result.rows.length > 0) {
         res.status(200).json(result.rows);
      }
   } catch (err) {
      console.error(err.message);
      res.status(500).json('Server Error');
   }
})

// Add likes
app.post("/addlike", async (req, res) => {
   const { postid } = req.body;
   const token = req.cookies.accessToken;
   if (!token) return res.status(401).json("Not logged in!");

   const currentUserid = jwt.verify(token, "12345678", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
      return userInfo.id;
   })

   try {
      const query = "INSERT INTO likes(likesuserid, likespostid) VALUES ($1, $2) RETURNING *"
      const values = [currentUserid, postid]
      const result = await pool.query(query, values);

      if (result.rows.length > 0) {
         res.status(200).json({success: true});
      }
   } catch (err) {
      console.error(err.message);
      res.status(500).json('Server Error');
   }
})

// Delete likes
app.post("/deletelike", async (req, res) => {
   const { postid } = req.body;
   const token = req.cookies.accessToken;
   if (!token) return res.status(401).json("Not logged in!");

   const currentUserid = jwt.verify(token, "12345678", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
      return userInfo.id;
   })

   try {
      const query = "DELETE FROM likes WHERE likesuserid = $1 AND likespostid = $2"
      const values = [currentUserid, postid]
      const result = await pool.query(query, values);

      res.status(200).json({success: true});
   } catch (err) {
      console.error(err.message);
      res.status(500).json('Server Error');
   }
})

// App is going to be listening for connections on port 1234
app.listen(5001, () => {
   console.log("Server is listening on port 5001....")
});