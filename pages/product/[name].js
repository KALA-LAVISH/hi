import { CardText, ChatLeftDots, StarHalf } from "@styled-icons/bootstrap";
import customId from "custom-id-new";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/InnerImageZoom/styles.min.css";
import { useDispatch, useSelector } from "react-redux";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { toast } from "react-toastify";
import Error404 from "~/components/error/404";
import Error500 from "~/components/error/500";
import HeadData from "~/components/Head";
import ImageLoader from "~/components/Image";
import Question from "~/components/question";
import Review from "~/components/Review";
import Product from "~/components/Shop/Product/product";
import classes from "~/components/Shop/Product/productDetails.module.css";
import { postData, setSettingsData } from "~/lib/clientFunctions";
import productDetailsData from "~/lib/dataLoader/productDetails";
import { addToCart, addVariableProductToCart } from "~/redux/cart.slice";
import { wrapper } from "~/redux/store";
import VarientView from "~/components/Shop/Product/varientView";
import { isEqual } from "lodash";

const Carousel = dynamic(() =>
  import("react-responsive-carousel").then((com) => com.Carousel)
);

function ProductDetailsPage({ data, error }) {
  const { session } = useSelector((state) => state.localSession);
  const [price, setPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [tabId, setTabId] = useState(1);
  const [variant, setVariant] = useState({});
  const [stockAv, setStockAv] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const dispatch = useDispatch();
  const quantityAmount = useRef();
  const question = useRef();
  const cartData = useSelector((state) => state.cart);
  const settings = useSelector((state) => state.settings);
  const router = useRouter();
  const relatedItem =
    data.related &&
    data.related.filter((obj) => {
      return obj._id !== data.product._id;
    });
  const { t } = useTranslation();

  const stepUpQty = () => {
    quantityAmount.current.stepUp();
  };

  const stepDownQty = () => {
    quantityAmount.current.stepDown();
  };

  const simpleProductCart = (qty) => {
    const { _id, name, image, quantity } = data.product;
    const existed = cartData.items.find((item) => item._id === _id);
    const totalQty = existed ? existed.qty + qty : qty;
    if (quantity === -1 || quantity >= totalQty) {
      const cartItem = {
        _id,
        uid: customId({ randomLength: 6 }),
        name,
        image,
        price: Number(price),
        qty,
        maxQty: quantity,
        variant: null,
      };
      dispatch(addToCart(cartItem));
      toast.success("Added to Cart");
    } else {
      toast.error("This item is out of stock!");
    }
  };

  const checkQty = (prevQty, currentQty, availableQty) => {
    const avQty = Number(availableQty);
    if (avQty === -1) {
      return true;
    } else {
      return prevQty + currentQty <= avQty;
    }
  };

  function checkVariantInfo(v) {
    let minQty = [];
    let rootVar = data.product.variants.find((x) => x.id === v.id);
    if (rootVar) {
      Object.keys(v).forEach((k) => {
        if (Array.isArray(rootVar[k])) {
          const res = rootVar[k].find((x) => x.name === v[k]);
          if (res) {
            minQty.push(res.qty);
          }
        }
      });
    }
    return Math.min(...minQty);
  }

  const variableProductCart = (qty) => {
    try {
      const { _id, name, image } = data.product;
      const existedProduct = cartData.items.find(
        (item) => item._id === _id && isEqual(item.variant, variant)
      );
      const existedQty = existedProduct ? existedProduct.qty : 0;
      const variantMinQty = checkVariantInfo(variant);
      const qtyAvailable =
        variantMinQty && checkQty(existedQty, qty, variantMinQty);
      if (qtyAvailable) {
        const cartItem = {
          _id,
          uid: customId({ randomLength: 6 }),
          name,
          image,
          price: Number(price),
          qty,
          maxQty: +variantMinQty,
          variant,
        };
        dispatch(addVariableProductToCart(cartItem));
        toast.success("Added to Cart");
      } else {
        toast.error("This item is out of stock!");
      }
    } catch (err) {
      console.log(err);
      toast.error("Something Went Wrong");
    }
  };

  const addItemToCart = () => {
    const qty = Number(quantityAmount.current.value);
    if (data.product.type === "simple") {
      simpleProductCart(qty);
    } else {
      variableProductCart(qty);
    }
  };

  const thumbs = () => {
    const thumbList = data.product.gallery.map((item, index) => (
      <ImageLoader
        key={item.name + index}
        src={item.url}
        alt={data.product.name}
        width={67}
        height={67}
        style={{ width: "100%", height: "auto" }}
      />
    ));
    return thumbList;
  };

  const _showTab = (i) => {
    setTabId(i);
  };

  const refreshData = () => router.replace(router.asPath);

  async function postQuestion(e) {
    try {
      e.preventDefault();
      const _data = {
        pid: data.product._id,
        question: question.current.value.trim(),
      };
      const _r = await postData("/api/question", _data);
      _r.success
        ? (toast.success("Question Added Successfully"), refreshData())
        : toast.error("Something Went Wrong 500");
    } catch (err) {
      console.log(err);
      toast.error(`Something Went Wrong - ${err.message}`);
    }
  }

  useEffect(() => {
    if (data.product && data.product.type === "simple") {
      setDiscountPrice(data.product.price);
      setPrice(
        data.product.price - (data.product.discount / 100) * data.product.price
      );
    }
  }, [data]);

  if (error) return <Error500 />;
  if (!data.product) return <Error404 />;

  return (
    <>
      <HeadData
        title={data.product.name}
        seo={data.product.seo}
        url={`product/${data.product.slug}`}
      />
      <div className="py-1">
        <div className="custom_container">
          <div className="mt-5 px-2 py-3">
            <div className={classes.container}>
              <div className="row m-0">
                <div className="col-lg-6 p-0">
                  <div className={classes.slider}>
                    <div className={classes.image_container_main}>
                      <Carousel
                        showArrows={false}
                        showThumbs={true}
                        showIndicators={false}
                        renderThumbs={thumbs}
                        preventMovementUntilSwipeScrollTolerance={true}
                        swipeScrollTolerance={50}
                        emulateTouch={true}
                        selectedItem={selectedImage}
                      >
                        {data.product.gallery.map((item, index) => (
                          <InnerImageZoom
                            key={item.name + index}
                            src={item.url}
                            className={classes.magnifier_container}
                            fullscreenOnMobile={true}
                          />
                        ))}
                      </Carousel>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 p-0">
                  <div className={classes.details}>
                    <p className={classes.unit}>
                      {data.product.unitValue} {data.product.unit}
                    </p>
                    <h1 className={classes.heading}>{data.product.name}</h1>
                    <hr />
                    <div>
                      {discountPrice > price && (
                        <p className={classes.price_ori}>
                          {settings.settingsData.currency.symbol}
                          {discountPrice.toFixed(2)}
                        </p>
                      )}
                      <p className={classes.price}>
                        {settings.settingsData.currency.symbol}
                        {price.toFixed(2)}
                      </p>
                    </div>
                    <p className={classes.description}>
                      {data.product.shortDescription}
                    </p>
                    {data.product.type === "variable" && (
                      <div>
                        {data.product.variants.length > 0 && (
                          <VarientView
                            varients={data.product.variants}
                            basePrice={data.product.price}
                            updateRootVarient={setVariant}
                            updatePrice={setPrice}
                            updateStockInfo={setStockAv}
                            imageIndex={setSelectedImage}
                            updateDiscountPrice={setDiscountPrice}
                          />
                        )}
                      </div>
                    )}
                    <div className={classes.category}>
                      <p className={classes.section_heading}>
                        {t("categories")}
                      </p>
                      {data.product.categories.map((category, index) => (
                        <span key={index} className={classes.category_list}>
                          {category.replace(/-/g, " ")}
                        </span>
                      ))}
                    </div>
                    <div className={classes.cart_section}>
                      <p className={classes.section_heading}>QTY</p>
                      <div className={classes.number_input}>
                        <button
                          onClick={stepDownQty}
                          className={classes.minus}
                        ></button>
                        <input
                          className={classes.quantity}
                          ref={quantityAmount}
                          min="1"
                          max={
                            data.product.quantity === -1
                              ? 100000
                              : data.product.quantity
                          }
                          defaultValue="1"
                          type="number"
                          disabled
                        />
                        <button
                          onClick={stepUpQty}
                          className={classes.plus}
                        ></button>
                      </div>
                      <div className={classes.button_container}>
                        {stockAv ? (
                          <button
                            className={classes.cart_button}
                            onClick={() => addItemToCart()}
                          >
                            {t("add_to_cart")}
                          </button>
                        ) : (
                          <button className={classes.cart_button} disabled>
                            {t("out_of_stock")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={classes.tab_button}>
              <button
                onClick={() => _showTab(1)}
                className={tabId === 1 ? classes.active : classes.not}
              >
                {t("description")}
              </button>
              <button
                onClick={() => _showTab(2)}
                className={tabId === 2 ? classes.active : classes.not}
              >
                {t("review")} ({data.product.review.length})
              </button>
              <button
                onClick={() => _showTab(3)}
                className={tabId === 3 ? classes.active : classes.not}
              >
                {t("questions")} ({data.product.question.length})
              </button>
            </div>
            <div className={classes.details_card}>
              {tabId === 1 && (
                <>
                  {data.product.description &&
                  data.product.description.length > 0 ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: data.product.description,
                      }}
                    />
                  ) : (
                    <EmptyContent
                      icon={<CardText width={40} height={40} />}
                      text="This product has no description"
                    />
                  )}
                </>
              )}
              {tabId === 2 && (
                <>
                  {data.product.review && data.product.review.length > 0 ? (
                    <Review review={data.product.review} />
                  ) : (
                    <EmptyContent
                      icon={<StarHalf width={40} height={40} />}
                      text="This product has no reviews yet"
                    />
                  )}
                </>
              )}
              {tabId === 3 && (
                <>
                  {session && (
                    <form
                      className="border border-2 rounded p-3 mb-3"
                      onSubmit={postQuestion}
                    >
                      <div className="mb-3">
                        <label className="form-label">Ask a question</label>
                        <textarea
                          className="form-control"
                          maxLength={300}
                          placeholder="Maximum 300 words"
                          ref={question}
                          required
                        ></textarea>
                      </div>
                      <button type="submit" className={classes.c_btn}>
                        ASK QUESTION
                      </button>
                    </form>
                  )}
                  {data.product.question && data.product.question.length > 0 ? (
                    <Question
                      qtn={data.product.question}
                      user={session}
                      pid={data.product._id}
                      refresh={refreshData}
                    />
                  ) : (
                    <EmptyContent
                      icon={<ChatLeftDots width={40} height={40} />}
                      text="There are no questions asked yet. Please login or register to ask question"
                    />
                  )}
                </>
              )}
            </div>
            {relatedItem.length > 0 && (
              <div className={classes.related}>
                <p className={classes.related_header}>{t("Related Items")}</p>
                <ul className={classes.related_list}>
                  {relatedItem.map((product, index) => (
                    <Product key={index} product={product} hideLink border />
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function EmptyContent({ icon, text }) {
  return (
    <div className={classes.empty_content}>
      <div className={classes.empty_icon}>{icon}</div>
      <div className={classes.empty_text}>{text}</div>
    </div>
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
      const _data = await productDetailsData(query.name);
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

export default ProductDetailsPage;
