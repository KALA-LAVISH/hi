import { useEffect, useState } from "react";
import CustomFilter from "~/components/CreateWithLavish/filter";
import Spinner from "~/components/Ui/Spinner";
import { fetchData, setSettingsData } from "~/lib/clientFunctions";
import CreateWithLavishData from "~/lib/dataLoader/careteWithLavish";
import { wrapper } from "~/redux/store";
import { useTranslation } from "react-i18next";
import ProductList from "~/components/CreateWithLavish/productList";
import { toast } from "react-toastify";
import GlobalModal from "~/components/Ui/Modal/modal";
import { useRouter } from "next/router";
import ProductDetails from "~/components/CreateWithLavish/productDetails";
import CustomizeRing from "~/components/CreateWithLavish/customize";
import HeadData from "~/components/Head";

export default function CreateWithLavish({ data, error }) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [items, setItems] = useState(data.product || []);
  const [sortedItemList, setSortedItemList] = useState(data.product || []);
  const [productLength, setProductLength] = useState(data.count || 0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [stone, setStone] = useState({});

  const { t } = useTranslation();

  const getProduct = async (skip, loadMore) => {
    setLoading(true);
    const arg =
      selectedCategory.length > 0
        ? `subcategory=${selectedCategory}`
        : `category=${data.customRing.targetCategory.slug}`;
    await fetchData(`/api/home/create-with-lavish?skip=${skip || 0}&${arg}`)
      .then((data) => {
        if (loadMore) {
          setSortedItemList([...items, ...data.product]);
        } else {
          setSortedItemList(data.product);
        }
        setProductLength(data.count);
      })
      .catch((err) => {
        console.error(err);
        toast.error(`Something went wrong...(${err.message})`);
      });
    setLoading(false);
  };

  const moreProduct = async () => {
    await getProduct(items.length, true);
  };

  useEffect(() => {
    getProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  useEffect(() => {
    if (router.query.product) {
      setIsOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.product]);

  const handleCloseModal = () => {
    router.push("/create-with-lavish", undefined, { shallow: true });
    setIsOpen(false);
  };

  function addStone(p) {
    setStone(p);
    handleCloseModal();
  }

  return (
    <>
      <HeadData title="Design Rings - Customize Your Own Ring" />
      {!stone._id && (
        <div>
          <CustomFilter
            category={data.customRing.targetCategory}
            setCategory={setSelectedCategory}
          />
          <div className="custom_container my-5">
            {!loading && sortedItemList.length === 0 ? (
              <div className="m-5 p-5">
                <p className="text-center text-primary fw-bold">
                  {t("no_product_found")}
                </p>
              </div>
            ) : !loading ? (
              <ProductList
                items={sortedItemList}
                data_length={productLength}
                loadMore={moreProduct}
                border
                link
              />
            ) : (
              <div style={{ height: "80vh" }}>
                <Spinner />
              </div>
            )}
          </div>
        </div>
      )}
      {stone._id && (
        <CustomizeRing customData={data.customRing} stone={stone} />
      )}
      <GlobalModal isOpen={isOpen} handleCloseModal={handleCloseModal}>
        {router.query.product && (
          <ProductDetails
            productSlug={router.query.product}
            addToRing
            addStone={addStone}
          />
        )}
      </GlobalModal>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ res, query }) => {
      if (res) {
        res.setHeader(
          "Cache-Control",
          "public, s-maxage=10800, stale-while-revalidate=59"
        );
      }
      const _data = await CreateWithLavishData();
      const data = JSON.parse(JSON.stringify(_data));
      if (data.success) {
        setSettingsData(store, data);
      }
      return {
        props: {
          data,
          error: !data.success,
        },
      };
    }
);

CreateWithLavish.footer = false;
