import InnerImageZoom from "react-inner-image-zoom";
import { Carousel } from "react-responsive-carousel";
import ImageLoader from "../Image";
import Accordion from "../Ui/Accordion";
import c from "./customize.module.css";
import { useEffect, useState } from "react";
import { forEach } from "lodash";
import { useSelector } from "react-redux";
import { BrightnessLow, Gem } from "@styled-icons/bootstrap";
import { setStorageData } from "~/utils/useLocalStorage";
import { useRouter } from "next/router";

export default function CustomizeRing({ customData, stone }) {
  const [combination, setCombination] = useState([]);
  const { settingsData } = useSelector((state) => state.settings);
  useEffect(() => {
    const combination = [];
    customData.options.forEach((x) => {
      if (x.options[0]) {
        combination.push(x.options[0]);
      }
    });
    setCombination(combination);
  }, [customData]);
  const router = useRouter();

  const thumbs = () => {
    const thumbList = stone.gallery.map((item, index) => (
      <ImageLoader
        key={item.name + index}
        src={item.url}
        alt={stone.name}
        width={67}
        height={67}
        style={{ width: "100%", height: "auto" }}
      />
    ));
    return thumbList;
  };

  const getCustomPrice = combination.reduce((p, c) => p + c?.price, 0);

  function handleSelect(data, idx) {
    let _selections = [...combination];
    _selections[idx] = data;
    setCombination(_selections);
  }

  async function processOrder() {
    const data = [...combination].map((x, i) => ({
      ...x,
      title: customData.options[i].title,
    }));
    await setStorageData("customRing", {
      stone: stone._id,
      name: stone.name,
      image: stone.image,
      price: stone.price,
      combination: data,
      totalPrice: stone.price + getCustomPrice,
    });
    router.push("/checkout?type=custom");
  }

  return (
    <div className="custom_container py-5">
      <div className="col-12">
        <div className="row">
          <div className="col-md-5">
            <Carousel
              showArrows={false}
              showThumbs={true}
              showIndicators={false}
              renderThumbs={thumbs}
              showStatus={false}
              emulateTouch={true}
              preventMovementUntilSwipeScrollTolerance={true}
              swipeScrollTolerance={50}
            >
              {stone.gallery.map((item, index) => (
                <InnerImageZoom
                  key={item.name + index}
                  src={item.url}
                  //   className={classes.magnifier_container}
                  fullscreenOnMobile={true}
                />
              ))}
            </Carousel>
          </div>
          <div className="col-md-7">
            <h5 className="my-4">Custom ring with {stone.name}</h5>
            <div className={c.price}>
              <div>
                <span>
                  <Gem width={20} height={20} />
                  &nbsp; Gemstone:
                </span>
                <span>
                  {settingsData.currency.symbol}
                  {stone.price}
                </span>
              </div>
              <div>
                <span>
                  <BrightnessLow width={24} height={24} />
                  &nbsp;Custom Design:
                </span>
                <span>
                  {settingsData.currency.symbol}
                  {getCustomPrice}
                </span>
              </div>
              <div>
                <span>Total Price:</span>
                <span>
                  {settingsData.currency.symbol}
                  {getCustomPrice + stone.price}
                </span>
              </div>
            </div>
            {customData.options.map((x, i) => (
              <Accordion key={i} title={x.title} state={true}>
                <div className={c.row}>
                  {x.options.map((y, z) => (
                    <div
                      key={z}
                      className={c.card}
                      onClick={() => handleSelect(y, i)}
                      aria-selected={combination[i]?.id === y.id}
                    >
                      <div>
                        <ImageLoader
                          src={y.image[0]?.url}
                          width={60}
                          height={60}
                        />
                      </div>
                      {y.name}
                    </div>
                  ))}
                </div>
              </Accordion>
            ))}
            <div className="my-5">
              <button className="btn btn-success w-100" onClick={processOrder}>
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
