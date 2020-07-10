function callpage() {
    var xmlhttp = new XMLHttpRequest();
    var url = "assets/js/content.json";

    xmlhttp.onreadystatechange = function() {
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

    switch(flag) {
        case 'homepage' :
            render_at_home(data);
        break;
        case 'blogpage' :
            render_at_blog(data.blogs);
        break;
        case 'talkpage' :
            render_at_talks(data.talks);
        break;
    }
}

function render_at_home(data) {

    var blog_html = '';
    for(var i=0; i<4; i++) {
        blog_html += "<li> <a href='"+ data.blogs[i].blog_link +"' class='nav-link'> <span><b>"+ data.blogs[i].blog_title +"</b></span> <p><b>"+ data.blogs[i].blog_description +"</b></p> </a> </li>";
    }

    document.getElementById("blog_list").innerHTML = blog_html;

    
    
    var talk_html = '';
    for(var i=0; i<4; i++) {
        talk_html += "<li> <a href='"+ data.talks[i].talk_link +"' class='nav-link'> <span><b>"+ data.talks[i].talk_name +"</b></span> <p><b>"+ data.talks[i].talk_venue +"</b></p> </a> </li>";
    }

    document.getElementById("talk_list").innerHTML = talk_html;


   
    var project_html = '';
    for(var i=0; i<3; i++) {
        project_html += '<div class="col-lg-4 col-md-6 col-sm-6 wow fadeIn" data-wow-delay="0.2s"> \
                            <div class="card" id="card"> \
                            <img class="img-fluid" src='+ +'/> \
                            <div class="card_content"> \
                           <span class="about_title_track">'+ +'</span> \
                           <p class="description">'+ +'</p> \
                            <a class="project_link" href="'+ +'">Open Link <i class="fas fa-external-link-alt"></i></a> \
                        </div>  \
                        </div> \
                   </div>';
    }

    document.getElementById("project_list").innerHTML = project_html;


}


function render_at_blog(data) {
    var blog_html = '';
    for(var i=0; i<data.length; i++) {
        blog_html += "<li> <a href='"+ data[i].blog_link +"' class='nav-link'> <span><b>"+ data[i].blog_title +"</b></span> <p><b>"+ data[i].blog_description +"</b></p> </a> </li>";
    }

    document.getElementById("blog_list").innerHTML = blog_html;
}



callpage();