/**
 * Middleware to authenticate server-to-server requests (e.g. from Make.com HTTP modules)
 * using an API key provided in x-api-key, x-make-apikey, or Authorization: Bearer <key>.
 */
const apiKeyAuth = (req, res, next) => {
  const configuredKey =
    process.env.CIVICFIX_BACKEND_API_KEY ||
    process.env.CIVICFIX_API_KEY ||
    process.env.MAKE_WEBHOOK_API_KEY;

  if (!configuredKey) {
    return res.status(500).json({
      success: false,
      message: 'CIVICFIX_BACKEND_API_KEY is not configured on the server',
    });
  }

  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  const providedKey =
    req.headers['x-api-key'] ||
    req.headers['x-make-apikey'] ||
    bearerToken ||
    req.query.apiKey;

  if (!providedKey || providedKey !== configuredKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or missing CivicFix API key',
    });
  }

  next();
};

module.exports = apiKeyAuth;
