import Post from "../model/post.model.js";

export const createPost = async (req, res) => {
    try {
        const post = await Post.create({
            user: req.user._id,
            text: req.body.text,
            image: req.body.image,
        });

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });
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
                (id) => id.toString() !== req.user._id.toString()
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