import customId from "custom-id-new";
import s3DeleteFiles from "~/lib/s3Delete";
import sessionChecker from "~/lib/sessionPermission";
import { convertToSlug } from "~/middleware/functions";
import categoryModel from "~/models/category";
import customRingModel from "~/models/customRing";
import dbConnect from "~/utils/dbConnect";

export default async function apiHandler(req, res) {
  const { method } = req;
  if (!(await sessionChecker(req, "general")))
    return res
      .status(403)
      .json({ success: false, message: "Access Forbidden" });

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const data = await categoryModel.find({});
        const cr = await customRingModel.findOne({});
        res.status(200).json({ success: true, category: data, customRing: cr });
      } catch (err) {
        console.log(err);
        res.status(400).json({ success: false });
      }
      break;

    case "POST":
      try {
        const data = req.body;
        let mdt = await customRingModel.findOne({});
        if (mdt === null) {
          mdt = new customRingModel({ options: [] });
        }
        mdt.targetCategory = data.targetCategory;
        mdt.options = data.options;
        await mdt.save();
        res.status(200).json({ success: true });
      } catch (err) {
        console.log(err);
        res.status(400).json({ success: false });
      }
      break;

    case "PUT":
      try {
        const { id } = req.body;
        const brand = await categoryModel.findById(id);
        brand.topBrand = !brand.topBrand;
        await brand.save();
        res.status(200).json({ success: true });
      } catch (err) {
        console.log(err);
        res.status(400).json({ success: false });
      }
      break;

    case "DELETE":
      try {
        const data = await categoryModel.findById(req.query.id);
        const icon = [{ Key: data.image[0]?.name }];
        await s3DeleteFiles(icon);
        await data.remove();
        res.status(200).json({ success: true });
      } catch (err) {
        console.log(err);
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}
