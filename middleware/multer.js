import multer from "multer";
import path from "path";
import fs from "fs";

// CREATE UPLOADS FOLDER IF NOT EXISTS
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: function (
    req,
    file,
    cb
  ) {
    cb(null, "uploads/");
  },

  filename: function (
    req,
    file,
    cb
  ) {
    cb(
      null,
      Date.now() +
        path.extname(
          file.originalname
        )
    );
  },
});

const fileFilter = (
  req,
  file,
  cb
) => {
  if (
    file.mimetype.startsWith(
      "image/"
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only images are allowed"
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
});

export default upload;