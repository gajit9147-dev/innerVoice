import { body } from "express-validator";

export const createNoteValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ max: 255 })
    .withMessage("Title cannot exceed 255 characters."),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required."),

  body("category")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Category is too long."),

  body("feeling")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Feeling is too long."),
];
