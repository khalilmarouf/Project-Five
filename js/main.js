// Alert Div Handle

window.addEventListener("DOMContentLoaded", () => {
    
    getAllPosts(true);
    token = localStorage.getItem("token");
    user = JSON.parse(localStorage.getItem("user"));
    if (token !== null && user !== null) {
        isLogged = true;
    }
    preparePage();
    document.querySelectorAll(".nav-bar-pages-nav li a").forEach((li) => {
        li.classList.remove("active");
    });
    document.querySelector(".nav-bar-pages-home").classList.add("active");
});

let posted = false;
function preperPostCommentsBtn() {
    let allBtns = document.querySelectorAll(".post-comment");
    allBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            let btnParent = e.currentTarget.parentElement;
            let postCard =
                e.currentTarget.parentElement.parentElement.parentElement
                    .parentElement;
            // commentsContainer pt-2
            let postID = postCard.dataset.postid;
            let commentToPost = btnParent.querySelector("#cmntToPost").value;
            if (posted === false) {
                post(postID, commentToPost)
                    .then(() => {
                        let commentsSection =
                            postCard.querySelector(".commentsContainer");
                        getPostComments(commentsSection, postID);
                        appendAlert(
                            "New Comment Added Successfully",
                            "success"
                        );
                        commentToPost = "";
                        btnParent.querySelector("#cmntToPost").value = "";
                    })
                    .catch((error) => {
                        if (error.response.data.message == "Unauthenticated.")
                            appendAlert(
                                "You Have To Login To Make This Action",
                                "danger"
                            );
                        else appendAlert(error.response.data.message, "danger");
                    });
            } else {
                appendAlert(
                    "Please Wait Until The Last Comment Posted",
                    "warning"
                );
            }
        });
    });
}

document.querySelector(".createNewPost").addEventListener("click", () => {
    createPost();
});

let executed = false;
window.addEventListener("scroll", () => {
    let isEnd =
        Number(window.pageYOffset + window.innerHeight * 2) >=
        Number(document.documentElement.scrollHeight);
    if (isEnd) {
        if (currentPage <= lastPage && executed === false) {
            currentPage++;
            getAllPosts();
            executed = true;
            setTimeout(() => {
                executed = false;
            }, 2000);
        }
    }
});

// to do
// make the images with background for broken images >> check
// or hide them somehow

// add require star in modals
// fix css UI
// append new posts automatic when someone add one

// fix comment count problem in main page when you add new comment into a post refresh comments count
