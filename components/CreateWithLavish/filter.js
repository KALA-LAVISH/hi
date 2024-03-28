import { CaretLeft, CaretRight, XCircle } from "@styled-icons/bootstrap";
import { useState } from "react";
import { A11y, Autoplay, Navigation } from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import c from "./filter.module.css";

const breakpointNewArrival = {
  320: {
    slidesPerView: 2,
  },
  480: {
    slidesPerView: 3,
  },
  600: {
    slidesPerView: 4,
  },
  991: {
    slidesPerView: 5,
  },
  1200: {
    slidesPerView: 7,
  },
};

export default function CustomFilter({ category, setCategory }) {
  const [prevEl, setPrevEl] = useState(null);
  const [nextEl, setNextEl] = useState(null);
  const [idx, setIdx] = useState(-1);
  function selectCategory(e, i) {
    setCategory(e);
    setIdx(i);
  }
  return (
    <div className="custom_container position-relative">
      <h2 className="content_heading"></h2>
      <div className="navigation-wrapper">
        <Swiper
          modules={[Navigation, A11y, Autoplay]}
          navigation={{ prevEl, nextEl }}
          spaceBetween={0}
          slidesPerView="auto"
          breakpoints={breakpointNewArrival}
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
            waitForTransition: true,
          }}
          loop={false}
          centeredSlides={false}
          centerInsufficientSlides={true}
          speed={900}
        >
          {category?.subCategories.map((cat, i) => (
            <SwiperSlide key={i}>
              <div
                className={c.filter_btn}
                aria-selected={idx === i}
                onClick={() => selectCategory(cat.slug, i)}
              >
                {cat.name}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div
          className="swiper-button-prev arrow arrow--left"
          ref={(node) => setPrevEl(node)}
        >
          <CaretLeft width={17} height={17} />
        </div>
        <div
          className="swiper-button-next arrow arrow--right"
          ref={(node) => setNextEl(node)}
        >
          <CaretRight width={17} height={17} />
        </div>
      </div>
      <button className={c.clear} onClick={() => selectCategory("", -1)}>
        Clear Filter <XCircle width={20} height={20} />
      </button>
    </div>
  );
}
