const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título de la columna es obligatorio'],
      trim: true,
      maxlength: [100, 'El título no puede superar los 100 caracteres'],
    },
    // Referencia hijo -> padre: la columna guarda a qué tablero pertenece
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'La columna debe pertenecer a un tablero'],
      index: true,
    },
  },
  { timestamps: true }
);

// Cascada: al borrar UNA columna (documento), se borran sus tickets
columnSchema.pre('deleteOne', { document: true, query: false }, async function () {
  await mongoose.model('Ticket').deleteMany({ column: this._id });
});

module.exports = mongoose.model('Column', columnSchema);
