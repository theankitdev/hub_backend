import Post from "../model/post.model.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const createPost = async (
  req,
  res
) => {
  try {
    let image = "";

    // UPLOAD IMAGE
    if (req.file) {
      const result =
        await cloudinary.uploader.upload(
          req.file.path,
          {
            folder: "posts",
          }
        );

      image = result.secure_url;

      // DELETE TEMP FILE
      if (
        fs.existsSync(req.file.path)
      ) {
        fs.unlinkSync(req.file.path);
      }
    }

    const post = await Post.create({
      user: req.user._id,

      text: req.body.text,

      image,
    });

    const populatedPost =
      await Post.findById(post._id)
        .populate("user", "name email");

    res.status(201).json(
      populatedPost
    );
  } catch (error) {
    console.log(error);

    // DELETE FILE IF ERROR
    if (
      req.file &&
      fs.existsSync(req.file.path)
    ) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

export const getPosts = async (
  req,
  res
) => {
  try {
    const posts =
      await Post.find()
        .populate(
          "user",
          "name email profileImage"
        )
        .sort({
          createdAt: -1,
        });

    res.json(posts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        const alreadyLiked = post.likes.includes(req.user._id);

        if (alreadyLiked) {
            post.likes = post.likes.filter(
                (id) =>
                    id.toString() !== req.user._id.toString()
            );
        } else {
            post.likes.push(req.user._id);
        }

        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};