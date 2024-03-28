import { model, models, Schema } from "mongoose";
import { customRing } from "~/utils/modelData.mjs";

const customRingSchema = new Schema(customRing);

export default models.customRing || model("customRing", customRingSchema);
