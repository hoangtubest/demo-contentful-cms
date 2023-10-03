let postId = getParameterByName("id");
console.log(postId);

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

    console.log(postItem);

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
  const postFieldsCategoryId = postItemFields.category.id;
  const postFieldsImageId = postItemFields.eyecatch.sys.id;
  function handleCategorySuccess() {
    console.log(123);
  }
  function handleAssetSuccess() {
    console.log(211);
  }
  callApiCategory(postFieldsCategoryId, handleCategorySuccess);
  callApiAsset(postFieldsImageId, handleAssetSuccess);
  const getPostCategory = document.querySelector("#js-postCategory");
  getPostCategory.innerHTML = "";
  const postCategoryList = document.createElement("ul");
  postCategoryList.className = "p-columnPostCategories";
  const postCategoryItem = document.createElement("li");

  const postCategoryLink = document.createElement("a");
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
  postThumbnailImage.src = postItemFields.eyecatch.url;
  postThumbnailImage.alt = postItemFields.title;
  postThumbnailImage.width = postItemFields.eyecatch.width;
  postThumbnailImage.height = postItemFields.eyecatch.height;

  getPostThumbnail.appendChild(postThumbnailImage);

  const getPostContent = document.querySelector("#js-post");
  const getPostContentEditor = document.createElement("div");
  getPostContentEditor.className = "c-postEditor";
  getPostContentEditor.innerHTML = postItemFields.content;
  getPostContent.appendChild(getPostContentEditor);
}

function renderRelatedPosts(currentPost, allPosts) {
  let relatedPosts = allPosts.filter(function (post) {
    return (
      post.category.id === currentPost.category.id && post.id !== currentPost.id
    );
  });

  // console.log(relatedPosts);

  const relatedPostList = document.querySelector("#js-relatedPostList");
  relatedPostList.innerHTML = "";

  if (relatedPosts.length > 0) {
    const relatedPostContainer = document.createElement("ul");
    relatedPostContainer.className = "c-linkList";

    relatedPosts.forEach(function (post) {
      const relatedPostItem = document.createElement("li");
      const relatedPostLink = document.createElement("a");
      relatedPostLink.href = "./post.html?id=" + post.id;

      const dl = document.createElement("dl");
      const dt = document.createElement("dt");
      const figure = document.createElement("figure");
      const postRelatedImage = document.createElement("img");
      postRelatedImage.src = post.eyecatch.url;
      postRelatedImage.alt = post.title;
      postRelatedImage.width = post.eyecatch.width;
      postRelatedImage.height = post.eyecatch.height;
      const dd = document.createElement("dd");
      dd.textContent = post.title;

      figure.appendChild(postRelatedImage);
      dt.appendChild(figure);
      dl.appendChild(dt);
      dl.appendChild(dd);
      relatedPostLink.appendChild(dl);
      relatedPostItem.appendChild(relatedPostLink);
      relatedPostContainer.appendChild(relatedPostItem);
    });

    relatedPostList.appendChild(relatedPostContainer);
  } else {
    relatedPostList.textContent = "関連する投稿はまだありません";
  }
}

getPost();
