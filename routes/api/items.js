const express = require("express");
const verifyToken = require("../../modules/verifytoken");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Item Model
const Item = require("../../models/Item");

const storage = multer.diskStorage({
  destination: "./public/upload/images",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

const upload = multer({ storage: storage }).single("image");

// @route GET /api/items
// @desc  Get All Items
// @access Public
router.get("/", verifyToken.verify, (req, res) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.json({ message: "Forbidden", status: "403" });
    } else {
      Item.find()
        .sort({ date: -1 })
        .then(items =>
          res.json({
            message: "Get All Items Success",
            items,
            status: "success"
          })
        );
    }
  });
});

// @route POST /api/items
// @desc  Post an item
// @access Public
router.post("/", verifyToken.verify, (req, res) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.json({ message: "Forbidden", status: "403" });
    } else {
      upload(req, res, err => {
        let data = Object.assign(req.body, { imgURL: req.file.path });
        if (err) {
          res.json({ message: err, status: "failed" });
        } else {
          Item.insertMany(data)
            .then(items =>
              res.json({
                message: "Post item success",
                items,
                status: "success"
              })
            )
            .catch(err => res.json({ message: err, status: "failed" }));
        }
      });
    }
  });
});

// @route UPDATE /api/items/:id
// @desc  UPDATE an item
// @access Public
router.put("/:id", verifyToken.verify, (req, res) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.json({ message: "Forbidden", status: "403" });
    } else {
      upload(req, res, err => {
        if (err) {
          res.json({ message: err, status: "failed" });
        } else {
          let data = Object.assign(req.body, { imgURL: req.file.path });
          Item.findById(req.params.id).then(items => {
            fs.unlink(items.imgURL, err => {
              if (err) {
                res.json({ message: err });
              } else {
                Item.findOneAndUpdate({ _id: req.params.id }, data, err => {
                  if (err) {
                    res.json({ message: err });
                  } else {
                    res.json({
                      message: "Item Updated",
                      status: "success"
                    });
                  }
                });
              }
            });
          });
        }
      });
    }
  });
});

// @route DELETE /api/items/:id
// @desc  DELETE an item
// @access Public
router.delete("/:id", verifyToken.verify, (req, res) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.json({ message: "Forbidden", status: "403" });
    } else {
      Item.findById(req.params.id).then(items => {
        fs.unlink(items.imgURL, err => {
          if (err) {
            res.json({ message: err });
          } else {
            items
              .remove()
              .then(() => res.json({ success: true }))
              .catch(err => res.status(404).json({ success: false }));
          }
        });
      });
    }
  });
});
module.exports = router;
