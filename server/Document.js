"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// const  = mongoose;
const documentSchema = new mongoose_1.Schema({
    _id: String,
    doc: Object,
    draw: Object,
    code: String,
    users: Object,
});
const Document = (0, mongoose_1.model)("Document", documentSchema);
exports.default = Document;
