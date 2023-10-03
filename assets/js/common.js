let currentURL = window.location.href;
console.log(currentURL);

const apiKey = "kFbPZJQqDseWvnvwhMCeyLFztPqiB7CLgV9iknOuIl4";
const spaceId = "blrbugsds7rq";

let allColumnItems = [];
let columnOfCategoryItems = [];
let itemsPerPage = 6;
let currentPage = 1;
let previousPage = 1;
let totalPages = 1;
let assetImage;
let allCategoryItems;

function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function Effect() {
  function handleScroll() {
    const elements = document.querySelectorAll(".js-effect");

    elements.forEach(function (element) {
      if (isElementInViewport(element)) {
        element.classList.add("is-show");
      } else {
        element.classList.remove("is-show");
      }
    });
  }

  handleScroll();
  window.addEventListener("scroll", handleScroll);
}

function onReady(callback) {
  const loading = document.querySelector("#loading");
  let promises = [];

  function onResourceLoad() {
    loading.classList.add("loaded");
    Promise.all(promises).then(callback);
  }

  if (loading) {
    const images = document.querySelectorAll("img");
    for (let i = 0; i < images.length; i++) {
      let promise = new Promise(function (resolve, reject) {
        const image = images[i];
        if (image.complete) {
          resolve();
        } else {
          image.addEventListener("load", resolve);
          image.addEventListener("error", reject);
        }
      });
      promises.push(promise);
    }
  }

  if (document.readyState === "complete") {
    onResourceLoad();
  } else {
    window.addEventListener("load", onResourceLoad);
  }
}

function setVisible(selector) {
  const element = document.querySelector(selector);
  element.classList.add("loadHidden");
  setTimeout(function () {
    Effect();
    document.body.classList.remove("is-fixed");
  }, 300);
}

if (document.getElementById("loading")) {
  document.body.classList.add("is-fixed");
  onReady(function () {
    setVisible("#loading");
  });
} else {
  setTimeout(function () {
    Effect();
  }, 300);
}

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function formatDateToCustomFormat(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}.${month}.${day}`;
}

function callApi(contentType, limit = 100, successCallback, errorCallback) {
  const apiUrl = `https://cdn.contentful.com/spaces/${spaceId}/entries?content_type=${contentType}&limit=${limit}`;

  // console.log(apiUrl);

  fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      // const responseData = JSON.parse(data.items);
      const responseData = data.items;
      successCallback(responseData);
    })
    .catch((error) => {
      console.error("Error:", error);
      errorCallback(error);
    });
}

