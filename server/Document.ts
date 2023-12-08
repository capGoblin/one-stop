import { Schema, model } from "mongoose";
// const  = mongoose;

const documentSchema = new Schema({
  _id: String,
  doc: Object,
  draw: Object,
  code: String,
  users: Object,
});

const Document = model("Document", documentSchema);

export default Document;
