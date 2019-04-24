function buttonHandler(btn, articleId) {
  console.log(articleId);
  var title = $("#" + articleId).data("title");
  var link = $("#" + articleId).data("link");
  $.ajax({
    method: "POST",
    url: "/savearticle/",
    data: {
      id: articleId,
      title,
      link
    }
  }).then(function(data) {
    // Log the response
    console.log(data);
  });
}