function callApiAsset(assetId, successAssetCallback) {
  const apiUrl = `https://cdn.contentful.com/spaces/${spaceId}/assets/${assetId}`;

  // console.log(apiUrl);

  fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })
    .then((response) => response.json())
    .then((dataAsset) => {
      // console.log(dataAsset);
      assetImage = dataAsset.fields.file;
      // console.log(assetImage);
      successAssetCallback(assetImage);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function handleError(error) {
  console.error("Error JSON:", error);
}

function getNewsList(limitNews) {
  const apiUrl = "news";
  let limit = limitNews;
  let newsDataAll;
  let filteredItems;
  let currentTab = "all";
  let previousTab = "all";

  const tabConditions = {
    all: () => true,
    notice: (item) => item.fields.news_categories_01,
    activities: (item) => item.fields.news_categories_02,
  };

  function handleNewsSuccess(data) {
    // console.log("-----newsDataAll JSON----");
    newsDataAll = [...data];
    // console.log(newsDataAll);
    renderNewsItems(newsDataAll);
  }

  function handleNewsError(error) {
    const getColumnList = document.querySelector("#js-getNewsList");
    getColumnList.innerHTML =
      '<p class="u-text-center">まだお知らせがありません。</p>';
    console.error("Error JSON:", error);
  }

  callApi(apiUrl, limit, handleNewsSuccess, handleNewsError);

  const tabButtons = document.querySelectorAll(".c-tab__item");
  tabButtons.forEach((tab) => {
    tab.addEventListener("click", handleTabClick);
  });

  function handleTabClick(event) {
    previousTab = currentTab;
    currentTab = event.target.dataset.tab;

    if (previousTab !== currentTab) {
      // console.log("clicked");
      tabButtons.forEach((tab) => {
        tab.classList.remove("active");
      });
      event.target.classList.add("active");

      // if (currentTab === "all") {
      //   filteredItems = newsDataAll;
      // } else if (currentTab === "notice") {
      //   filteredItems = newsDataAll.filter((item) => item.news_categories_01);
      // } else if (currentTab === "activities") {
      //   filteredItems = newsDataAll.filter((item) => item.news_categories_02);
      // }

      filteredItems = newsDataAll.filter((item) =>
        tabConditions[currentTab](item)
      );

      // console.log(filteredItems);
      renderNewsItems(filteredItems);
    }
  }
}

function renderNewsItems(items) {
  const getNewsList = document.querySelector("#js-getNewsList");
  getNewsList.innerHTML = "";
  const newsList = document.createElement("ol");
  newsList.className = "c-newsList";
  newsList.innerHTML = "";

  items.forEach((newsItem) => {
    const newsItemFields = newsItem.fields;
    const listItem = document.createElement("li");
    listItem.className = "c-newsList__item";

    let contentElement;
    if (newsItemFields.news_link) {
      const link = document.createElement("a");
      link.className = "c-newsList__contents";
      link.href = newsItemFields.news_link;

      if (newsItemFields.news_link_target) {
        link.setAttribute("target", "_blank");
      }

      contentElement = link;
    } else {
      contentElement = document.createElement("div");
      contentElement.className = "c-newsList__contents";
    }

    const dl = document.createElement("dl");

    const dt = document.createElement("dt");
    dt.className = "c-newsList__head";

    const time = document.createElement("time");
    time.datetime = newsItemFields.news_time;
    time.textContent = formatDateToCustomFormat(newsItemFields.news_time);

    const labelList = document.createElement("ul");
    labelList.className = "c-newsList__label";

    if (newsItemFields.news_categories_01) {
      const categoryLi1 = document.createElement("li");
      categoryLi1.textContent = "Notice";
      labelList.appendChild(categoryLi1);
    }

    if (newsItemFields.news_categories_02) {
      const categoryLi2 = document.createElement("li");
      categoryLi2.textContent = "Activities";
      labelList.appendChild(categoryLi2);
    }

    const dd = document.createElement("dd");
    dd.textContent = newsItemFields.news_title;

    dt.appendChild(time);
    dt.appendChild(labelList);
    dl.appendChild(dt);
    dl.appendChild(dd);
    contentElement.appendChild(dl);
    listItem.appendChild(contentElement);
    newsList.appendChild(listItem);
  });

  getNewsList.appendChild(newsList);
}

function getCategoryList(limitCategory) {
  const apiUrl = "categories";
  let limit = limitCategory;

  function handleCategorySuccess(data) {
    // console.log("-----allCategoryItems JSON----");
    allCategoryItems = [...data];
    console.log(allCategoryItems);

    if (currentURL.includes("/column/")) {
      renderCategoryItems(allCategoryItems);
    }
  }

  callApi(apiUrl, limit, handleCategorySuccess, handleError);
}

function renderCategoryItems(items) {
  const getCategoryList = document.querySelector("#js-getCategoryList");
  const getCategoryListUl = getCategoryList.querySelector(".c-linkList");
  getCategoryListUl.innerHTML = "";

  const listItemFirst = document.createElement("li");
  const categoryLinkFirst = document.createElement("a");
  categoryLinkFirst.className = `c-linkList__contents js-switchCategory`;
  categoryLinkFirst.href = `?category=all`;
  categoryLinkFirst.dataset.category = "all";
  categoryLinkFirst.textContent = "すべて";
  listItemFirst.appendChild(categoryLinkFirst);
  getCategoryListUl.appendChild(listItemFirst);

  items.forEach((categoryItem) => {
    const categoryItemFields = categoryItem.fields;
    const listItem = document.createElement("li");

    const categoryLink = document.createElement("a");
    categoryLink.className = `c-linkList__contents js-switchCategory`;
    categoryLink.href = `?category=${categoryItemFields.id}`;
    categoryLink.dataset.category = categoryItemFields.id;
    categoryLink.textContent = categoryItemFields.name;

    listItem.appendChild(categoryLink);
    getCategoryListUl.appendChild(listItem);
  });

  // console.log(`category.id: ${categoryId}`);
  const switchCategoryItems = document.querySelectorAll(".js-switchCategory");
  switchCategoryItems.forEach((item) => {
    const dataCategory = item.getAttribute("data-category");

    if (
      (categoryId === null || categoryId === "all") &&
      dataCategory === "all"
    ) {
      item.classList.add("active");
    } else if (dataCategory === categoryId) {
      item.classList.add("active");
    }
  });
}

function getColumnList(limitColumn) {
  const apiUrl = "blogPage";
  let limit = limitColumn;
  let columnDataAll;

  function handleColumnSuccess(data) {
    // console.log("-----columnDataAll JSON----");
    columnDataAll = [...data];
    console.log(columnDataAll);

    getCategoryList();

    if (currentURL.includes("/column/")) {
      columnOfCategoryItems = columnDataAll.filter(function (item) {
        if (categoryId === null || categoryId === "all") {
          return true;
        } else {
          return item.category.id === categoryId;
        }
      });

      if (columnOfCategoryItems) {
        totalPages = Math.ceil(columnOfCategoryItems.length / itemsPerPage);
        renderPagination();
      }
    } else {
      renderColumnItems(columnDataAll);
    }
  }

  function handleColumnError(error) {
    const getColumnList = document.querySelector("#js-getColumnList");
    getColumnList.innerHTML =
      '<p class="u-text-center">まだお知らせがありません。</p>';
    console.error("Error JSON:", error);
  }

  callApi(apiUrl, limit, handleColumnSuccess, handleColumnError);
}

function renderColumnItems(items) {
  const getColumnList = document.querySelector("#js-getColumnList");
  getColumnList.innerHTML = "";
  const columnList = document.createElement("ol");
  columnList.className = "c-columnList";
  columnList.innerHTML = "";

  items.forEach((columnItem) => {
    const columnItemFields = columnItem.fields;
    console.log("--- begin post ---");
    const columnItemFieldsImageId = columnItemFields.eyecatch.sys.id;
    // console.log(`Image ID: ${columnItemFieldsImageId}`);
    const columnItemFieldsCategoryId = columnItemFields.category.sys.id;
    console.log(`Category ID: ${columnItemFieldsCategoryId}`);
    console.log("--- end post ---");

    // allCategoryItems.forEach((categoryItem) => {
    //   if (categoryItem.sys.id === columnItemFieldsCategoryId) {
    //     console.log("123");
    //   }
    // });

    function handleAssetSuccess() {
      const listItem = document.createElement("li");
      listItem.className = "c-columnList__item";
      listItem.dataset.category = columnItemFields.category.id;

      const linkCard = document.createElement("a");
      linkCard.className = "c-card";

      let cardUrl = currentURL.includes("/column/")
        ? `./post.html?id=${columnItemFields.id}`
        : `./column/post.html?id=${columnItemFields.id}`;
      linkCard.href = cardUrl;

      const cardInner = document.createElement("div");
      cardInner.className = "c-card__inner";

      const cardTextContents = document.createElement("div");
      cardTextContents.className = "c-card__textContents";

      const cardTitle = document.createElement("h3");
      cardTitle.className = "c-card__title";
      cardTitle.textContent = columnItemFields.title;

      const cardTagList = document.createElement("ul");
      cardTagList.className = "c-card__tagList";

      const cardTag = document.createElement("li");
      cardTag.className = "c-card__tag";
      cardTag.textContent = columnItemFields.category.name;

      const cardFigure = document.createElement("div");
      cardFigure.className = "c-card__image";

      const cardImage = document.createElement("img");
      cardImage.src = assetImage.url;
      cardImage.width = assetImage.details.image.width;
      cardImage.height = assetImage.details.image.height;
      cardImage.alt = columnItemFields.title;

      cardTextContents.appendChild(cardTitle);
      cardTagList.appendChild(cardTag);
      cardTextContents.appendChild(cardTagList);
      cardInner.appendChild(cardTextContents);
      cardFigure.appendChild(cardImage);
      cardInner.appendChild(cardFigure);
      linkCard.appendChild(cardInner);
      listItem.appendChild(linkCard);
      columnList.appendChild(listItem);
    }

    callApiAsset(columnItemFieldsImageId, handleAssetSuccess);
  });

  getColumnList.appendChild(columnList);
}

function displayItemsOnPage(page) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsOnPage = columnOfCategoryItems.slice(startIndex, endIndex);
  renderColumnItems(itemsOnPage);
}

function renderPagination() {
  displayItemsOnPage(currentPage);
  const paginationColumn = document.querySelector("#pagination-column");

  if (paginationColumn) {
    paginationColumn.innerHTML = "";

    if (columnOfCategoryItems.length <= itemsPerPage) {
      paginationColumn.style.display = "none";
    } else {
      const hasPrev = currentPage > 1;
      const hasNext = currentPage < totalPages;

      const prevButton = document.createElement("button");
      prevButton.classList =
        "pagination-column__item pagination-column__item--prev";
      prevButton.innerText = "Prev";
      prevButton.dataset.page = currentPage - 1;

      paginationColumn.appendChild(prevButton);

      for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("button");
        button.classList = "pagination-column__item";
        button.innerText = i;
        button.dataset.page = i;

        if (i === currentPage) {
          button.classList.add("active");
        }

        paginationColumn.appendChild(button);
      }

      const nextButton = document.createElement("button");
      nextButton.classList =
        "pagination-column__item pagination-column__item--next";
      nextButton.innerText = "Next";
      nextButton.dataset.page = currentPage + 1;

      paginationColumn.appendChild(nextButton);

      const paginationButtons = document.querySelectorAll(
        "#pagination-column button"
      );

      paginationButtons.forEach((button) => {
        button.addEventListener("click", () => {
          previousPage = currentPage;
          currentPage = parseInt(button.dataset.page);
          let currentPageName = parseInt(button.textContent);

          if (previousPage !== currentPage) {
            displayItemsOnPage(currentPage);

            paginationButtons.forEach((btn) => {
              btn.classList.remove("active");
            });

            if (!isNaN(currentPageName)) {
              button.classList.add("active");
            }

            const newHasPrev = currentPage > 1;
            const newHasNext = currentPage < totalPages;

            if (newHasPrev) {
              prevButton.style.display = "block";
              prevButton.dataset.page = currentPage - 1;
            } else {
              prevButton.style.display = "none";
            }

            if (newHasNext) {
              nextButton.style.display = "block";
              nextButton.dataset.page = currentPage + 1;
            } else {
              nextButton.style.display = "none";
            }

            paginationButtons.forEach((btn) => {
              if (btn.dataset.page === currentPage.toString()) {
                btn.classList.add("active");
              }
            });

            const columnSectionId = document.querySelector("#column");

            if (columnSectionId) {
              columnSectionId.scrollIntoView({
                behavior: "smooth",
              });
            }
          }
        });
      });

      if (hasPrev) {
        prevButton.style.display = "block";
      } else {
        prevButton.style.display = "none";
      }

      if (hasNext) {
        nextButton.style.display = "block";
      } else {
        nextButton.style.display = "none";
      }
    }
  }
}
