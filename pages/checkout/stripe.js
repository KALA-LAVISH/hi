import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import CheckoutForm from "~/components/Checkout/stripe";
import Spinner from "~/components/Ui/Spinner";
import { postData } from "~/lib/clientFunctions";
import { getStorageData } from "~/utils/useLocalStorage";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_KEY);

export default function Stripe() {
  const [clientSecret, setClientSecret] = useState("");
  const [price, setPrice] = useState("0");
  const [loading, setLoading] = useState(true);
  const [customRing, setCustomRing] = useState({});
  const cartData = useSelector((state) => state.cart);
  const settings = useSelector((state) => state.settings);
  const exchangeRate = Number(settings.settingsData.currency.exchangeRate);
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
      async function getClientSecret() {
        try {
          const { clientSecret, price, error } = await postData(
            `/api/checkout/stripe`,
            {
              cartData,
              exchangeRate,
              customRing,
              type: router.query.type === "custom" ? "custom" : "regular",
            }
          );
          if (error) {
            toast.error(error);
          } else {
            setClientSecret(clientSecret);
            setPrice(price);
          }
        } catch (err) {
          console.log(err);
          toast.error(err.message);
        }
        setLoading(false);
      }
      getClientSecret();
    }
  }, [cartData, customRing, exchangeRate, router.query.type, settings]);

  const appearance = {
    theme: "stripe",
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <>
      <div className="layout_top">
        <div className="App text-center">
          {loading && (
            <div style={{ height: "70vh" }}>
              <Spinner />
            </div>
          )}
          {clientSecret && (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm
                price={price}
                currency={settings.settingsData.currency}
                customRing={customRing}
                type={router.query.type === "custom" ? "custom" : "regular"}
              />
            </Elements>
          )}
        </div>
      </div>
    </>
  );
}

Stripe.footer = false;
