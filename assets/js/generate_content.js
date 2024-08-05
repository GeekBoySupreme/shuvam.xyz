function callpage() {
  var xmlhttp = new XMLHttpRequest();
  var url = "assets/js/content.json";

  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var myData = JSON.parse(this.responseText);
      renderData(myData);
    }
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

function renderData(data) {
  var flag = document.getElementById("page_type").value;

  switch (flag) {
    case "homepage":
      render_at_home(data);
      break;
    case "blogpage":
      render_at_blog(data.blogs);
      break;
    case "talkpage":
      render_at_talks(data.talks);
      break;
    case "projectpage":
      render_at_projects(data.projects);
      break;
    case "postpage":
      render_at_post(data.blogs);
      break;
  }
}

function render_at_home(data) {
  var blog_html = "";
  for (var i = 0; i < 4; i++) {
    blog_html +=
      "<li> <a target='_blank' href='" +
      data.blogs[i].blog_link +
      "' class='nav-link'> <span><b>" +
      data.blogs[i].blog_title +
      "</b></span> <p>" +
      data.blogs[i].blog_description +
      "</p><span class='blog_date_tag blog_" +
      data.blogs[i].blog_tag +
      "'>" +
      data.blogs[i].blog_date +
      "</span>  </a> </li>";
  }

  document.getElementById("blog_list").innerHTML = blog_html;

  var talk_html = "";
  for (var i = 0; i < 5; i++) {
    talk_html +=
      "<li> <a target='_blank' href='" +
      data.talks[i].talk_link +
      "' class='nav-link'> <span><b>" +
      data.talks[i].talk_name +
      "</b></span><p>" +
      data.talks[i].talk_venue +
      "</p> </a> </li>";
  }

  document.getElementById("talk_list").innerHTML = talk_html;

  var project_html = "";

  for (var i = 0; i < 6; i++) {
    project_html +=
      '<div class="col-lg-4 col-md-6 col-sm-6 col-xs-12 wow fadeIn" data-wow-delay="0.2s"> \
                            <div class="project_card"> <br/>\
      <img src="' +
      data.projects[i].project_thumbnail +
      '" alt="project_logo" height="30px" style="margin-bottom: 16px; border-radius: 3px;"/><br/> \
                            <span class="about_title_track"><b>' +
      data.projects[i].project_name +
      '</b></span> \
                            <p class="description" style="margin-top:10px">' +
      data.projects[i].project_description +
      '</p> \
                            <a target="blank" class="project_link" href="' +
      data.projects[i].project_link +
      '">Check it out</a> \
                            </div>  \
                            </div> \
                        </div>';
  }

  document.getElementById("project_list").innerHTML = project_html;
}

function render_at_blog(data) {
  var blog_html = "";
  for (var i = 0; i < data.length; i++) {
    blog_html +=
      "<li> <a target='_blank' href='" +
      data[i].blog_link +
      "' class='nav-link'> <span><b>" +
      data[i].blog_title +
      "</b></span> <p>" +
      data[i].blog_description +
      "</p><span class='blog_date_tag blog_" +
      data[i].blog_tag +
      "'>" +
      data[i].blog_date +
      "</span>  </a> </li>";
  }

  document.getElementById("blog_list").innerHTML = blog_html;
}

function render_at_post(data) {
  var blog_html = "";
  for (var i = 0; i < 4; i++) {
    blog_html +=
      "<li> <a target='_blank' href='" +
      data[i].blog_link +
      "' class='nav-link'> <span><b>" +
      data[i].blog_title +
      "</b></span> <p>" +
      data[i].blog_description +
      "</p><span class='blog_date_tag blog_" +
      data[i].blog_tag +
      "'>" +
      data[i].blog_date +
      "</span>  </a> </li>";
  }

  document.getElementById("blog_list").innerHTML = blog_html;
}

function render_at_talks(data) {
  var talk_html = "";
  for (var i = 0; i < data.length; i++) {
    talk_html +=
      "<li> <a target='_blank' href='" +
      data[i].talk_link +
      "' class='nav-link'> <span><b>" +
      data[i].talk_name +
      "</b></span> <p>" +
      data[i].talk_venue +
      "</p> </a> </li>";
  }

  document.getElementById("talk_list").innerHTML = talk_html;
}

function render_at_projects(data) {
  var project_html = "";
  for (var i = 0; i < data.length; i++) {
    project_html +=
      '<div class="col-lg-4 col-md-6 col-sm-6 col-xs-12 wow fadeIn" data-wow-delay="0.2s"> \
                            <div class="project_card"> <br/>\
      <img src="' +
      data[i].project_thumbnail +
      '" alt="project_logo" height="30px" style="margin-bottom: 16px; border-radius: 3px;"/><br/> \
                            <span class="about_title_track"><b>' +
      data[i].project_name +
      '</b></span> \
                            <p class="description" style="margin-top:10px">' +
      data[i].project_description +
      '</p> \
                            <a target="blank" class="project_link" href="' +
      data[i].project_link +
      '">Check it out</a> \
                            </div>  \
                            </div> \
                        </div>';
  }

  document.getElementById("project_list").innerHTML = project_html;
}

callpage();
