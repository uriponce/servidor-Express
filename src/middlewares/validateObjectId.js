const HttpError = require('../utils/HttpError');

// Un ObjectId de MongoDB son exactamente 24 caracteres hexadecimales
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

const isObjectId = (value) =>
  typeof value === 'string' && OBJECT_ID_REGEX.test(value);

// Uso: validateObjectId('boardId', 'columnId')
function validateObjectId(...paramNames) {
  return (req, res, next) => {
    for (const name of paramNames) {
      if (!isObjectId(req.params[name])) {
        return next(new HttpError(400, `El parámetro ${name} no es un ObjectId válido`));
      }
    }
    next();
  };
}

module.exports = { validateObjectId, isObjectId };
