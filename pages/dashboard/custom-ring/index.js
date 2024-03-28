import customIdNew from "custom-id-new";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import FileUpload from "~/components/FileUpload/fileUpload";
import LoadingButton from "~/components/Ui/Button";
import Card from "~/components/Ui/Card";
import PageLoader from "~/components/Ui/pageLoader";
import { postData } from "~/lib/clientFunctions";
import c from "~/styles/customRing.module.css";

export default function CustomRing() {
  const [data, setData] = useState({ category: [], customRing: {} });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setSelectedCategory(data.customRing?.targetCategory || "");
    setOptions(data.customRing?.options || []);
  }, [data]);
  const model = {
    title: "",
    options: [{ name: "", image: [], price: 0 }],
  };
  function addNew() {
    const option = [...options, model];
    setOptions(option);
  }
  function addNewItem(i) {
    let option = [...options];
    option[i].options = [
      ...option[i].options,
      { name: "", image: [], price: 0 },
    ];
    setOptions(option);
  }
  function deleteItem(i, parent) {
    let option = [...options];
    option[parent].options.splice(i, 1);
    setOptions(option);
  }
  function deleteRow(i) {
    let option = [...options];
    option.splice(i, 1);
    setOptions(option);
  }
  function setTitle(val, i) {
    let option = [...options];
    option[i].title = val.trim();
    setOptions(option);
  }
  function setName(val, index, rootIndex) {
    let option = [...options];
    option[rootIndex].options[index].name = val.trim();
    setOptions(option);
  }
  function setPrice(val, index, rootIndex) {
    let option = [...options];
    option[rootIndex].options[index].price = +val;
    setOptions(option);
  }
  function setFile(file, index, rootIndex) {
    let option = [...options];
    option[rootIndex].options[index].image = file;
    setOptions(option);
  }
  async function updateCustomRing() {
    try {
      if (selectedCategory.length === 0) {
        toast.warn("Please Select Category");
        return;
      }
      let __options = [...options].map((x, i) => ({
        ...x,
        options: x.options.map((y, z) => ({
          ...y,
          id: customIdNew({ randomLength: 3 }),
        })),
      }));
      const data = {
        targetCategory: selectedCategory,
        options: __options,
      };
      setLoading(true);
      const resp = await postData("/api/admin/custom-ring", data);
      resp.success
        ? toast.success("Information Updated Successfully")
        : toast.error("Something Went Wrong");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
    setLoading(false);
  }
  return (
    <PageLoader url="/api/admin/custom-ring" setData={setData}>
      <Card title="Custom Ring">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Select Target Category</label>
            <select
              className="form-select"
              onChange={(e) => setSelectedCategory(e.target.value)}
              value={selectedCategory}
            >
              {data.category.map((x, i) => (
                <option key={i} value={x._id}>
                  {x.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <hr />
        <div className="row">
          {options.map((x, i) => (
            <div key={i} className="col-12 position-relative">
              <button className={c.delete} onClick={() => deleteRow(i)}>
                x
              </button>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="title"
                  value={x.title}
                  className="form-control"
                  onChange={(e) => setTitle(e.target.value, i)}
                />
              </div>
              <button
                className="btn btn-sm btn-success mb-3"
                onClick={() => addNewItem(i)}
              >
                Add New Item
              </button>
              <div className="row">
                {x.options?.map((y, z) => (
                  <div className="col-lg-3 col-md-4 col-12" key={z}>
                    <div className="mb-3 border rounded p-2 position-relative">
                      <button
                        className={c.delete}
                        onClick={() => deleteItem(z, i)}
                      >
                        x
                      </button>
                      <div className="mb-4">
                        <input
                          type="text"
                          placeholder="name"
                          value={y.name}
                          className="form-control"
                          onChange={(e) => setName(e.target.value, z, i)}
                        />
                      </div>
                      <div className="mb-4">
                        <input
                          type="number"
                          placeholder="price"
                          value={y.price}
                          className="form-control"
                          onChange={(e) => setPrice(e.target.value, z, i)}
                        />
                      </div>
                      <div className="mb-3 pt-1">
                        <FileUpload
                          label={"Add Image (300px x 300px)"}
                          updateFilesCb={(e) => setFile(e, z, i)}
                          preSelectedFiles={y.image}
                          smallUi
                          maxFileSizeInBytes={2e6}
                          accept={".png,.jpg,.jpeg"}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <hr />
            </div>
          ))}
        </div>
        <button className="btn btn-success" onClick={addNew}>
          Add New Option
        </button>
        <hr />
        <LoadingButton
          text="Update"
          state={loading}
          clickEvent={updateCustomRing}
        />
      </Card>
    </PageLoader>
  );
}

CustomRing.dashboard = true;
CustomRing.requireAuthAdmin = true;
