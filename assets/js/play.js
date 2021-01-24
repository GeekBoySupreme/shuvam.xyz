function hit_my_face() {
    var face = document.getElementById('img_myface');

    face.src = '/assets/img/play/myface_hit.svg';
    face.style.transform = 'rotate(10deg)';

    setTimeout(function () {
        face.src = "/assets/img/play/myface.svg";
        face.style.transform = "rotate(0deg)";
    }, 400);

}



function show_egg(param) {
    var message = '';

    switch (param) {
      case "sword":
        message =
          "The sword in the stone : Archaeologists discover medieval weapon dubbed 'Excalibur' embedded in rock at bottom of Bosnian lake. The famous mythical legend of King Arthur goes that he pulled his magical Excalibur sword from the stone it was forged in ⚔️";
        break;
      case "flames":
        message =
          "Claims for the earliest definitive evidence of control of fire by a member of Homo range from 1.7 to 2.0 million years ago (Mya). Evidence for the 'microscopic traces of wood ash' as controlled use of fire by Homo erectus, beginning some 1,000,000 years ago, has wide scholarly support 🔥";
        break;
      case "ziggurat":
        message =
          "Ziggurat, pyramidal stepped temple tower that is an architectural and religious structure characteristic of the major cities of Mesopotamia (now mainly in Iraq) from approximately 2200 until 500 bce. The ziggurat was always built with a core of mud brick and an exterior covered with baked brick. 🧙";
        break;
      case "nova":
        message =
          "A homing beacon or tracking device was one of the most common fan explanations for Captain Marvel's rescue. With Carol on Earth meeting with the Avengers, many believed that someone on the team would be able to find the ship and tell her where to go. Rocket's presence with the team and knowledge of the Benatar makes him the most likely to have known how to locate it 🚨";
        break;
      case "ice plant":
        message =
          "There wasn't enough carbon dioxide in the air to support vegetation. Instead of being water-starved, growth was limited because plants were carbon-starved. What's more, climate models tell us that even in regions where soils were wetter during the last ice age, there was less vegetation 🍆";
        break;
      case "pokeball":
        message =
          "No Pokemons Spotted yet :3";
        break;
      case "ice flame":
        message =
          "Think of Sodium. Na?";
        break;
      case "runepillar":
        message =
          "The Elder Futhark, used for writing Proto-Norse, consists of 24 runes that often are arranged in three groups of eight; each group is referred to as an Ætt. The earliest known sequential listing of the full set of 24 runes dates to approximately AD 400 and is found on the Kylver Stone in Gotland, Sweden.";
        break;
      case "lootbox":
        message =
          "No loot yet. Come back later :')";
        break;
    }

    alert(message);

}