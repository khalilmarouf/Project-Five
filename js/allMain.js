// Global Rules
const baseURl = "https://tarmeezacademy.com/api/v1";
let isLogged = false;
let token = null;
let user = null;
let currentPage = 1;
let lastPage = null;
let tempVarForLoader = null;

function loaderIn(here, show) {
    if (show) {
        tempVarForLoader = here.innerHTML;
        here.innerHTML = `<div class="loader"></div>`;
    } else {
        here.innerHTML = tempVarForLoader;
    }
}

function login(userNma, pass) {
    let params = {
        username: `${userNma}`,
        password: `${pass}`,
    };

    document.querySelector("#login-btn").classList.add("button--loading");
    // btn.classList.remove("button--loading");
    axios
        .post(`${baseURl}/login`, params)
        .then((res) => {
            token = res.data.token;
            user = res.data.user;
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            isLogged = true;
            appendAlert("Your Logged in Successfully", "success");
            hideModal("LoginModal");
            preparePage();
        })
        .catch((error) => {
            appendAlert(error.response.data.message, "danger");
        })
        .finally(() => {
            document
                .querySelector("#login-btn")
                .classList.remove("button--loading");
        });
}
function register(name, username, password, photo) {
    let formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("image", photo);

    document.querySelector("#register-btn-go").classList.add("button--loading");

    axios
        .post(`${baseURl}/register`, formData)
        .then((res) => {
            token = res.data.token;
            user = res.data.user;
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            isLogged = true;
            appendAlert("Your Registered Successfully", "success");
            hideModal("register-modal");
            preparePage();
        })
        .catch((error) => {
            appendAlert(error.response.data.message, "danger");
        })
        .finally(() => {
            document
                .querySelector("#register-btn-go")
                .classList.remove("button--loading");
        });
}
document.querySelector("#logout-btn-yes").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    user = null;
    token = null;
    isLogged = false;
    appendAlert("You Are Logged Out Successfully", "success");
    preparePage();
    hideModal("logout-modal");
});
document.querySelector("#register-btn-go").addEventListener("click", () => {
    let name = document.querySelector("#register-recipient-name").value;
    let username = document.querySelector("#register-username").value;
    let password = document.querySelector("#register-password-text").value;
    let profilePhoto = document.querySelector("#register-profile-photo")
        .files[0];
    register(name, username, password, profilePhoto);
});
document.querySelector("#login-btn").addEventListener("click", (e) => {
    let username = document.querySelector(
        `#LoginModal .modal-body input[type="email"]`
    ).value;
    let password = document.querySelector(
        `#LoginModal .modal-body input[type="password"]`
    ).value;
    login(username, password);
});
function hideModal(modalID) {
    const loginModal = document.querySelector(`#${modalID}`);
    const myModal = bootstrap.Modal.getInstance(loginModal);
    myModal.hide();
}
function setupUserNameAndPhoto() {
    document
        .querySelector(".username-text")
        .setAttribute("style", "display: inline-flex !important");
    let usernameSpan = document.createElement("span");
    let spanTxt = document.createTextNode(user.username);
    usernameSpan.appendChild(spanTxt);
    let profilePhoto = document.createElement("img");
    profilePhoto.className = "profile-img-photo";
    profilePhoto.src =
        typeof user.profile_image == "string"
            ? user.profile_image
            : "./images/unknown-user.png";

    usernameSpan.appendChild(profilePhoto);
    document.querySelector(".username-text").innerHTML = "";
    document.querySelector(".username-text").appendChild(usernameSpan);
}
const appendAlert = (message, type) => {
    // Create Alert Div
    const placeholder = document.createElement("div");
    let randomId = Math.trunc(Math.random() * 1000);
    placeholder.className = `alert-div-${randomId} fade show`;
    placeholder.id = "liveAlertPlaceholder";
    document.querySelector(".alert-container").appendChild(placeholder);

    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        "</div>",
    ].join("");

    placeholder.append(wrapper);

    setTimeout(() => {
        new bootstrap.Alert(`.alert-div-${randomId}`).close();
    }, 5000);
};
function preparePage() {
    let login_btn = document.querySelector("button#plogin-btn");
    let register_btn = document.querySelector("button#pregister-btn");
    let logout_btn = document.querySelector("button#plogout-btn");
    let newPost = document.querySelector(".createNewPost");
    if (isLogged) {
        login_btn.setAttribute("style", "display:none !important");
        register_btn.setAttribute("style", "display:none !important");
        logout_btn.setAttribute("style", "display:inline !important");
        if (newPost !== null)
            newPost.setAttribute("style", "display:flex !important");
        // create username span
        setupUserNameAndPhoto();
    } else {
        if (newPost !== null)
            newPost.setAttribute("style", "display:none !important");
        login_btn.setAttribute("style", "display:inline !important");
        register_btn.setAttribute("style", "display:inline !important");
        logout_btn.setAttribute("style", "display:none !important");
        document
            .querySelector(".username-text")
            .setAttribute("style", "display: none !important");
        document.querySelector(".username-text").innerHTML = "";
    }
}
function post(postID, comment) {
    return new Promise((resolve, reject) => {

        let params = {
            body: comment,
        };
        axios
            .post(`${baseURl}/posts/${postID}/comments`, params, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                resolve();
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function editPostWith(pID, userID = null) {
    let postObj = JSON.parse(decodeURIComponent(pID));
    showCreatePostModal(postObj, true, userID);
}

function createPost() {
    showCreatePostModal(null, false);
}
function showCreatePostModal(postObj = null, edit = false, userID) {
    const editModalComponent = document.getElementById("createNewPostModal");
    const myModal = new bootstrap.Modal(editModalComponent, {});
    if (edit) {
        let header = editModalComponent.querySelector(".modal-title");
        header.innerHTML = "Edit Your Post<span></span>";

        let title = editModalComponent.querySelector("#post-title");
        title.value = postObj.title;

        let body = editModalComponent.querySelector("#post-body");
        body.value = postObj.body;

        let image = editModalComponent.querySelector("#post-image");

        if (typeof postObj.image == "string") {
            const file = new File([postObj.image], postObj.image, {
                type: "image",
            });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            image.files = dataTransfer.files;
        }
    } else {
        let header = editModalComponent.querySelector(".modal-title");
        header.innerHTML = "Create a New Post";

        let title = editModalComponent.querySelector("#post-title");
        title.value = "";

        let body = editModalComponent.querySelector("#post-body");
        body.value = "";
    }

    const createPostBtn = document.querySelector("#create-post-go");

    createPostBtn.onclick = async function () {
        
            await makePutReq(postObj, edit);
            if (userID == null) getAllPosts(true);
            else getAllPosts(true, userID);

            
    };
    myModal.show();
}

function makePutReq(postObj, edit = false) {
    let title = document.querySelector("#post-title").value;
    let body = document.querySelector("#post-body").value;
    let image = document.querySelector("#post-image").files[0];

    if (!edit) {
        let dataFiles = new FormData();
        dataFiles.append("title", title);
        dataFiles.append("body", body);
        image != "undefined" && image != null
            ? dataFiles.append("image", image)
            : "";
        return new Promise((resolve, reject) => {
            document
                .querySelector("#create-post-go")
                .classList.add("button--loading");
            axios
                .post(`${baseURl}/posts`, dataFiles, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((res) => {
                    hideModal("createNewPostModal");
                    appendAlert("New Post Added Successfully", "success");
                    resolve();
                })
                .catch((error) => {
                    appendAlert(error.response.data.message, "danger");
                })
                .finally(() => {
                    document
                        .querySelector("#create-post-go")
                        .classList.remove("button--loading");
                    
                });
        });
    } else {
        let formData = new FormData();
        formData.append("title", title);
        formData.append("body", body);
        if (typeof image == "string") formData.append("image", image);
        formData.append("_method", "put");
        return new Promise((resolve, reject) => {
            document
                .querySelector("#create-post-go")
                .classList.add("button--loading");
            axios
                .post(`${baseURl}/posts/${postObj.id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((res) => {
                    hideModal("createNewPostModal");
                    appendAlert("New Post Added Successfully", "success");
                    resolve();
                })
                .catch((error) => {
                    appendAlert(error.response.data.message, "danger");
                })
                .finally(() => {
                    document
                        .querySelector("#create-post-go")
                        .classList.remove("button--loading");
                
                });
        });
    }
}

function deletePost(postObj, userID = null) {
    let post = JSON.parse(decodeURIComponent(postObj));
    showDeleteModal(post, userID);
}

function showDeleteModal(post, userID) {
    const editModalComponent = document.getElementById("delete-post-modal");
    const myModal = new bootstrap.Modal(editModalComponent, {});
    myModal.show();
    document.querySelector("#delete-post-btn-yes").onclick = async function () {
        await deleteThis(post);
        if (userID == null) getAllPosts(true);
        else getAllPosts(true, userID);
    };
}

function deleteThis(post) {
    return new Promise((resolve, reject) => {
 
            document
                .querySelector("#delete-post-btn-yes")
                .classList.add("button--loading");
            axios
                .delete(`${baseURl}/posts/${post.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((res) => {
                    hideModal("delete-post-modal");
                    appendAlert("Post Deleted Successfully", "success");
                    resolve();
                })
                .catch((error) => {
                    appendAlert(
                        error.response.data.message + ", You Can Not Do This Action.",
                        "danger"
                    );
                })
                .finally(() => {
                    document
                        .querySelector("#delete-post-btn-yes")
                        .classList.remove("button--loading");
                });

    });
}

function printAllPosts(firstLoad, posts, userID = null) {
    
    let cardsContainer = document.querySelector(".cards-container");
    if (firstLoad) cardsContainer.innerHTML = "";

    for (let post of posts) {
        let spansTag = "";
        for (tag of post.tags) {
            spansTag += `<span class="rounded-pill">${tag.name}</span>
            `;
        }

        let tempImagesSrc = typeof post.image == "string" ? post.image : "";
        let imgTagFinal = "";
        if (tempImagesSrc !== "") {
            imgTagFinal = `<img src="${tempImagesSrc.toString()}" class="img-fluid mb-3 rounded"  />`;
        }

        // Edit Post div
        let editPostDiv = ``;
        if (user != null) {
            if (post.author.id === user.id) {
                editPostDiv = `
                <div id="deletePostBtnMine" onClick="deletePost('${encodeURIComponent(
                    JSON.stringify(post)
                )}', ${
                    userID == null ? null : userID
                } )" class="bg-white shadow-sm  ms-2 mt-1  rounded-circle" style="width: 30px; height: 30px; float: right; display: inline-flex; justify-content: center; align-items: center; cursor: pointer">
                    <span>
                        <svg style="color: var(--bs-danger);" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                        </svg>
                    </span>
                </div>
                <div id="editPostBtnMine" onClick="editPostWith('${encodeURIComponent(
                    JSON.stringify(post)
                )}', ${
                    userID == null ? null : userID
                } )" class="bg-white shadow-sm  mt-1  rounded-circle" style="width: 30px; height: 30px; float: right; display: inline-flex; justify-content: center; align-items: center; cursor: pointer">
                    <span>
                        <svg style="color: var(--bs-primary);" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                        </svg>
                    </span>
                    
                </div>                
            `;
            }
        }

        let tempPost = `
            <div class="card shadow-sm mb-4" data-postid="${post.id}">
                <div class="card-header">
                    <img
                        src="${
                            typeof post.author.profile_image == "string"
                                ? post.author.profile_image
                                : "./images/unknown-user.png"
                        }"
                        class="me-2 img-fluid rounded-circle"
                    />
                    <span class="fw-medium" onclick="goToUserProfile(${
                        post.author.id
                    })" style="cursor:pointer">${
            post.author.username || ""
        }</span>
                    ${editPostDiv}
                </div>
                <div class="card-body" >
                    <div class="img-container d-flex justify-content-center">
                        ${imgTagFinal}
                    </div>
                    <span class="text-black-50 fs-6 mb-2 d-block"
                        >${post.created_at || ""}</span
                    >
                    <h5 class="card-title fs-3">${post.title || ""}</h5>
                    <p class="card-text">${post.body || ""}</p>
                    <hr />
                    <div class="card-foot">
                        <div class="left">
                            <svg class="me-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                                <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
                            </svg>
                            <span>(${post.comments_count ?? 0}) Comments</span>
                        </div>
                        <div class="tags"> 
                                ${spansTag || ""}
                        </div>
                    </div>
                    <div class="comment-section"> 
                        <div class="commentsContainer pt-2">
                        </div>
                        <div class="writeComment d-flex mt-3">
                            <input id="cmntToPost" style="z-index: 88" class="border" type="text" placeholder="Write a Comment...">
                            <div class="post-comment d-flex justify-content-center align-items-center bg-primary p-2 ms-3 rounded-circle" style="width: 30px ; height: 30px">
                                <svg style="color: white; width: 14px; height: 14px" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-send-fill" viewBox="0 0 16 16">
                                    <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        `;
        cardsContainer.innerHTML += tempPost;
    }
    if (userID != null) {
        prepareComments();
        prepareCardBody();
    }
}

function prepareCardBody() {
    let bodies = document.querySelectorAll(
        ".posts .container .card .card-body"
    );
    bodies.forEach((cardBody) => {
        cardBody.addEventListener("click", (e) => {
            if (cardBody === e.target.parentElement) {
                let postID = cardBody.parentElement.dataset.postid;
                window.location.href = `./post.html?postid=${postID}`;
            }
        });
    });
}
function getAllPosts(firstLoad = false, userID = null) {
    document.querySelector(".loadering").classList.add("active");
    if (userID == null) {
        axios
            .get(`${baseURl}/posts/?page=${currentPage}`)
            .then((response) => {
                // handle success
                currentPage = response.data.meta.current_page;
                lastPage = response.data.meta.last_page;
                printAllPosts(firstLoad, response.data.data);
                prepareCardBody();
                prepareComments();
                preperPostCommentsBtn();
            })
            .catch((error) => {
                // console.log(error);
                // handle error
                appendAlert("Error While Getting Posts, Try Later.", "warning");
            })
            .finally(() => {
                document.querySelector(".loadering").classList.remove("active");
            })
    } else {
        axios.get(`${baseURl}/users/${userID}/posts`).then((res) => {
            printAllPosts(true, res.data.data, userID);
        }).catch((error)=> {
            appendAlert(error.response.data.message, "danger");
        }).finally(() => {
            document.querySelector(".loadering").classList.remove("active");
        })
    }
}
function goToUserProfile(id) {
    window.location = `./profile.html?userid=${id}`;
}
function prepareComments() {
    document
        .querySelectorAll(".posts .card .card-foot .left")
        .forEach((commentSection) => {
            commentSection.addEventListener("click", (e) => {
                e.stopPropagation();
                let postID =
                    e.currentTarget.parentElement.parentElement.parentElement
                        .dataset.postid;
                let clickedCard =
                    e.currentTarget.parentElement.parentElement.parentElement;
                let clickedCommentSection =
                    clickedCard.querySelector(".comment-section");

                toggleCommentSection(clickedCommentSection, postID);
            });
        });
}
function toggleCommentSection(section, postID) {
    if (section.classList.contains("active")) {
        section.classList.remove("active");
        section.querySelector(".commentsContainer").innerHTML = "";
    } else {
        section.classList.add("active");
        getPostComments(section.querySelector(".commentsContainer"), postID);
    }
}

function getPostComments(clickedCommentSection, postID) {
    axios.get(`${baseURl}/posts/${postID}`).then((res) => {
        let comments = res.data.data.comments;
        if (comments.length === 0) return;
        clickedCommentSection.innerHTML = "";
        for (let comment of comments) {
            let commentUsername = comment.author.username;
            let commentBody = comment.body;
            let commentProfilePhoto =
                typeof comment.author.profile_image == "string"
                    ? comment.author.profile_image
                    : "./images/unknown-user.png";
            clickedCommentSection.innerHTML += `
                <div class="comment d-flex gap-1 ms-3 pb-2 pt-2 " style="${
                    comment !== comments[comments.length - 1]
                        ? "border-bottom: 1px solid #eee"
                        : ""
                }">
                    <div>   
                        <img src="${commentProfilePhoto}" style="width: 40px; height: 40px; margin-right: 10px">
                    </div>
                    <div>   
                        <div class="mb-1 fw-bold">${commentUsername}</div>
                        <div style="line-height: 1">${commentBody}</div>
                    </div>
                </div>
            `;
        }
    });
}
