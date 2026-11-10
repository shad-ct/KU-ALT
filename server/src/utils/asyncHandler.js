/**
 * Wraps asynchronous Express route handlers and catches errors,
 * passing them automatically to the next error middleware.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

