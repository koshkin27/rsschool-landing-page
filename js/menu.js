import { setScrollLock } from "./scroll-lock.js";

const MOBILE_MAX_WIDTH = 768;
const INITIAL_VISIBLE_COUNT = 4;
const CATEGORIES = ["coffee", "tea", "dessert"];

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

function parseAmount(value) {
  return Number.parseFloat(value);
}

function isMobileViewport() {
  return window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches;
}

function createProductCard(product) {
  const item = document.createElement("li");
  item.className = "products__item";

  const card = document.createElement("article");
  card.className = "product-card";
  card.tabIndex = 0;

  card.innerHTML = `
    <div class="product-card__preview">
      <img src="${product.image}" alt="${product.name}">
    </div>
    <h2>${product.name}</h2>
    <p>${product.description}</p>
    <p class="product-card__price">${formatPrice(parseAmount(product.price))}</p>
  `;

  item.appendChild(card);
  return { item, card };
}

function createOptionButton(label, sublabel, pressed) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "modal-option";
  button.setAttribute("aria-pressed", pressed ? "true" : "false");
  button.innerHTML = `
    <span class="modal-option__label">${label}</span>
    <span class="modal-option__sublabel">${sublabel}</span>
  `;
  return button;
}

export async function initMenuPage() {
  const productsRoot = document.querySelector(".products");
  const tabs = document.querySelectorAll(".menu-tab");
  const loadMoreBtn = document.querySelector(".load-more");

  if (!productsRoot || tabs.length === 0) {
    return;
  }

  const response = await fetch("data/products.json");

  if (!response.ok) {
    throw new Error("Failed to load products");
  }

  const products = await response.json();
  let activeCategory = CATEGORIES[0];
  let showAllProducts = false;
  let cards = [];

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="modal__backdrop" data-modal-close></div>
    <div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button class="modal__close circle-btn" type="button" aria-label="Close product details" data-modal-close>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="modal__image-wrap">
        <img class="modal__image" src="" alt="">
      </div>
      <div class="modal__content">
        <h2 class="modal__title" id="modal-title"></h2>
        <p class="modal__description"></p>
        <div class="modal__group">
          <h3 class="modal__group-title">Size</h3>
          <div class="modal__options modal__options--size"></div>
        </div>
        <div class="modal__group">
          <h3 class="modal__group-title">Additives</h3>
          <div class="modal__options modal__options--additives"></div>
        </div>
        <p class="modal__total"><span class="modal__total-label">Total:</span> <span class="modal__total-value"></span></p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const modalImage = modal.querySelector(".modal__image");
  const modalTitle = modal.querySelector(".modal__title");
  const modalDescription = modal.querySelector(".modal__description");
  const sizeOptionsRoot = modal.querySelector(".modal__options--size");
  const additivesOptionsRoot = modal.querySelector(".modal__options--additives");
  const modalTotalValue = modal.querySelector(".modal__total-value");

  let activeProduct = null;
  let selectedSize = "s";
  let selectedAdditives = new Set();

  const getCategoryProducts = () => products.filter((product) => product.category === activeCategory);

  const updateLoadMoreVisibility = () => {
    if (!loadMoreBtn) {
      return;
    }

    const categoryProducts = getCategoryProducts();
    const hasHiddenItems =
      isMobileViewport() && !showAllProducts && categoryProducts.length > INITIAL_VISIBLE_COUNT;

    loadMoreBtn.hidden = !hasHiddenItems;
  };

  const updateProductVisibility = () => {
    cards.forEach(({ item }, index) => {
      const shouldHide =
        isMobileViewport() && !showAllProducts && index >= INITIAL_VISIBLE_COUNT;
      item.classList.toggle("products__item--hidden", shouldHide);
    });

    updateLoadMoreVisibility();
  };

  const renderProducts = () => {
    productsRoot.replaceChildren();
    cards = [];

    getCategoryProducts().forEach((product) => {
      const cardElements = createProductCard(product);
      cards.push({ ...cardElements, product });
      productsRoot.appendChild(cardElements.item);
    });

    updateProductVisibility();
  };

  const calculateTotal = () => {
    if (!activeProduct) {
      return 0;
    }

    let total = parseAmount(activeProduct.price);
    total += parseAmount(activeProduct.sizes[selectedSize]["add-price"]);

    selectedAdditives.forEach((additiveIndex) => {
      total += parseAmount(activeProduct.additives[additiveIndex]["add-price"]);
    });

    return total;
  };

  const updateModalTotal = () => {
    modalTotalValue.textContent = formatPrice(calculateTotal());
  };

  const renderModalOptions = () => {
    if (!activeProduct) {
      return;
    }

    sizeOptionsRoot.replaceChildren();
    additivesOptionsRoot.replaceChildren();

    Object.entries(activeProduct.sizes).forEach(([sizeKey, sizeData]) => {
      const button = createOptionButton(
        sizeKey.toUpperCase(),
        sizeData.size,
        selectedSize === sizeKey,
      );

      button.addEventListener("click", () => {
        selectedSize = sizeKey;
        renderModalOptions();
        updateModalTotal();
      });

      sizeOptionsRoot.appendChild(button);
    });

    activeProduct.additives.forEach((additive, index) => {
      const button = createOptionButton(
        String(index + 1),
        additive.name,
        selectedAdditives.has(index),
      );

      button.addEventListener("click", () => {
        if (selectedAdditives.has(index)) {
          selectedAdditives.delete(index);
        } else {
          selectedAdditives.add(index);
        }
        renderModalOptions();
        updateModalTotal();
      });

      additivesOptionsRoot.appendChild(button);
    });
  };

  const openModal = (product) => {
    activeProduct = product;
    selectedSize = "s";
    selectedAdditives = new Set();

    modalImage.src = product.image;
    modalImage.alt = product.name;
    modalTitle.textContent = product.name;
    modalDescription.textContent = product.description;

    renderModalOptions();
    updateModalTotal();

    modal.hidden = false;
    setScrollLock(true);
  };

  const closeModal = () => {
    modal.hidden = true;
    setScrollLock(false);
    activeProduct = null;
  };

  const setActiveCategory = (category) => {
    activeCategory = category;
    showAllProducts = false;

    tabs.forEach((tab) => {
      const isActive = tab.dataset.category === category;
      tab.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    renderProducts();
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const category = tab.dataset.category;

      if (!category || category === activeCategory) {
        return;
      }

      setActiveCategory(category);
    });
  });

  productsRoot.addEventListener("click", (event) => {
    const card = event.target.closest(".product-card");

    if (!card) {
      return;
    }

    const matchedCard = cards.find(({ card: cardElement }) => cardElement === card);

    if (matchedCard) {
      openModal(matchedCard.product);
    }
  });

  productsRoot.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const card = event.target.closest(".product-card");

    if (!card) {
      return;
    }

    event.preventDefault();
    const matchedCard = cards.find(({ card: cardElement }) => cardElement === card);

    if (matchedCard) {
      openModal(matchedCard.product);
    }
  });

  loadMoreBtn?.addEventListener("click", () => {
    showAllProducts = true;
    updateProductVisibility();
  });

  modal.querySelectorAll("[data-modal-close]").forEach((element) => {
    element.addEventListener("click", closeModal);
  });

  modal.querySelector(".modal__dialog").addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });

  window.addEventListener("resize", () => {
    updateProductVisibility();
  });

  setActiveCategory(CATEGORIES[0]);
}
