function hit_my_face() {
    var face = document.getElementById('img_myface');

    face.src = '/assets/img/play/myface_hit.svg';
    face.style.transform = 'rotate(10deg)';

    setTimeout(function () {
        face.src = "/assets/img/play/myface.svg";
        face.style.transform = "rotate(0deg)";
    }, 400);

}