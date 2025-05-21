let IDPost = null;
window.addEventListener("DOMContentLoaded", () => {
    token = localStorage.getItem("token");
    user = JSON.parse(localStorage.getItem("user"));
    if (token !== null && user !== null) {
        isLogged = true;
    }
    IDPost = getPostId();
    preparePage();
    loadPage(IDPost);
});

let posted = false;
function loadActions() {
    let postComment = document.querySelector(".post-comment");
    postComment.addEventListener("click", (e) => {
        let userTempComment = document.querySelector(
            "input#userTempComment"
        ).value;
        if (posted === false)  {
            document.querySelector(".loadering").classList.add("active");
            post(IDPost,userTempComment).then((res) => {
                preparePage();
                loadPage(IDPost);
            }).catch((error) => {
                if (error.response.data.message == "Unauthenticated.")
                    appendAlert("You Have To Login To Make This Action", "danger");
                else appendAlert(error.response.data.message, "danger");
            }).finally(() => {
                document.querySelector(".loadering").classList.remove("active");
            })
        }
        else
            appendAlert("Please Wait Until The Last Comment Posted", "warning");
    });
}
function getPostId() {
    let searchparams = new URLSearchParams(window.location.search);
    return searchparams.get("postid");
}
function loadPage(postId) {
    document.querySelector(".loadering").classList.add("active");
    axios
        .get(`${baseURl}/posts/${postId}`)
        .then((res) => {
            let postData = res.data.data;
            let comments = loadComments(postData.comments);
            loadPost(postData, comments);
            loadActions();
        })
        .catch((error) => {
            appendAlert("Error While Loading Post", "warning");
        }).finally(() => {
            document.querySelector(".loadering").classList.remove("active");
        })
}

function loadPost(data, comments) {
    let tempImagesSrc = typeof data.image == "string" ? data.image : "";
    let imgTagFinal = "";
    if (tempImagesSrc !== "") {
        imgTagFinal = `<img src="${tempImagesSrc.toString()}" class="img-fluid mb-3 rounded"  />`;
    }

    let content = document.querySelector(".content");

    content.innerHTML = `
    <div class="container mt-4 w-100">
        <div class="post-details m-auto">
            <div class="card shadow-sm mb-4" data-postid="${data.id}">
                <div class="card-header">
                    <img
                        src="${
                            typeof data.author.profile_image == "string"
                                ? data.author.profile_image
                                : "../images/unknown-user.png"
                        }"
                        class="me-2 img-fluid rounded-circle profileImg"
                    />
                    <span class="fw-medium">${data.author.username}</span>
                </div>
                <div class="card-body">
                    <div
                        class="img-container d-flex justify-content-center"
                    >
                        ${imgTagFinal}
                    </div>
                    <span class="text-black-50 fs-6 mb-2 d-block"
                        >${data.created_at}</span
                    >
                    <h5 class="card-title fs-3">
                        ${data.title || ""}
                    </h5>
                    <p class="card-text">
                        ${data.body}
                    </p>
                    <hr />
                    <div class="card-foot">
                        <div class="left">
                            <svg
                                class="me-2"
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                class="bi bi-pen"
                                viewBox="0 0 16 16"
                            >
                                <path
                                    d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"
                                />
                            </svg>
                            <span>(${data.comments_count}) Comments</span>
                        </div>
                        <div class="tags"></div>
                    </div>
                    <div class="comment-section">
                        <div class="commentsContainer pt-2">
                            ${comments}
                            
                        </div>
                        <div class="writeComment d-flex mt-3">
                            <input
                                id="userTempComment"
                                class="border"
                                type="text"
                                placeholder="Write a Comment..."
                            />
                            <div
                                class="post-comment d-flex justify-content-center align-items-center bg-primary p-2 ms-3 rounded-circle"
                                style="width: 30px; height: 30px"
                            >
                                <svg
                                    style="
                                        color: white;
                                        width: 14px;
                                        height: 14px;
                                    "
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    class="bi bi-send-fill"
                                    viewBox="0 0 16 16"
                                >
                                    <path
                                        d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    `;
}

function loadComments(comments) {
    let finalCommentsString = "";
    for (let comment of comments) {
        let commentProfilePhoto =
            typeof comment.author.profile_image == "string"
                ? comment.author.profile_image
                : "../images/unknown-user.png";
        let baseComments = `
            <!-- comment -->
            <div
                class="comment d-flex gap-1 ms-3 pb-3 pt-3" style="border-bottom: 1px solid #eee;"
            >
                <div>
                    <img
                        src="${commentProfilePhoto}"
                        style="
                            width: 40px;
                            height: 40px;
                            margin-right: 10px;
                        "
                    />
                </div>
                <div>
                    <div class="mb-1 fw-bold">
                        ${comment.author.username}
                    </div>
                    <div style="line-height: 1">
                        ${comment.body}
                    </div>
                </div>
            </div>
            <!-- // comment // -->
        `;
        finalCommentsString += baseComments;
    }
    return finalCommentsString;
}

