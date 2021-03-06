import { userResponse } from "@helpers/users";
import models from "@models";
import { socialAuthConfig } from "@configs/passport";

const { Users } = models;

export const getUserProfileFromApis = (token, tokenSecret, profile, done) => {
  process.nextTick(async () => {
    try {
      const foundUser = await Users.findOne({
        where: {
          email: profile.emails[0].value
        }
      });
      if (!foundUser || Object.keys(foundUser).length === 0) {
        const displayName = profile.displayName.split(" ");
        const newUser = await Users.create({
          email: profile.emails[0].value,
          lastName: displayName[0],
          firstName: displayName[1],
          middleName: displayName[2] || "",
          imageURL: profile.photos[0].value,
          isVerified: true,
          gender: profile.gender || "",
          password: ""
        });
        return done(null, userResponse(newUser));
      }
      if (!foundUser.get("isVerified")) {
        await foundUser.activateAccount();
      }

      return done(null, userResponse(foundUser));
    } catch (error) {
      return done(null, {
        error: "There was problem trying to verify your account"
      });
    }
  });
};

export const getOAuthCredentials = platform => {
  return socialAuthConfig[platform];
};
