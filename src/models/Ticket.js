import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título del ticket es obligatorio'],
      trim: true,
      maxlength: [150, 'El título no puede superar los 150 caracteres'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    // Referencia hijo -> padre: el ticket guarda a qué columna pertenece
    column: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Column',
      required: [true, 'El ticket debe pertenecer a una columna'],
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Ticket', ticketSchema);
