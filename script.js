// Elements from the HTML document
const loader = document.getElementById("loader");
const profileImage = document.getElementById("profileImage");
const usernameElement = document.getElementById("username");
const userBioElement = document.getElementById("userBio");
const userLocationElement = document.getElementById("userLocation");
const repoList = document.getElementById("repoList");
const paginationButtons = document.getElementById("paginationButtons");

let currentPage = 1;
const reposPerPage = 10;

// Function to fetch and display user repositories
function fetchRepositories() {
  const usernameInput = document.getElementById("usernameInput");
  const username = usernameInput.value.trim();

  if (!username) {
    alert("Please enter a valid username.");
    return;
  }

  loader.style.display = "block";
  repoList.innerHTML = "";
  paginationButtons.innerHTML = "";

  fetch(`https://api.github.com/users/${username}/repos`)
    .then((response) =>
      response.ok
        ? response.json()
        : Promise.reject("Failed to fetch repositories.")
    )
    .then((data) => renderRepositories(data))
    .catch((error) => alert(`Error: ${error}`))
    .finally(() => (loader.style.display = "none"));
}

// Function to render user repositories
function renderRepositories(repositories) {
  const user = repositories.length > 0 ? repositories[0].owner : null;
  updateProfileInfo(user);

  const startIndex = (currentPage - 1) * reposPerPage;
  const endIndex = startIndex + reposPerPage;
  const currentRepos = repositories.slice(startIndex, endIndex);

  currentRepos.forEach((repo) => {
    fetch(`https://api.github.com/repos/${repo.full_name}/languages`)
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject("Failed to fetch languages.")
      )
      .then((languages) => renderRepoItem(repo, languages))
      .catch((error) => console.error(`Failed to fetch languages: ${error}`));
  });

  renderPagination(repositories.length);
}

// Function to render a single repository item
function renderRepoItem(repo, languages) {
  const repoItem = document.createElement("div");
  repoItem.className = "repo-item";
  repoItem.innerHTML = `
    <h3>${repo.name}</h3>
    <p>${repo.description || "No description available"}</p>
    <div class="tech-stack">${renderTechStack(languages)}</div>
  `;
  repoList.appendChild(repoItem);
}

// Function to render the tech stack for a repository
function renderTechStack(languages) {
  return languages && Object.keys(languages).length > 0
    ? Object.keys(languages)
        .map((lang) => `<span class="tech">${lang}</span>`)
        .join("")
    : "Not specified";
}

// Function to update user profile information
function updateProfileInfo(user) {
  if (user) {
    profileImage.src = user.avatar_url;
    usernameElement.textContent = user.login;
    userBioElement.textContent = user.bio || "No bio available";
    userLocationElement.textContent = user.location || "No location available";
  } else {
    profileImage.src = "";
    usernameElement.textContent = "User not found";
    userBioElement.textContent = userLocationElement.textContent = "";
  }
}

// Function to render pagination buttons
function renderPagination(totalRepos) {
  const totalPages = Math.ceil(totalRepos / reposPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.onclick = () => {
      currentPage = i;
      fetchRepositories();
    };
    paginationButtons.appendChild(button);
  }
}

// Initial fetch to show some default repositories
fetchRepositories();
