import React from "react";
import { useSelector } from "react-redux";
import { decimalBalance } from "~/lib/clientFunctions";
import ImageLoader from "../Image";
import classes from "./print.module.css";

const InvoicePrint = ({ data }) => {
  const settings = useSelector((state) => state.settings);
  const currencySymbol = settings.settingsData.currency.symbol;
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
        <h6>Order no# {data.orderId}</h6>
        <br />
      </div>
      <div className={classes.confirmation_body}>
        <h5>Delivery details</h5>
        <div className={classes.row}>
          <div>
            <h6>Delivery for</h6>
            <p>{data.billingInfo.fullName}</p>
            <p>Phone no : {data.billingInfo.phone}</p>
            <br />
            <h6>Address</h6>
            <p>{`${data.billingInfo.house} ${data.billingInfo.state} ${data.billingInfo.zipCode} ${data.billingInfo.country}`}</p>
          </div>
          <div>
            <h6>Delivery method</h6>
            <p>{data.deliveryInfo.type}</p>
            <br />
            <h6>Payment method</h6>
            <p>{data.paymentMethod}</p>
          </div>
        </div>
        <h5>Order summary</h5>
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
            <span>Sub Total</span>
            <span>
              {currencySymbol}
              {decimalBalance(data.totalPrice)}
            </span>
          </div>
          <div>
            <span>Discount</span>
            <span>
              {currencySymbol}
              {decimalBalance(
                data.totalPrice - (data.payAmount - data.deliveryInfo.cost)
              )}
            </span>
          </div>
          <div>
            <span>Delivery Charge</span>
            <span>
              {currencySymbol}
              {data.deliveryInfo.cost}
            </span>
          </div>
          <div>
            <span>Total</span>
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

export default InvoicePrint;
