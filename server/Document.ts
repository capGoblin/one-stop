import { Schema, model } from "mongoose";
// const  = mongoose;

const documentSchema = new Schema({
  _id: String,
  data: Object,
});

const Document = model("Document", documentSchema);

export default Document;
