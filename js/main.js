import { initBurgerMenu } from "./burger-menu.js";
import { initCoffeeSlider } from "./slider.js";
import { initMenuPage } from "./menu.js";

initBurgerMenu();
initCoffeeSlider();

if (document.querySelector(".menu")) {
  initMenuPage().catch((error) => {
    console.error(error);
  });
}
