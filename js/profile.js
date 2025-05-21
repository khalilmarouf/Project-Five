window.addEventListener("DOMContentLoaded", () => {
    // getAllPosts(true);
    token = localStorage.getItem("token");
    user = JSON.parse(localStorage.getItem("user"));
    if (token !== null && user !== null) {
        isLogged = true;
    }
    let urlParams = new URLSearchParams(window.location.search);
    let userID
    if(user != null)
        userID = urlParams.get("userid") || user.id;
    preparePage();
    
    getUserData(userID);
    getUserPosts(userID);
    if(user != null) {
        if(userID === user.id) {
            document.querySelectorAll(".nav-bar-pages-nav li a").forEach(li => {
                li.classList.remove("active");
            })
            document.querySelector(".nav-bar-pages-profile").classList.add("active");
        }
    }
});

function getUserData(userID) {
    document.querySelector(".loadering").classList.add("active");
    axios.get(`${baseURl}/users/${userID}`).then((res) => {
        buildHeaderPage(res.data.data);
    }).catch((error) => {
        appendAlert(error.response.data.message, "danger");
    })
    .finally (() => {
    })
}

function buildHeaderPage(userData) {
    userImg = "";
    if(typeof userData.profile_image != 'string') {
        userImg = "./images/unknown-user.png"
    } else {
        userImg = userData.profile_image;
    }

    let headerContent = `
            <div
                class="row m-auto container mt-5 bg-white rounded shadow-sm pt-5 pb-5 ms "
            >
                <div class="col-md-3 d-flex flex-column justify-content-center">
                    <div class="img-cont d-flex flex-column justify-content-center">
                        <img
                            src="${userImg}"
                            class="img-fluid"
                            alt=""
                        />
                    </div>
                </div>
                <!-- <div class="col-1"></div> -->
                <div class="col-sm-12 col-md-5">
                    <div
                        class="row d-flex flex-sm-row flex-md-column justify-content-around h-100 user-info w-100"
                    >
                        <div class="col-6 col-md-12 fs-5 py-4 px-0">
                            Username:
                            <span class="fw-normal fw-bold text-primary fs-6 ms-3 "
                                >${userData.username}</span
                            >
                        </div>
                        <div class="col-6 col-md-12 fs-5 py-4 px-0">
                            Name:
                            <span class="fw-normal fs-6 fw-bold text-primary ms-3 "
                                >${userData.name}</span
                            >
                        </div>
                    </div>
                </div>
                <div class="col-sm-12 col-md-4">
                    <div
                        class="row d-flex flex-row flex-md-column justify-content-evenly user-last-data w-100 h-100"
                    >
                        <div class="col-sm-6 col-md-12" style="font-size: 50px; font-weight: 100;">
                            ${userData.posts_count}
                            <span class="fw-normal text-black-50 fs-6" style="font-weight: 100; margin-left: -10px;"
                                >Posts</span
                            >
                        </div>
                        <div class="col-sm-6  col-md-12" style="font-size: 50px; font-weight: 100;">
                            ${userData.comments_count}
                            <span class="fw-normal text-black-50 fs-6" style="font-weight: 100; margin-left: -10px;"
                                >Comments</span
                            >
                        </div>
                    </div>
                </div>
            </div>
    `;
    document.querySelector("#user-info-content").innerHTML = headerContent;
}


function getUserPosts(userID) {
    document.querySelector(".loadering").classList.add("active");
    axios.get(`${baseURl}/users/${userID}/posts`)
        .then((res) => {
            printAllPosts(true, res.data.data, userID)
        })
        .catch((error) => {
            appendAlert(error.response.data.message, "danger");
        })
        .finally(() => {
            document.querySelector(".loadering").classList.remove("active");
        })
}