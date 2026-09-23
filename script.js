const API_URL = "http://localhost:3000/api";

let selectedImage = null;


/* ==========================================
   ELEMENTS
========================================== */

const photoInput =
    document.getElementById("photoInput");

const imagePreview =
    document.getElementById("imagePreview");

const previewContainer =
    document.getElementById("previewContainer");

const photoCaption =
    document.getElementById("photoCaption");

const postPhotoButton =
    document.getElementById("postPhotoButton");

const photoGallery =
    document.getElementById("photoGallery");


/* ==========================================
   LOAD PHOTOS
========================================== */

async function loadPhotos() {

    try {

        const response =
            await fetch(`${API_URL}/photos`);

        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message
            );

        }


        renderPhotos(data.photos);

    } catch (error) {

        console.error(error);

        photoGallery.innerHTML = `

            <p style="
                color:#ff6666;
                text-align:center;
                grid-column:1/-1;
            ">

                Unable to connect to the server.

            </p>

        `;

    }

}


/* ==========================================
   SELECT IMAGE
========================================== */

photoInput.addEventListener(
    "change",
    function () {

        const file = this.files[0];


        if (!file) {

            return;

        }


        if (!file.type.startsWith("image/")) {

            alert(
                "Please select an image file."
            );

            return;

        }


        selectedImage = file;


        const imageURL =
            URL.createObjectURL(file);


        imagePreview.src = imageURL;

        previewContainer.classList.add(
            "show"
        );

    }
);


/* ==========================================
   UPLOAD PHOTO
========================================== */

postPhotoButton.addEventListener(
    "click",
    async function () {

        if (!selectedImage) {

            alert(
                "Please choose a photo first."
            );

            return;

        }


        const caption =
            photoCaption.value.trim();


        const formData =
            new FormData();


        formData.append(
            "photo",
            selectedImage
        );


        formData.append(
            "caption",
            caption
        );


        postPhotoButton.disabled = true;

        postPhotoButton.textContent =
            "Uploading...";


        try {

            const response =
                await fetch(
                    `${API_URL}/photos`,
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message
                );

            }


            selectedImage = null;

            photoInput.value = "";

            photoCaption.value = "";

            imagePreview.src = "";

            previewContainer.classList.remove(
                "show"
            );


            await loadPhotos();


            document
                .getElementById("gallery")
                .scrollIntoView({
                    behavior: "smooth"
                });


        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Upload failed."
            );

        } finally {

            postPhotoButton.disabled =
                false;

            postPhotoButton.textContent =
                "Post Photo";

        }

    }
);


/* ==========================================
   RENDER PHOTOS
========================================== */

function renderPhotos(photos) {

    photoGallery.innerHTML = "";


    if (photos.length === 0) {

        photoGallery.innerHTML = `

            <p style="
                color:#777;
                text-align:center;
                grid-column:1/-1;
            ">

                No photos uploaded yet.

            </p>

        `;

        return;

    }


    photos.forEach(function (photo) {

        const photoElement =
            document.createElement(
                "article"
            );


        photoElement.className =
            "photo-post";


        const imageURL =
            `http://localhost:3000${photo.image}`;


        photoElement.innerHTML = `

            <img
                src="${imageURL}"
                alt="Uploaded photo"
                class="photo-post-image"
            >


            <div class="photo-post-content">

                <div class="photo-caption">

                    ${
                        escapeHTML(
                            photo.caption ||
                            "No caption added."
                        )
                    }

                </div>


                <div class="post-actions">

                    <button
                        class="like-button"
                        onclick="likePhoto(${photo.id})"
                    >

                        ♥ ${photo.likes}

                    </button>


                    <button
                        class="delete-button"
                        onclick="deletePhoto(${photo.id})"
                    >

                        Delete

                    </button>

                </div>


                <div class="comments-section">

                    <div class="comments-title">

                        Comments
                        (${photo.comments.length})

                    </div>


                    <div class="comments-list">

                        ${
                            photo.comments.length === 0

                            ?

                            `<p style="
                                color:#666;
                                font-size:13px;
                            ">
                                No comments yet.
                            </p>`

                            :

                            photo.comments.map(
                                function(comment) {

                                    return `

                                        <div class="comment">

                                            <strong>
                                                Guest:
                                            </strong>

                                            ${escapeHTML(
                                                comment.comment
                                            )}

                                        </div>

                                    `;

                                }
                            ).join("")

                        }

                    </div>


                    <div class="comment-form">

                        <input
                            type="text"
                            class="comment-input"
                            id="comment-${photo.id}"
                            placeholder="Write a comment..."
                            maxlength="500"
                        >


                        <button
                            class="comment-button"
                            onclick="addComment(${photo.id})"
                        >

                            Post

                        </button>

                    </div>

                </div>

            </div>

        `;


        photoGallery.appendChild(
            photoElement
        );

    });

}


/* ==========================================
   ADD COMMENT
========================================== */

async function addComment(photoId) {

    const input =
        document.getElementById(
            `comment-${photoId}`
        );


    const comment =
        input.value.trim();


    if (!comment) {

        alert(
            "Please write a comment."
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/photos/${photoId}/comments`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        comment: comment
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message
            );

        }


        input.value = "";

        await loadPhotos();


    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Unable to add comment."
        );

    }

}


/* ==========================================
   LIKE PHOTO
========================================== */

async function likePhoto(photoId) {

    try {

        const response =
            await fetch(
                `${API_URL}/photos/${photoId}/like`,
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message
            );

        }


        await loadPhotos();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to like photo."
        );

    }

}


/* ==========================================
   DELETE PHOTO
========================================== */

async function deletePhoto(photoId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this photo?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/photos/${photoId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message
            );

        }


        await loadPhotos();


    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Unable to delete photo."
        );

    }

}


/* ==========================================
   HTML SECURITY
========================================== */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* ==========================================
   START APPLICATION
========================================== */

loadPhotos();