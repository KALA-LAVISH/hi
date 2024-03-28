import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetCart } from "~/redux/cart.slice";
import classes from "~/styles/payment.module.css";
import { getStorageData } from "~/utils/useLocalStorage";

const SslCheckout = () => {
  const cartData = useSelector((state) => state.cart);
  const settings = useSelector((state) => state.settings);
  const dispatch = useDispatch();
  const exchangeRate = settings.settingsData.currency.exchangeRate;
  const [orderData, setOrderData] = useState({});
  const [customRing, setCustomRing] = useState({});
  const sslForm = useRef();
  const router = useRouter();

  async function getCustomRingData() {
    const data = await getStorageData("customRing");
    setCustomRing(data);
  }

  useEffect(() => {
    if (router.query.type === "custom") {
      getCustomRingData();
    }
  }, [router]);

  useEffect(() => {
    if (
      (cartData.items.length > 0 && exchangeRate > 0) ||
      (router.query.type === "custom" && exchangeRate > 0 && customRing.stone)
    ) {
      const data = {
        cartData,
        exchangeRate,
        customRing,
        type: router.query.type === "custom" ? "custom" : "regular",
      };
      setOrderData(data);
    }
  }, [cartData, customRing, customRing.stone, exchangeRate, router.query.type]);

  const submitForm = (e) => {
    e.preventDefault();
    dispatch(resetCart());
    sslForm.current.submit();
  };

  return (
    <div className="layout_top">
      <div className={classes.container}>
        <h2 className={classes.h2}>Pay Now</h2>
        <form
          action={`/api/checkout/sslcommerz`}
          method="POST"
          ref={sslForm}
          onSubmit={submitForm}
        >
          <input type="hidden" name="order" value={JSON.stringify(orderData)} />
          <button className="ssl_button" type="submit">
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
};

SslCheckout.footer = false;

export default SslCheckout;
