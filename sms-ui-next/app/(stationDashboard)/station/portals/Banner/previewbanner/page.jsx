"use client";
import * as React from "react";
import Card from "@/components/ui/card-snippet";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import slider1 from "@/public/images/all-img/slider-1.png";
import Image from "next/image";

const CarouselPage = () => {
  const autoplayOptions = {
    delay: 3000,
    stopOnInteraction: false,
  };

  return (
    <Card className={"text-orange-500"} title="VIEW BANNER">
      <Carousel
        className="w-full max-w-3xl mx-auto"
        plugins={[Autoplay(autoplayOptions)]}
      >
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem className="w-full" key={index}>
              <div className="p-1">
                <div className="flex aspect-square items-center justify-center h-[300px] w-full">
                  <Image
                    className="w-full h-full object-cover rounded-lg"
                    src={slider1}
                    alt={`slide-${index}`}
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </Card>
  );
};

export default CarouselPage;
