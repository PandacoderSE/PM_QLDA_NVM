import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination } from "swiper";

const photos = [
  "https://cdn.tgdd.vn/Products/Images/44/325242/dell-inspiron-15-3520-i5-n5i5052w1-thumb-600x600.jpg",
  "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:quality(100)/2022_5_23_637888928980636971_cac-hang-pc-gaming-noi-tieng-1.png",
  "https://mihanoi.vn/wp-content/uploads/2023/12/3.png",
  "https://minhancomputercdn.com/media/product/11418_huntkey_rrb2713e_a_9.jpg",
  "https://www.sieuthivienthong.com/imgs/art/p_30150_OPTOMA-SA500.jpg",
];

export default function CoverFlow() {
  return (
    <section className="flex flex-grow p-4">
      <div className="lg:mx-auto max-w-5xl mx-[1.5rem]">
        <Swiper
          modules={[EffectCoverflow, Pagination]}
          effect="coverflow"
          loop={true}
          spaceBetween={30}
          slidesPerView={3}
          pagination={{ clickable: true }}
          centeredSlides={true}
          grabCursor={true}
          coverflowEffect={{ rotate: 0, slideShadows: false }}
          className="coverflow"
        >
          {photos.map((p, index) => (
            <SwiperSlide
              key={index}
              className="flex justify-center items-center"
            >
              <img
                src={p}
                alt={`Slide ${index}`}
                className="object-contain max-h-40 max-w-full"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
