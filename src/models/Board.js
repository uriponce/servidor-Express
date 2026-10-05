import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título del tablero es obligatorio'],
      trim: true,
      maxlength: [100, 'El título no puede superar los 100 caracteres'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

// Campo virtual (no se guarda): las columnas cuyo "board" es este tablero
boardSchema.virtual('columns', {
  ref: 'Column',
  localField: '_id',
  foreignField: 'board',
});

// Cascada: al borrar UN tablero (documento), se borran sus columnas
// una por una, para que cada columna dispare su propio hook y borre sus tickets
boardSchema.pre('deleteOne', { document: true, query: false }, async function () {
  const columns = await mongoose.model('Column').find({ board: this._id });
  for (const column of columns) {
    await column.deleteOne();
  }
});

export default mongoose.model('Board', boardSchema);
