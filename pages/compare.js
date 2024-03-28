import { Trash3 } from "@styled-icons/bootstrap";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import HeadData from "~/components/Head";
import ImageLoader from "~/components/Image";
import { postData, stockInfo } from "~/lib/clientFunctions";
import { updateComparelist } from "~/redux/cart.slice";
import c from "../styles/compare.module.css";
import { useTranslation } from "react-i18next";

const GlobalModal = dynamic(() => import("~/components/Ui/Modal/modal"));
const ProductDetails = dynamic(() =>
  import("~/components/Shop/Product/productDetails")
);

const Compare = () => {
  const [data, setData] = useState([]);
  const [prices, setPrices] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { compare } = useSelector((state) => state.cart);
  const { settingsData } = useSelector((state) => state.settings);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  async function getData() {
    const url = `/api/home/compare`;
    const resp = await postData(url, { idList: compare });
    resp.success ? setData(resp.data) : null;
  }

  useEffect(() => {
    if (compare.length > 0) {
      getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compare]);

  //popup product viewer track
  useEffect(() => {
    if (router.query.slug) {
      setIsOpen(true);
    }
  }, [router.query.slug]);

  //modal close handler
  const handleCloseModal = () => {
    router.push("/compare", undefined, { shallow: true });
    setIsOpen(false);
  };

  function removeItem(id) {
    const filtered = compare.filter((x) => x !== id);
    dispatch(updateComparelist(filtered));
    toast.success("Item has been removed from compare list");
  }

  function checkPrice(product) {
    try {
      let rootVar = product.variants[0];
      let price = +product.price;
      let discount = 0;
      Object.keys(rootVar).every((k) => {
        if (Array.isArray(rootVar[k])) {
          const res = rootVar[k][0] || null;
          if (res) {
            price = price + +res.price;
            discount = price - (res.discount / 100) * price;
          }
        }
        return true;
      });
      return { price, discount };
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    const r = [];
    data.forEach((item, idx) => {
      if (item.type === "simple") {
        r.push({
          price: item.price,
          discount: item.price - (item.discount / 100) * item.price,
        });
      } else {
        r.push(checkPrice(item));
      }
    });
    setPrices(r);
  }, [data]);

  return (
    <>
      <HeadData title="Compare" />
      <div className={c.layout_top}>
        <h1 className={c.heading}>{t("compare")}</h1>
        {compare && compare.length > 0 ? (
          <div className={c.root}>
            <div className={c.header}>
              <ul>
                <li className={c.image}>{t("photo")}</li>
                <li>{t("name")}</li>
                <li>{t("price")}</li>
                <li>{t("availability")}</li>
                <li>{t("color")}</li>
                <li className={c.desc}>{t("description")}</li>
                <li>{t("action")}</li>
              </ul>
            </div>
            <div className={c.table}>
              <div className={c.content}>
                {data.map((item, idx) => (
                  <ul key={idx}>
                    <li className={c.image}>
                      <ImageLoader
                        src={item.image[0]?.url}
                        width={125}
                        height={125}
                      />
                    </li>
                    <li>{item.name}</li>
                    <li>
                      <span className={c.price}>
                        {prices[idx]?.discount < prices[idx]?.price && (
                          <del>
                            {prices[idx]?.price + settingsData.currency.symbol}
                          </del>
                        )}
                        <b>
                          {prices[idx]?.discount + settingsData.currency.symbol}
                        </b>
                      </span>
                    </li>
                    <li>
                      {stockInfo(item) ? (
                        <span className="text-success fw-bold">In stock</span>
                      ) : (
                        <span className="text-danger fw-bold">
                          Out of stock
                        </span>
                      )}
                    </li>
                    <li>
                      {item.colors &&
                        item.colors.map((x, i) => (
                          <span
                            key={i}
                            style={{ backgroundColor: x.value }}
                            title={x.label}
                            className={c.color}
                          ></span>
                        ))}
                    </li>
                    <li className={c.desc}>{item.shortDescription}</li>
                    <li>
                      {stockInfo(item) && (
                        <Link
                          href={`/compare?slug=${item.slug}`}
                          as={`/product/${item.slug}`}
                          scroll={false}
                          shallow={true}
                          className={c.button}
                        >
                          {t("add_to_cart")}
                        </Link>
                      )}
                      <button
                        className={c.button}
                        onClick={() => removeItem(item._id)}
                      >
                        <Trash3 width={20} height={20} />
                      </button>
                    </li>
                  </ul>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center py-5 mt-3 mb-_5 fw-bold">
            {t("no_products_in_compare_list")}
          </p>
        )}
      </div>
      <GlobalModal
        small={false}
        isOpen={isOpen}
        handleCloseModal={handleCloseModal}
      >
        {router.query.slug && (
          <ProductDetails productSlug={router.query.slug} />
        )}
      </GlobalModal>
    </>
  );
};

export default Compare;
