/**
 * Handles the response structure for API errors.
 *
 * @param {string} code - The status code.
 * @param {string} message - The error message.
 * @param {Object|null} data - Additional data to include in the error response.
 * @param {Object|null} res - Express response object (optional).
 * @returns {Object} - The error response object.
 */
const errorResponseHandler = (code, message, data = null, res = null) => {
  // Ensure code is a string
  let stringCode = code.toString();

  let status = stringCode.startsWith("2") ? "success" : "error";
  let error = !stringCode.startsWith("2");

  if (stringCode.startsWith("5")) {
    message = `Oops! Something went wrong. ${message}. This has been sent to our team.`;
  }

  let response = {
    code,
    success: !error,
    error,
    message,
  };

  if (data) {
    response["data"] = data;
  }

  if (res) {
    return res.status(code).json(response);
  } else {
    return response;
  }
};

module.exports = errorResponseHandler;
