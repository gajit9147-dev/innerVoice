import { validationResult } from "express-validator";
import { errorResponse } from "../utils/apiResponse.js";

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return errorResponse(
    res,
    "Validation failed.",
    400,
    errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }))
  );
};

export default validate;
