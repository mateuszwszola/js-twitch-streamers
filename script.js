const usernames = ["ESL_SC2", "OgamingSC2", "freecodecamp", "storbeck", "habathcx"];
const baseURL = "https://wind-bow.gomix.me/twitch-api";
let users = [];

function User(name) {
  this.name = name;
}

usernames.forEach(function(username) {
  const userObj = new User(username);
  users.push(userObj);
});

console.log('Users array', users);

function getData() {
  users.forEach(function(user) {
    $.ajax({
      url: `${baseURL}/streams/${user.name}`,
      dataType: 'jsonp',
      success: function(apiResult) {
          if (!apiResult.stream) {
            return getChannel(user.name);
          }

          getStream(apiResult, user.name);
      },
    })
  });
}

function findUserIndex(username) {
  const currentUserIndex = users.findIndex(function(user) {
    return user.name == username;
  });

  if (currentUserIndex > - 1) {
    return users[currentUserIndex];
  }

  return false;
}

function getStream(apiResult, username) {
  console.log(apiResult);

  if (findUserIndex(username)) {
    const currentUserObj = findUserIndex(username);

    const displayName = apiResult.stream.channel.display_name;
    const game = apiResult.stream.game;
    const status = game + ": " + apiResult.stream.channel.status;
    const logo = apiResult.stream.channel.logo;
    
    currentUserObj["displayName"] = displayName;
    currentUserObj["status"] = status;
    currentUserObj["logo"] = logo;  

    processResult(displayName, status, logo);
  } else {
    console.log('User not found in users array. getStream function.');
  }

}

function getChannel(username) {
  $.ajax({
    url: `${baseURL}/channels/${username}`,
    dataType: 'jsonp',
    success: function(apiResult) {

      if (findUserIndex(username)) {
        const currentUserObj = findUserIndex(username);
  
        const displayName = apiResult.display_name;
        const status = "Offline";
        const logo = apiResult.logo;

        currentUserObj["displayName"] = displayName;
        currentUserObj["status"] = status;
        currentUserObj["logo"] = logo; 

        processResult(displayName, status, logo);
      } else {
        console.log('User not found in users array. getChannel function.');
      }
    }
  })
}

function processResult(displayName, status, logo) {
  console.log('Display name ', displayName);
  console.log('Status ', status);
  console.log('Logo link ', logo);

  const $users = $(".users");

  let html = '<div class="user">';
  html += `<div class="user-icon"><img src=${logo} alt="User Logo"></div>`;
  html += `<div class="user-name"><a href="https://twitch.tv/${displayName}" target="_blank">${displayName}</a></div>`;
  html += `<div class="user-info">${status}</div></div>`;

  $users.append(html);

}

function filterUsers(array, condition, userInput) {
  let filteredArray = [];

  if (userInput !== undefined) {
    if (!userInput) {
      return array;
    }
    userInput = userInput.toLowerCase();
    filteredArray = array.filter(function(user) {
      let name = (user.name).toLowerCase();
      name = name.substr(0, userInput.length);
      return userInput == name;
    });
  } else if (condition === "all") {
    filteredArray = users;
  } else if (condition === "online") {
      filteredArray = array.filter(function(user) {
        return user["status"] !== "Offline"
      });
  } else if (condition === "offline") {
    filteredArray = array.filter(function(user) {
      return user["status"] === "Offline";
    });
  } else {
    console.log('None of the filter conditions happened');
  }

  return filteredArray;
  
}

function displayUsers(array) {
  // Go through array of objects and make for each appropriate HTML representation.
  // Users container
  const $users = $(".users");
  let content = '';

  if (array.length == 0) {
    content += '<div class="no-results">No results</div>';
  } else {
    array.forEach(function(user) {
      content += `<div class="user">`;
      content += `<div class="user-icon"><img src=${user["logo"]} alt="User Logo"></div>`;
      content += `<div class="user-name"><a href="https://twitch.tv/${user["displayName"]}" target="_blank">${user["displayName"]}</a></div>`;
      content += `<div class="user-info">${user["status"]}</div></div>`;
    });
  }

  $users.html(content);
}

// In case I put this project on codepen I am using document.ready.
$(document).ready(function() {
  getData();

  let filteredArray = users;

  $(".button").click(function() {
    $(this).siblings().removeClass("activated");
    $(this).addClass("activated");
    const id = $(this).attr("id");
    const inputValue = $("#search-input").val();
    filteredArray = filterUsers(users, id);
    let filteredUsers = filteredArray;

    if (inputValue) {
      filteredUsers = filterUsers(filteredUsers, null, inputValue);
      console.log('filteredUsers after filter', filteredUsers);
    }

    displayUsers(filteredUsers);
    $("#search-input").blur();

  });

  $("#search-input").keyup(function() {
    const inputValue = this.value;
    const filteredUsers = filterUsers(filteredArray, null, inputValue);

    displayUsers(filteredUsers);
  });

});



