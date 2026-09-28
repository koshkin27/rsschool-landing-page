export function initCoffeeSlider() {
  const slider = document.querySelector(".coffee-slider");

  if (!slider) {
    return;
  }

  const track = slider.querySelector(".coffee-slider__track");
  const slides = slider.querySelectorAll(".coffee-slider__slide");
  const prevBtn = slider.querySelector(".coffee-slider__btn--back");
  const nextBtn = slider.querySelector(".coffee-slider__btn--next");
  const dots = slider.querySelectorAll(".coffee-slider__dot");

  if (!track || slides.length === 0) {
    return;
  }

  let activeIndex = 0;

  const goToSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${activeIndex * 100}%)`;

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  };

  prevBtn?.addEventListener("click", () => goToSlide(activeIndex - 1));
  nextBtn?.addEventListener("click", () => goToSlide(activeIndex + 1));

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => goToSlide(dotIndex));
  });

  goToSlide(0);
}
