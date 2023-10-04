let postId = getParameterByName("id");
// console.log(postId);

function getPost(limitPost) {
  const apiUrl = "blogPage";
  let limit = limitPost;
  let allPostItems;

  function handleSuccess(data) {
    // console.log("-----allPostItems JSON----");
    allPostItems = [...data];
    // console.log(allPostItems);
    let postItem = allPostItems.find(function (item) {
      return item.fields.id === postId;
    });

    // console.log(postItem);

    if (postItem) {
      renderPostItems(postItem);
      renderRelatedPosts(postItem, allPostItems);
    }
  }

  callApi(apiUrl, limit, handleSuccess, handleError);
}

function renderPostItems(postItem) {
  const postItemFields = postItem.fields;
  const postItemSys = postItem.sys;
  const postFieldsCategoryId = postItemFields.category.sys.id;
  const postFieldsImageId = postItemFields.eyecatch.sys.id;
  const postFieldsContent = postItemFields.content.content;
  // console.log(postItemFields);
  // console.log(postFieldsCategoryId);
  // console.log(postFieldsImageId);

  const getPostCategory = document.querySelector("#js-postCategory");
  getPostCategory.innerHTML = "";
  const postCategoryList = document.createElement("ul");
  postCategoryList.className = "p-columnPostCategories";
  const postCategoryItem = document.createElement("li");

  const postCategoryLink = document.createElement("a");
  // Call callApiCategory() => get the {link, text} of category
  // postCategoryLink.href = `./?category=${postItemFields.category.id}`;
  // postCategoryLink.textContent = postItemFields.category.name;

  postCategoryItem.appendChild(postCategoryLink);
  postCategoryList.appendChild(postCategoryItem);
  getPostCategory.appendChild(postCategoryList);

  const getPostTitle = document.querySelector("#js-postTitle");
  getPostTitle.innerHTML = "";
  getPostTitle.textContent = postItemFields.title;

  const getPublishedDate = document.querySelector("#js-publishedDate");
  getPublishedDate.innerHTML = "";
  getPublishedDate.textContent = formatDateToCustomFormat(
    postItemSys.createdAt
  );

  const getUpdatedDate = document.querySelector("#js-updatedDate");
  getUpdatedDate.innerHTML = "";
  getUpdatedDate.textContent = formatDateToCustomFormat(postItemSys.updatedAt);

  const getPostThumbnail = document.querySelector("#js-postThumbnail");
  getPostThumbnail.innerHTML = "";
  const postThumbnailImage = document.createElement("img");
  // Call callApiAsset() => get the {url, alt, width, height} of img
  // postThumbnailImage.src = postItemFields.eyecatch.url;
  // postThumbnailImage.alt = postItemFields.title;
  // postThumbnailImage.width = postItemFields.eyecatch.width;
  // postThumbnailImage.height = postItemFields.eyecatch.height;

  getPostThumbnail.appendChild(postThumbnailImage);

  const getPostContent = document.querySelector("#js-post");
  const getPostContentEditor = document.createElement("div");
  getPostContentEditor.className = "c-postEditor";

  // postFieldsContent
  postFieldsContent.forEach((item) => {
    const itemNodeType = item.nodeType;

    let contentElement;

    if (item.content && item.content.length > 0) {
      switch (itemNodeType) {
        case "heading-1":
          contentElement = document.createElement("h1");
          contentElement.textContent = item.content[0].value;
          break;
        case "heading-2":
          contentElement = document.createElement("h2");
          contentElement.textContent = item.content[0].value;
          break;
        case "heading-3":
          contentElement = document.createElement("h3");
          contentElement.textContent = item.content[0].value;
          break;
        case "heading-4":
          contentElement = document.createElement("h4");
          contentElement.textContent = item.content[0].value;
          break;
        case "heading-5":
          contentElement = document.createElement("h5");
          contentElement.textContent = item.content[0].value;
          break;
        case "heading-6":
          contentElement = document.createElement("h6");
          contentElement.textContent = item.content[0].value;
          break;
        case "blockquote":
          contentElement = document.createElement("blockquote");
          contentElement.textContent = item.content[0].value;
          break;
        default:
          if (
            item.content[0].marks &&
            item.content[0].marks.length > 0 &&
            item.content[0].marks[0].type === "code"
          ) {
            contentElement = document.createElement("pre");
            const contentElementCode = document.createElement("code");
            contentElementCode.textContent = item.content[0].value;
            contentElement.appendChild(contentElementCode);
          } else {
            contentElement = document.createElement("p");
            contentElement.textContent = item.content[0].value;
          }
          break;
      }
    } else if (item.data) {
      switch (itemNodeType) {
        case "embedded-asset-block":
          if (item.data.target.sys.id) {
            const dataAssetDataTargetSysId = item.data.target.sys.id;
            contentElement = document.createElement("img");
            function handleAssetSuccess() {
              contentElement.src = assetImage.url;
              contentElement.width = assetImage.details.image.width;
              contentElement.height = assetImage.details.image.height;
            }
            callApiAsset(dataAssetDataTargetSysId, handleAssetSuccess);
          }
          break;
        default:
          break;
      }
    }

    if (contentElement) {
      getPostContentEditor.appendChild(contentElement);
    }
  });

  // postFieldsContent

  getPostContent.appendChild(getPostContentEditor);

  function handleCategorySuccess() {
    // console.log("handleCategorySuccess() run");
    postCategoryLink.href = `./?category=${dataCategoryFields.id}`;
    postCategoryLink.textContent = dataCategoryFields.name;
  }
  function handleAssetSuccess() {
    // console.log("handleAssetSuccess() run");
    postThumbnailImage.src = assetImage.url;
    postThumbnailImage.width = assetImage.details.image.width;
    postThumbnailImage.height = assetImage.details.image.height;
    postThumbnailImage.alt = postItemFields.title;
  }
  callApiCategory(postFieldsCategoryId, handleCategorySuccess);
  callApiAsset(postFieldsImageId, handleAssetSuccess);
}

