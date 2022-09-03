const animeList = [];
const RENDER_EVENT = "render-anime-list";
const SAVED_EVENT = "saved-anime";
const STORAGE_KEY = "anime-list_apps";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Local Storage is not supported in your browser!");
    return false;
  }
  return true;
}

function generateId() {
  return +new Date();
}

function generateAnimeObject(
  id,
  title,
  author,
  date,
  rating,
  synopsis,
  isFinished,
  visible
) {
  return {
    id,
    title,
    author,
    date,
    rating,
    synopsis,
    isFinished,
    visible,
  };
}

function makeAnimeList(animeItem) {
  const { id, title, author, date, rating, synopsis, isFinished, visible } =
    animeItem;

  const textTitle = document.createElement("h5");
  textTitle.innerText = title;
  textTitle.setAttribute("id", "anime-title");
  textTitle.classList.add("card-title");

  const textAuthor = document.createElement("span");
  textAuthor.innerText = author;
  textAuthor.setAttribute("id", "anime-author");

  const textDate = document.createElement("span");
  textDate.innerText = date;
  textDate.setAttribute("id", "anime-year");

  const textRating = document.createElement("span");
  textRating.innerHTML = "&#9733;" + rating;
  textRating.setAttribute("id", "anime-rating");
  textRating.classList.add("text-warning");

  const spanContainer = document.createElement("h6");
  spanContainer.append(textAuthor, textDate, textRating);
  spanContainer.classList.add("card-subtitle", "mb-2", "text-muted");
  spanContainer.setAttribute("id", "anime-detail");

  const firstButton = document.createElement("button");
  const secondButton = document.createElement("button");
  if (isFinished == "unwatched") {
    firstButton.classList.add("btn", "btn-secondary");
    firstButton.innerText = "Move to Watched";
    firstButton.addEventListener("click", function () {
      addToWatched(id);
    });

    secondButton.classList.add("btn", "btn-warning");
    secondButton.innerText = "Delete List";
    secondButton.addEventListener("click", function () {
      let confirmUser = confirm("Are you sure to delete this list?");
      if (confirmUser === true) removeList(id);
    });
  } else if (isFinished == "watched") {
    firstButton.classList.add("btn", "btn-secondary");
    firstButton.innerText = "Move to Unwatched";
    firstButton.addEventListener("click", function () {
      addToUnwatched(id);
    });

    secondButton.classList.add("btn", "btn-warning");
    secondButton.innerText = "Delete List";
    secondButton.addEventListener("click", function () {
      let confirmUser = confirm("Are you sure to delete this list?");
      if (confirmUser === true) removeList(id);
    });
  }

  const buttonContainer = document.createElement("div");
  buttonContainer.setAttribute("id", "action-button");
  buttonContainer.append(firstButton, secondButton);

  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  if (synopsis !== "") {
    const textSynopsis = document.createElement("p");
    textSynopsis.innerText = synopsis;
    cardBody.append(textTitle, spanContainer, textSynopsis, buttonContainer);
  } else {
    cardBody.append(textTitle, spanContainer, buttonContainer);
  }

  const card = document.createElement("div");
  card.classList.add("card");
  card.setAttribute("id", `anime-${id}`);
  card.append(cardBody);

  if (visible === false) {
    card.style.display = "none";
  }

  return card;
}

function addAnime() {
  const animeTitle = document.getElementById("inputTitle").value;
  const animeReleaseDate = document.getElementById("inputReleaseDate").value;
  const animeAuthor = document.getElementById("inputAuthor").value;
  const animeRating = document.getElementById("inputRating").value;
  const animeSynopsis = document.getElementById("inputSynopsis").value;

  let radios = document.getElementsByName("inlineRadioOptions");
  let isFinished;
  for (var i = 0, length = radios.length; i < length; i++) {
    if (radios[i].checked) {
      isFinished = radios[i].value;
      break;
    }
  }

  const generatedID = generateId();
  const animeObject = generateAnimeObject(
    generatedID,
    animeTitle,
    animeAuthor,
    parseInt(animeReleaseDate),
    parseFloat(animeRating),
    animeSynopsis,
    isFinished
  );
  animeList.push(animeObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findAnime(animeID) {
  for (const animeItem of animeList) {
    if (animeItem.id === animeID) {
      return animeItem;
    }
  }
  return null;
}

function addToWatched(animeID) {
  const animeTarget = findAnime(animeID);
  if (animeTarget == null) return;

  animeTarget.isFinished = "watched";
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addToUnwatched(animeID) {
  const animeTarget = findAnime(animeID);
  if (animeTarget == null) return;

  animeTarget.isFinished = "unwatched";
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findAnimeIndex(animeID) {
  for (const index in animeList) {
    if (animeList[index].id === animeID) {
      return index;
    }
  }
  return -1;
}

function removeList(animeID) {
  const animeTargetIndex = findAnimeIndex(animeID);
  if (animeTargetIndex === -1) return;
  animeList.splice(animeTargetIndex, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function searchAnime() {
  const titleWanted = document.getElementById("searchTitle").value;
  const filterTitle = titleWanted.toUpperCase();

  if (titleWanted === "") {
    for (const animeItem of animeList) {
      animeItem.visible = true;
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
  } else {
    for (const animeItem of animeList) {
      const matchingTitle = animeItem.title.toUpperCase();
      let i = 0;
      let handler = 0;
      for (i = 0; i < filterTitle.length; i++) {
        if (filterTitle[i] === matchingTitle[i]) {
          handler++;
        }
      }

      if (handler === i) {
        animeItem.visible = true;
      } else {
        animeItem.visible = false;
      }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
  }
  saveData();
}

function loadDataFromStorage() {
  const stringData = localStorage.getItem(STORAGE_KEY);
  let objData = JSON.parse(stringData);

  if (objData !== null) {
    for (const anime of objData) {
      animeList.push(anime);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(animeList);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addAnime();
  });

  const submitSearch = document.getElementById("search-addon");
  submitSearch.addEventListener("click", function (event) {
    event.preventDefault();
    searchAnime();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const listWatched = document.getElementById("WatchedList");
  const listUnwatched = document.getElementById("UnwatchedList");

  listWatched.innerHTML = "";
  listUnwatched.innerHTML = "";

  for (animeItem of animeList) {
    const animeElement = makeAnimeList(animeItem);
    if (animeItem.isFinished === "watched") {
      listWatched.append(animeElement);
    } else {
      listUnwatched.append(animeElement);
    }
  }
});
