import User from "../model/user.model.js";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";

export const savePushToken = async (req, res) => {

  try {

    const { expoPushToken } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.expoPushToken = expoPushToken;

    await user.save();

    res.json({
      message: "Push token saved",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};



export const getAllUsers =
  async (req, res) => {

    try {

      const users =
        await User.find()
          .select("-password");

      res.json(users);

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });
    }
};

export const updateProfile =
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.user._id
        );

      if (!user) {

        return res.status(404).json({

          success: false,

          message:
            "User not found",

        });
      }

      let profileImage =
        user.profileImage;

      // UPLOAD IMAGE

      if (req.file) {

        const result =
          await cloudinary.uploader.upload(

            req.file.path,

            {

              folder:
                "creatorhub_profiles",

            }
          );

        profileImage =
          result.secure_url;

        // DELETE LOCAL FILE

        if (
          fs.existsSync(
            req.file.path
          )
        ) {

          fs.unlinkSync(
            req.file.path
          );
        }
      }

      // UPDATE USER

      user.name =
        req.body.name ||
        user.name;

      user.email =
        req.body.email ||
        user.email;

      user.profileImage =
        profileImage;

      await user.save();

      res.status(200).json({

        success: true,

        message:
          "Profile updated successfully",

        user,

      });

    } catch (error) {

      console.log(error);

      // DELETE FILE IF ERROR

      if (
        req.file &&
        fs.existsSync(
          req.file.path
        )
      ) {

        fs.unlinkSync(
          req.file.path
        );
      }

      res.status(500).json({

        success: false,

        message:
          error.message,

      });
    }
};