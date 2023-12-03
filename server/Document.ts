import { Schema, model } from "mongoose";
// const  = mongoose;

const documentSchema = new Schema({
  _id: String,
  doc: Object,
  draw: Object,
  code: String,
});

const Document = model("Document", documentSchema);

export default Document;
