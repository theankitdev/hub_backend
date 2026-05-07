import Product from "../model/product.model.js";
import cloudinary from "cloudinary";
import fs from "fs";

export const createProduct = async (
  req,
  res
) => {
  try {

    let image = "";

    // IMAGE UPLOAD
    if (req.file) {

      const result =
        await cloudinary.uploader.upload(
          req.file.path,
          {
            folder:
              "creatorhub_products",
          }
        );

      image = result.secure_url;

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

    const product =
      await Product.create({
        ...req.body,
        image,
      });

    res.status(201).json(product);

  } catch (error) {

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
      message: error.message,
    });
  }
};

export const getProducts = async (
  req,
  res
) => {
  try {

    const products =
      await Product.find().sort({
        createdAt: -1,
      });

    res.json(products);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};