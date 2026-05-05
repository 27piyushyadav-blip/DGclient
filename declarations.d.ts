declare module "*.css";
declare module "swiper/react" {
  import { ReactNode, ComponentPropsWithRef } from "react";
  import { SwiperProps, SwiperSlideProps } from "swiper/react";

  export const Swiper: React.ForwardRefExoticComponent<
    SwiperProps & { children?: ReactNode } & ComponentPropsWithRef<"div">
  >;
  export const SwiperSlide: React.ElementType<
    SwiperSlideProps & { children?: ReactNode }
  >;
}

declare module "swiper/modules";
declare module "swiper/css";
declare module "swiper/css/navigation";
declare module "swiper/css/pagination";
declare module "swiper/css/effect-coverflow";
