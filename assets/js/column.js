const categoryId = getParameterByName("category");
// console.log(categoryId);

function getCategoryList(limitCategory) {
  const apiUrl = "categories";
  let limit = limitCategory;
  let allCategoryItems;

  function handleSuccess(data) {
    // console.log("-----allCategoryItems JSON----");
    allCategoryItems = [...data];
    console.log(allCategoryItems);
    renderCategoryItems(allCategoryItems);
  }

  callApi(apiUrl, limit, handleSuccess, handleError);
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

getCategoryList();
getColumnList();
