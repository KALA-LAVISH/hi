import React from "react";
import { useSelector } from "react-redux";
import classes from "~/components/Checkout/checkout.module.css";
import { decimalBalance } from "~/lib/clientFunctions";
import ImageLoader from "../Image";
import { useTranslation } from "react-i18next";

const Invoice = ({ data }) => {
  const settings = useSelector((state) => state.settings);
  const currencySymbol = settings.settingsData.currency.symbol;
  const { t } = useTranslation();
  return (
    <div className={classes.confirmation}>
      <div className={classes.confirmation_heading}>
        {settings.settingsData.logo[0] && (
          <ImageLoader
            src={settings.settingsData.logo[0]?.url}
            width={166}
            height={60}
            alt={settings.settingsData.name}
            quality={100}
          />
        )}
        <h2>{t("we_have_received_your_order")}</h2>
        <h6>
          {t("order_no")}# {data.orderId}
        </h6>
        {/* <p>A copy of your receipt has been send to {data.billingInfo.email}</p> */}
        <br />
      </div>
      <div className={classes.confirmation_body}>
        <h5>{t("delivery_details")}</h5>
        <div className="row">
          <div className="col-md-6">
            <h6>{t("delivery_for")}</h6>
            <p>{data.billingInfo.fullName}</p>
            <p>
              {t("phone")} : {data.billingInfo.phone}
            </p>
            <br />
            <h6>{t("address")}</h6>
            <p>{`${data.billingInfo.house} ${data.billingInfo.state} ${data.billingInfo.zipCode} ${data.billingInfo.country}`}</p>
          </div>
          <div className="col-md-6">
            <h6>{t("delivery_type")}</h6>
            <p>{data.deliveryInfo.type}</p>
            <br />
            <h6>{t("payment_method")}</h6>
            <p>{data.paymentMethod}</p>
          </div>
        </div>
        <h5>{t("order_summary")}</h5>
        <div className={classes.cart_item_list}>
          {data.type === "custom" ? (
            <>
              <div className={classes.cart_item}>
                <div className={classes.cart_container}>
                  <span className={classes.cart_disc}>
                    <b>Custom ring with {data.products[0]?.name}</b>
                    {data.products[0]?.combination &&
                      data.products[0].combination.map(
                        (x, idx) =>
                          x !== "id" && (
                            <span key={idx}>{`${x.title}: ${x.name}`}</span>
                          )
                      )}
                    <span>Qty: 1</span>
                    <span>
                      Price: {currencySymbol}
                      {data.products[0].totalPrice}
                    </span>
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              {data.products.map((item, index) => (
                <div className={classes.cart_item} key={index}>
                  <div className={classes.cart_container}>
                    <span className={classes.cart_disc}>
                      <b>{item.name}</b>
                      {item.variant &&
                        Object.keys(item.variant).map(
                          (x, idx) =>
                            x !== "id" && (
                              <span
                                key={idx}
                              >{`${x}: ${item.variant[x]}`}</span>
                            )
                        )}
                      <span>Qty: {item.qty}</span>
                      <span>
                        Price: {currencySymbol}
                        {item.price}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        <div className={classes.confirmation_pay}>
          <div>
            <span>{t("sub_total")}</span>
            <span>
              {currencySymbol}
              {decimalBalance(data.totalPrice)}
            </span>
          </div>
          <div>
            <span>{t("discount")}</span>
            <span>
              {currencySymbol}
              {decimalBalance(
                data.totalPrice - (data.payAmount - data.deliveryInfo.cost)
              )}
            </span>
          </div>
          <div>
            <span>{t("delivery_charge")}</span>
            <span>
              {currencySymbol}
              {data.deliveryInfo.cost}
            </span>
          </div>
          <div>
            <span>{t("total")}</span>
            <span>
              {currencySymbol}
              {decimalBalance(data.payAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
