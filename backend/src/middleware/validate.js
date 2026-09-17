const { ZodError } = require('zod');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      let dataToValidate = req.body;

      // Account for multipart uploads where JSON is stringified
      if (req.body && typeof req.body.data === 'string') {
        try {
          dataToValidate = JSON.parse(req.body.data);
        } catch (e) {
          // ignore parse error, let Zod handle invalid format
        }
      } else if (req.body && typeof req.body.propertyData === 'string') {
        try {
          dataToValidate = JSON.parse(req.body.propertyData);
        } catch (e) {
          // ignore
        }
      }

      // Execute Zod parse, which strips unknown malicious keys (if schema uses strip by default)
      const parsedData = schema.parse(dataToValidate);

      // Reassign sanitized output
      if (req.body && typeof req.body.data === 'string') {
        req.body.data = JSON.stringify(parsedData); // Re-stringify for downstream controllers if they expect string
        // Also assign parsed to req.body.parsedData for convenience
        req.body.parsedData = parsedData;
      } else if (req.body && typeof req.body.propertyData === 'string') {
        req.body.propertyData = JSON.stringify(parsedData);
        req.body.parsedData = parsedData;
      } else {
        req.body = parsedData;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          errors: formattedErrors
        });
      }
      next(error);
    }
  };
};

module.exports = validate;
