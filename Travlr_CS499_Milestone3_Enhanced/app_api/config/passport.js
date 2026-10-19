const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const User = require("../models/users");


passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
        },
        async (username, password, done) => {

            console.log("PASSPORT USERNAME:", username);
            console.log("PASSPORT PASSWORD:", password);

            const q = await User.findOne({ email: username }).exec();

            console.log("USER FOUND:", !!q);

            if (!q) {
                return done(null, false, {
                    message: "Incorrect username.",
                });
            }

            console.log("PASSWORD VALID:", q.validPassword(password));

            if (!q.validPassword(password)) {
                return done(null, false, {
                    message: "Incorrect password",
                });
            }

            return done(null, q);
        }
    )
);