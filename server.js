const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");

const app = express();

// Configure the Google strategy for use by Passport.
passport.use(
  new GoogleStrategy(
    {
      clientID: "318926159367-c6av2hoa1lblt8302iovu45gk93tucat.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "https://timesgaze-oauth.vercel.app/auth/google/callback",
    },
    function (token, tokenSecret, profile, done) {
      // Save user profile and tokens here
      done(null, { profile, token, tokenSecret });
    }
  )
);

// Serialize and deserialize user information for session handling.
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Use express-session middleware for session management
app.use(
  session({
    secret: "your_secret_key", // Replace with a secure secret key
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/plus.login",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/photoslibrary",
    ],
    accessType: "offline",
    prompt: "consent",
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Extract tokens and code from user
    const code = req.query.code;
    const accessToken = req.user.token;
    const refreshToken = req.user.tokenSecret;
    const profile = req.user.profile;

    // Create a custom URL to redirect back to your Flutter app
    const redirectUrl = `timesgaze://callback?code=${code}&accessToken=${accessToken}&refreshToken=${refreshToken}&profile=${encodeURIComponent(JSON.stringify(profile))}`;
console.log('Redirecting to:', redirectUrl);
    // Redirect to the custom URL scheme
    res.redirect(redirectUrl);
  }
);

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.get("/", (req, res) => {
  res.send("Home Page");
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