function renderRelatedPosts(currentPost, allPosts) {
  let relatedPosts = allPosts.filter(function (post) {
    return (
      post.fields.category.sys.id === currentPost.fields.category.sys.id &&
      post.fields.id !== currentPost.fields.id
    );
  });

  // console.log(relatedPosts);

  const relatedPostList = document.querySelector("#js-relatedPostList");
  relatedPostList.innerHTML = "";

  if (relatedPosts.length > 0) {
    const relatedPostContainer = document.createElement("ul");
    relatedPostContainer.className = "c-linkList";
    const maxRelatedPosts = 5;

    relatedPosts.slice(0, maxRelatedPosts).forEach(function (post) {
      // console.log(post);
      const postRelatedFieldsImageId = post.fields.eyecatch.sys.id;
      // console.log(postRelatedFieldsImageId);

      const relatedPostItem = document.createElement("li");
      const relatedPostLink = document.createElement("a");
      relatedPostLink.href = "./post.html?id=" + post.fields.id;

      const dl = document.createElement("dl");
      const dt = document.createElement("dt");
      const figure = document.createElement("figure");
      const postRelatedImage = document.createElement("img");
      // Call callApiAsset() => get the {url, alt, width, height} of img
      // postRelatedImage.src = post.eyecatch.url;
      // postRelatedImage.alt = post.fields.title;
      // postRelatedImage.width = post.eyecatch.width;
      // postRelatedImage.height = post.eyecatch.height;
      const dd = document.createElement("dd");
      dd.textContent = post.fields.title;

      figure.appendChild(postRelatedImage);
      dt.appendChild(figure);
      dl.appendChild(dt);
      dl.appendChild(dd);
      relatedPostLink.appendChild(dl);
      relatedPostItem.appendChild(relatedPostLink);
      relatedPostContainer.appendChild(relatedPostItem);

      function handleRelatedAssetSuccess() {
        // console.log("handleRelatedAssetSuccess() run");
        postRelatedImage.src = assetImage.url;
        postRelatedImage.width = assetImage.details.image.width;
        postRelatedImage.height = assetImage.details.image.height;
        postRelatedImage.alt = post.fields.title;
      }
      callApiAsset(postRelatedFieldsImageId, handleRelatedAssetSuccess);
    });

    relatedPostList.appendChild(relatedPostContainer);
  } else {
    relatedPostList.textContent = "関連する投稿はまだありません";
  }
}

getPost();
