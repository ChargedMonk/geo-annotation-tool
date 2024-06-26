import { handleAnnotationsUpload, resetAnnotationData, addNewParagraph, deleteParagraph, deselectParagraph, unlinkParagraph } from './load_annotations.js';

function getRandomColor() {
    const randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    const r = randomBetween(0, 255);
    const g = randomBetween(0, 255);
    const b = randomBetween(0, 128);
    const a = 0.3;

    return `rgba(${r}, ${g}, ${b}, ${a})`;
};

function updateDrawArrows(flag) {
    drawArrows = flag;
}

function drawLine(elem1, elem2) {
    if (drawArrows) {
        new LeaderLine(
            elem1,
            elem2,
            {
                size: 1,
                path: 'straight',
                color: '#A0153E',
                startPlug: 'square',
                outlineColor: '#3F72AF',
                startPlugOutline: true,
                outline: true,
                endPlugOutline: true,
                outlineSize: 0.08,
                endPlugSize: 2,
            }
        );
    }
};

const handleBboxHover = (e) => {
    if (e.target.classList.contains("inactivebbox")) {
        e.target.classList.remove("inactivebbox");
        e.target.classList.add("activebbox");
    }
    if (e.target.classList.contains("selectedbbox")) {
        e.target.classList.remove("selectedbbox");
        e.target.classList.add("selectedactivebbox");
    }
    if (e.target.classList.contains("highlightbbox")) {
        e.target.classList.remove("highlightbbox");
        e.target.classList.add("highlightactivebbox");
    }
};

const handleBboxNotHover = (e) => {
    if (e.target.classList.contains("activebbox")) {
        e.target.classList.remove("activebbox");
        e.target.classList.add("inactivebbox");
    }
    if (e.target.classList.contains("selectedactivebbox")) {
        e.target.classList.remove("selectedactivebbox");
        e.target.classList.add("selectedbbox");
    }
    if (e.target.classList.contains("highlightactivebbox")) {
        e.target.classList.remove("highlightactivebbox");
        e.target.classList.add("highlightbbox");
    }
};

const handleSelectBbox = (e) => {
    try {
        // Cannot select a bbox again
        if (currentSelectedField !== undefined && currentSelectedField !== null && e.target.tagName === "DIV") {
            console.log("idSet: ", idSet);
            if (idSet.has(e.target.getAttribute("data-bs-title").trim())) {
                console.log("Already selected: ", e.target.getAttribute("data-bs-title").trim());
                alert("Already selected: " + e.target.getAttribute("data-bs-title").trim());
                return;
            }
            if (currentSelectedField.value === "") {
                currentSelectedField.value = e.target.getAttribute("data-bs-title").trim();
            } else {
                currentSelectedField.value = (currentSelectedField.value + ", " + e.target.getAttribute("data-bs-title")).trim();
            }
            idSet.add(e.target.getAttribute("data-bs-title").trim());

            const currBBoxes = JSON.parse(currentSelectedField.getAttribute("bboxes"));
            currBBoxes.push(e.target.getAttribute("bbox"));
            currentSelectedField.setAttribute("bboxes", JSON.stringify(currBBoxes));

            e.target.classList.remove("inactivebbox");
            e.target.classList.remove("activebbox");
            e.target.classList.add("selectedbbox");

            if ("style" in e.target && "backgroundColor" in e.target.style && e.target.style.backgroundColor !== "") {
                currentSelectedField.style.backgroundColor = e.target.style.backgroundColor;
            }

            if (!("style" in currentSelectedField && "backgroundColor" in currentSelectedField.style && currentSelectedField.style.backgroundColor !== "")) {
                const bgColor = getRandomColor();
                currentSelectedField.style.backgroundColor = bgColor;
            }
            e.target.style.backgroundColor = currentSelectedField.style.backgroundColor;

            currentSelectedField.dispatchEvent(new Event('focus'));
        }
    } catch (ex) {
        console.log("Error while selecting: ", ex);
        alert("Error while selecting:\n" + ex);
    }
};

const handleDeselectBbox = (e) => {
    try {
        if (currentSelectedField !== undefined && currentSelectedField !== null) {
            const currBboxes = JSON.parse(currentSelectedField.getAttribute("bboxes"));
            let currBboxIdx = -1;
            for (let idx = 0; idx < currBboxes.length; idx++) {
                if ((JSON.parse(e.target.getAttribute("bbox")).length == JSON.parse(currBboxes[idx]).length) &&
                    (JSON.parse(e.target.getAttribute("bbox"))).every(function (element, index) {
                        return Math.abs(parseInt(element) - parseInt(JSON.parse(currBboxes[idx])[index])) <= 10;
                    })) {
                    currBboxIdx = idx;
                    break;
                }
            }

            if (currBboxIdx > -1) {
                console.log("idSet: ", idSet);
                idSet.delete(e.target.getAttribute("data-bs-title").trim());
                currBboxes.splice(currBboxIdx, 1);
                let currentSelectedFieldValueList = currentSelectedField.value.split(", ");
                currentSelectedFieldValueList.splice(currBboxIdx, 1);
                currentSelectedField.value = currentSelectedFieldValueList.join(", ");
                currentSelectedField.setAttribute("bboxes", JSON.stringify(currBboxes));

                e.target.classList.remove("selectedbbox");
                e.target.classList.add("activebbox");

                if (currentSelectedField.classList.contains("value")) {
                    deselectParagraph(currentSelectedField.parentElement.previousElementSibling.firstElementChild.value.split(", "), e.target.getAttribute("data-bs-title"));
                }

                if ("style" in currentSelectedField && "backgroundColor" in currentSelectedField.style && !(currentSelectedField.style.backgroundColor === "")) {
                    if (currentSelectedField.value === undefined || currentSelectedField.value === null || currentSelectedField.value === "") {
                        currentSelectedField.style.backgroundColor = "";
                    }
                    e.target.style.backgroundColor = "";
                }
            }
            currentSelectedField.dispatchEvent(new Event('focus'));
        }
    } catch (ex) {
        console.log("Error while deselecting: ", ex);
        alert("Error while deselecting:\n" + ex);
    }
    e.preventDefault();
};

const handleDragStart = (e) => {
    e.preventDefault();
    dragCursorStartX = e.clientX - img_container_margin;
    dragCursorStartY = e.clientY - navbarHeight - img_container_margin + document.documentElement.scrollTop;
    isDragging = true;
    dragRect.style.left = dragCursorStartX + "px";
    dragRect.style.top = dragCursorStartY + "px";
};

const handleDragMove = (e) => {
    if (isDragging && e.which === 1) {
        const dragLeft = (e.clientX - img_container_margin < dragCursorStartX) ? e.clientX - img_container_margin : dragCursorStartX;
        const dragTop = ((e.clientY - navbarHeight - img_container_margin + document.documentElement.scrollTop) < dragCursorStartY) ? (e.clientY - navbarHeight - img_container_margin + document.documentElement.scrollTop) : dragCursorStartY;
        const dragWidth = (e.clientX - img_container_margin < dragCursorStartX) ? (dragCursorStartX - (e.clientX - img_container_margin)) : ((e.clientX - img_container_margin) - dragCursorStartX);
        const dragHeight = ((e.clientY - navbarHeight - img_container_margin + document.documentElement.scrollTop) < dragCursorStartY) ? (dragCursorStartY - (e.clientY - navbarHeight - img_container_margin + document.documentElement.scrollTop)) : ((e.clientY - navbarHeight - img_container_margin + document.documentElement.scrollTop) - dragCursorStartY);
        dragRect.style.left = dragLeft + "px";
        dragRect.style.top = dragTop + "px";
        dragRect.style.width = dragWidth + "px";
        dragRect.style.height = dragHeight + "px";

    } else if (isDragging) {
        handleDragEnd(e);
    }
};

const handleDragEnd = (e) => {
    if (isDragging) {
        console.log("e.ctrlKey: ", e.ctrlKey, "\ne ", e);

        if (e.ctrlKey) {
            const bboxes = document.getElementsByClassName("bbox");
            let validBboxes = [];
            Array.from(bboxes).forEach(function (element) {
                const elementLeft = parseInt(element.style.left);
                const elementTop = parseInt(element.style.top);
                const elementRight = elementLeft + parseInt(element.style.width);
                const elementBottom = elementTop + parseInt(element.style.height);
                if (elementLeft >= parseInt(dragRect.style.left) && elementTop >= parseInt(dragRect.style.top)
                    && elementRight <= (parseInt(dragRect.style.left) + parseInt(dragRect.style.width))
                    && elementBottom <= (parseInt(dragRect.style.top) + parseInt(dragRect.style.height))) {
                    validBboxes.push(element);
                }
            });

            // Sorting the bboxes by their positions since we want to go from top-left to bottom right
            validBboxes.sort((a, b) => ((Math.round(parseInt(a.style.top) / 10) * 10) - (Math.round(parseInt(b.style.top) / 10) * 10))
                || (parseInt(a.style.left) - parseInt(b.style.left)));

            console.log("sorted valid bboxes:", validBboxes);

            const imgWidth = img.clientWidth;
            const imgHeight = img.clientHeight;
            const imgNaturalWidth = img.naturalWidth;
            const imgNaturalHeight = img.naturalHeight;
            const ratioX = imgNaturalWidth / imgWidth;
            const ratioY = imgNaturalHeight / imgHeight;

            validBboxes.forEach(function (element) {
                try {
                    if (element !== undefined && element !== null) {
                        handleSelectBbox({ "target": element });
                    }
                } catch (ex) {
                    console.log("Error while selecting bbox for paragraph: ", ex);
                }
            });
        } else {
            const wordbboxes = document.getElementsByClassName("wordbbox");
            let validwordBboxes = [];
            Array.from(wordbboxes).forEach(function (element) {
                const elementLeft = parseFloat(element.style.left);
                const elementTop = parseFloat(element.style.top);
                const elementRight = elementLeft + parseFloat(element.style.width);
                const elementBottom = elementTop + parseFloat(element.style.height);
                if (elementLeft >= parseFloat(dragRect.style.left) && elementTop >= parseFloat(dragRect.style.top)
                    && elementRight <= (parseFloat(dragRect.style.left) + parseFloat(dragRect.style.width))
                    && elementBottom <= (parseFloat(dragRect.style.top) + parseFloat(dragRect.style.height))) {
                    validwordBboxes.push(element);
                }
            });

            // Sorting the bboxes by their positions since we want to go from top-left to bottom right
            validwordBboxes.sort((a, b) => ((Math.round(parseInt(a.style.top) / 10) * 10) - (Math.round(parseInt(b.style.top) / 10) * 10))
                || (parseInt(a.style.left) - parseInt(b.style.left)));

            const imgWidth = img.clientWidth;
            const imgHeight = img.clientHeight;
            const imgNaturalWidth = img.naturalWidth;
            const imgNaturalHeight = img.naturalHeight;
            const ratioX = imgNaturalWidth / imgWidth;
            const ratioY = imgNaturalHeight / imgHeight;
            let minX = null;
            let minY = null;
            let maxX = null;
            let maxY = null;

            const word_ids = []
            let paragraph_content = "";

            validwordBboxes.forEach(function (element) {
                try {
                    if (element !== undefined && element !== null) {
                        const word_id = element.id.replace(/\D/g, '');
                        if (word_id === "" || isNaN(word_id)) {
                            return;
                        }
                        paragraph_content += element.getAttribute("data-bs-title") + " ";
                        console.log("word_id: ", word_id, "word: ", element.getAttribute("data-bs-title"));
                        word_ids.push(parseInt(word_id) - 1);
                        minX = Math.min(minX || parseFloat(element.style.left), parseFloat(element.style.left));
                        minY = Math.min(minY || parseFloat(element.style.top), parseFloat(element.style.top));
                        maxX = Math.max(maxX || parseFloat(element.style.width), parseFloat(element.style.left) + parseFloat(element.style.width));
                        maxY = Math.max(maxY || parseFloat(element.style.height), parseFloat(element.style.top) + parseFloat(element.style.height));
                    }
                } catch (ex) {
                    console.log("Error while calculating minimum bounding rect bbox for paragraph: ", ex);
                }
            });

            if (validwordBboxes.length > 0) {
                const paragraph_bbox = [minX * ratioX, minY * ratioY, maxX * ratioX, maxY * ratioY];

                annotateImgBboxes(document.getElementById("img"),
                    [[paragraph_content.trim(), paragraph_bbox]],
                    false,
                    'rgba(255, 255, 255, 0)');

                addNewParagraph(word_ids, paragraph_bbox);
            }
        }

        isDragging = false;
        dragCursorStartX = 0;
        dragCursorStartY = 0;
        dragRect.style.left = "0px";
        dragRect.style.top = "0px";
        dragRect.style.width = "0px";
        dragRect.style.height = "0px";
    }
};

const handleDefaultDragOver = (e) => {
    e.preventDefault();
}

const handleSelectField = (e) => {
    currentSelectedField = e.target;
    if ((!currentSelectedField.hasAttribute("bboxes"))
        || currentSelectedField.getAttribute("bboxes") === "null"
        || currentSelectedField.getAttribute("bboxes") === ""
        || currentSelectedField.getAttribute("bboxes") === null
        || currentSelectedField.getAttribute("bboxes") === undefined) {
        currentSelectedField.setAttribute("bboxes", JSON.stringify([]));
    }

    Array.from(document.getElementsByClassName("bbox")).forEach(function (element) {
        element.classList.remove("highlightbbox");
    });

    Array.from(document.getElementsByClassName("leader-line")).forEach(function (element) {
        if (element.classList.length === 1) {
            element.remove();
        }
    });

    // console.log('currentSelectedElement: ', currentSelectedField);

    currentSelectedField.value
        .split(", ")
        .filter(ele => ele !== '')
        .forEach(function (element) {
            const bbox = document.getElementById("bbox_" + (parseInt(element) + 1));
            if (bbox === null || bbox === undefined) {
                return;
            }
            bbox?.classList.add("highlightbbox");
            try {
                if (currentSelectedField.classList.contains("key")) {
                    const value_field = currentSelectedField.parentElement.nextElementSibling.firstElementChild;
                    if (value_field !== undefined && value_field !== null && value_field.value !== undefined && value_field.value !== null && value_field.value !== "") {
                        value_field.value
                            .split(", ")
                            .filter(ele => ele !== '')
                            .forEach(function (element) {
                                const value_element = document.getElementById("bbox_" + (parseInt(element) + 1));
                                if (value_element === null || value_element === undefined) {
                                    return;
                                }

                                if (bbox.id === value_element.id) {
                                    console.log("Linked to self: ", bbox.id);
                                    alert(`Link to self [${bbox.id}]?!`);
                                }

                                drawLine(bbox, value_element);
                            });
                    }
                } else {
                    const key_field = currentSelectedField.parentElement.previousElementSibling.firstElementChild;
                    if (key_field !== undefined && key_field !== null && key_field.value !== undefined && key_field.value !== null && key_field.value !== "") {
                        key_field.value
                            .split(", ")
                            .filter(ele => ele !== '')
                            .forEach(function (element) {
                                drawLine(document.getElementById("bbox_" + (parseInt(element) + 1)), bbox);
                            });
                    }
                }
            } catch (ex) {
                console.log("Error while drawing line: ", ex);
            }
        });
};


const handleChangeInStandardKey = (e) => {
    if (e.target.value === undefined || e.target.value === null || (!standardKeyOptions.includes(e.target.value) && e.target.value !== "")) {
        e.target.classList.remove('valid-input');
        e.target.classList.add('invalid-input');
    } else {
        e.target.classList.remove('invalid-input');
        e.target.classList.add('valid-input');
    }
};


const deleteIds = (idsToDelete) => {
    try {
        idsToDelete.forEach(function (element) {
            idSet.delete(element);
        });
    } catch (ex) {
        console.log("Error while deleting ids: ", ex);
    }
}


const changeFocusOnArrowKey = (e) => {
    try {
        if (currentSelectedField !== undefined && currentSelectedField !== null) {
            if (e.code === 'ArrowUp') {
                // up arrow
                let previousField = null;
                if (currentSelectedField.classList.contains("key")) {
                    previousField = currentSelectedField.parentElement.parentElement.previousElementSibling.children[4].firstElementChild;
                } else if (currentSelectedField.classList.contains("value")) {
                    previousField = currentSelectedField.parentElement.parentElement.previousElementSibling.children[5].firstElementChild;
                }
                if (previousField !== null && previousField !== undefined) {
                    previousField.focus();
                }
            }
            else if (e.code === 'ArrowDown') {
                // down arrow
                let nextField = null;
                if (currentSelectedField.classList.contains("key")) {
                    nextField = currentSelectedField.parentElement.parentElement.nextElementSibling.children[4].firstElementChild;
                } else if (currentSelectedField.classList.contains("value")) {
                    nextField = currentSelectedField.parentElement.parentElement.nextElementSibling.children[5].firstElementChild;
                }
                if (nextField !== null && nextField !== undefined) {
                    nextField.focus();
                }
            }
            else if (e.code === 'ArrowLeft') {
                // left arrow
                let previousField = null;
                if (currentSelectedField.classList.contains("value")) {
                    previousField = currentSelectedField.parentElement.previousElementSibling.firstElementChild;
                }
                if (previousField !== null && previousField !== undefined) {
                    previousField.focus();
                }
            }
            else if (e.code === 'ArrowRight') {
                // right arrow
                let nextField = null;
                if (currentSelectedField.classList.contains("key")) {
                    nextField = currentSelectedField.parentElement.nextElementSibling.firstElementChild;
                }
                if (nextField !== null && nextField !== undefined) {
                    nextField.focus();
                }
            }
        }
    } catch (ex) {
        console.log("Error while changing focus on arrow key: ", ex);
    }
}


async function getCoords(img, position) {
    const imgWidth = img.clientWidth;
    const imgHeight = img.clientHeight;
    const imgNaturalWidth = img.naturalWidth;
    const imgNaturalHeight = img.naturalHeight;
    const ratioX = imgWidth / imgNaturalWidth;
    const ratioY = imgHeight / imgNaturalHeight;
    // console.log("ratioX: ", ratioX, "ratioY: ", ratioY, "position: ", position);
    return {
        left: position.minX * ratioX,
        top: position.minY * ratioY,
        width: Math.abs(position.maxX - position.minX) * ratioX,
        height: Math.abs(position.maxY - position.minY) * ratioY,
    };
};

async function annotateImgWordBboxes(imgToBeAnnotated, annotations, activate, activationColor) {
    try {
        await new Promise(r => setTimeout(r, 1));
        for (let idx = 0; idx < annotations.length; idx++) {
            const [minX, minY, maxX, maxY] = annotations[idx][1];
            // console.log("word:", annotations[idx][0]);
            const coords = await getCoords(imgToBeAnnotated, { minX: minX, minY: minY, maxX: maxX, maxY: maxY });
            // console.log("coords:", coords);
            const word_bbox = document.createElement("div");
            word_bbox.id = `word_bbox_${idx + 1}`;

            word_bbox.setAttribute("data-bs-title", `${annotations[idx][0]}`);
            word_bbox.setAttribute("word_bbox", `${JSON.stringify(annotations[idx][1])}`);

            if (activate) {
                word_bbox.classList.add("wordbbox", "selectedwordbbox");
                word_bbox.style.backgroundColor = activationColor;
            } else {
                word_bbox.classList.add("wordbbox", "inactivewordbbox");
                word_bbox.style.backgroundColor = '';
            }
            word_bbox.style.left = coords.left + "px";
            word_bbox.style.top = coords.top + "px";
            word_bbox.style.width = coords.width + "px";
            word_bbox.style.height = coords.height + "px";

            // bbox.addEventListener('click', handleSelectBbox);
            // bbox.addEventListener('contextmenu', handleDeselectBbox);
            // bbox.addEventListener('mouseover', handleBboxHover);
            // bbox.addEventListener('mouseout', handleBboxNotHover);

            img_container.appendChild(word_bbox);
        }

    } catch (ex) {
        console.log("Error while annotating img:\n", "annotations: ", annotations, "activation: ", activate, " ", activationColor, "\n", ex);
        alert("Error while annotating img:\n" + ex);
    }

    img_position = imgToBeAnnotated.getBoundingClientRect();
};

async function annotateImgBboxes(imgToBeAnnotated, annotations, activate, activationColor) {
    try {
        await new Promise(r => setTimeout(r, 1));
        for (let idx = 0; idx < annotations.length; idx++) {
            const [minX, minY, maxX, maxY] = annotations[idx][1];
            // console.log("word:", annotations[idx][0]);
            const coords = await getCoords(imgToBeAnnotated, { minX: minX, minY: minY, maxX: maxX, maxY: maxY });
            // console.log("coords:", coords);
            const bbox = document.createElement("div");
            const relativeMeasurement = ((Math.max(coords.width, coords.height) / 2500) + (Math.min(coords.width, coords.height) / 38));

            const pill = `<button type="button" class="btn btn-danger position-absolute top-0 start-100 translate-middle text-center delete-bbox-button" style="font-size:${relativeMeasurement}rem; padding: 0.5% 1%" id="delete_bbox_${maxBboxId + 1}">
                    <i class="bi bi-x-lg"></i>
                    </button>`;

            bbox.insertAdjacentHTML('beforeend', pill);
            bbox.id = `bbox_${maxBboxId + 1}`;
            bbox.setAttribute("data-bs-title", `${maxBboxId}`);
            bbox.setAttribute("data-bs-toggle", "popover");
            bbox.setAttribute("data-bs-placement", "top");
            bbox.setAttribute("data-bs-content", `${annotations[idx][0]}`);
            bbox.setAttribute("data-bs-trigger", "hover");
            maxBboxId += 1;

            bbox.setAttribute("bbox", `${JSON.stringify(annotations[idx][1])}`);

            if (activate) {
                bbox.classList.add("bbox", "selectedbbox");
                bbox.style.backgroundColor = activationColor;
            } else {
                bbox.classList.add("bbox", "inactivebbox");
                bbox.style.backgroundColor = '';
            }
            bbox.style.left = coords.left + "px";
            bbox.style.top = coords.top + "px";
            bbox.style.width = coords.width + "px";
            bbox.style.height = coords.height + "px";

            bbox.addEventListener('click', handleSelectBbox);
            bbox.addEventListener('contextmenu', handleDeselectBbox);
            bbox.addEventListener('mouseover', handleBboxHover);
            bbox.addEventListener('mouseout', handleBboxNotHover);

            img_container.appendChild(bbox);

            new bootstrap.Popover(bbox);

            document.getElementById("delete_bbox_" + maxBboxId)?.addEventListener('click', deleteParagraph);
        }

    } catch (ex) {
        console.log("Error while annotating img:\n", "annotations: ", annotations, "activation: ", activate, " ", activationColor, "\n", ex);
        alert("Error while annotating img:\n" + ex);
    }

    img_position = imgToBeAnnotated.getBoundingClientRect();
};

const clearImageBBoxes = () => {
    maxBboxId = 0;
    idSet.clear();
    while (img_container.childElementCount > 3) {
        img_container.lastElementChild.remove();
    }
};

const handleImgUpload = (e) => {
    clearImageBBoxes();
    resetAnnotationData();
    const img = document.getElementById("img");
    const spinner = document.getElementById("spinner");
    img.classList.add("hide");
    spinner.classList.remove("hide");

    const files = e.target.files;

    let img_file = null;
    let annotations_file = null;

    if (files.length < 1 || files.length > 2) {
        img.classList.remove("hide");
        spinner.classList.add("hide");
        alert("Please upload an image and an optional annotations file");
        return;
    }


    const file_1_format = files[0].name.substring(files[0].name.lastIndexOf('.')).toLowerCase();
    if (files.length === 2) {
        const file_2_format = files[1].name.substring(files[1].name.lastIndexOf('.')).toLowerCase();
        if (file_1_format === JSON_FORMAT && IMG_FORMATS.has(file_2_format)) {
            img_file = files[1];
            annotations_file = files[0];
        } else if (file_2_format === JSON_FORMAT && IMG_FORMATS.has(file_1_format)) {
            img_file = files[0];
            annotations_file = files[1];
        } else {
            img.classList.remove("hide");
            spinner.classList.add("hide");
            alert("Please upload an image and an optional annotations file");
            return;
        }
    } else {
        if (!IMG_FORMATS.has(file_1_format)) {
            img.classList.remove("hide");
            spinner.classList.add("hide");
            alert("Please upload an image and an optional annotations file");
            return;
        } else {
            img_file = files[0];
        }
    }

    console.log("img_file: ", img_file, "annotations_file: ", annotations_file);

    const file = img_file;
    let fileReader = new FileReader();
    fileReader.onload = function (f) {
        img.setAttribute("src", f.target.result);
        img.classList.remove("hide");
        spinner.classList.add("hide");

        img.addEventListener("mousedown", handleDragStart);
        img_container.addEventListener("mousemove", handleDragMove);
        img.addEventListener("mouseup", handleDragEnd);
        img.addEventListener("dragover", handleDefaultDragOver);

        if (annotations_file !== null) {
            console.log("Loading annotations");
            handleAnnotationsUpload(e);
        }
    };
    fileReader.readAsDataURL(file);
};

const img_container = document.getElementById("img_container");
const img_upload = document.getElementById("img_upload");
const key_value_tab = document.getElementById("key_value_tab");
const fields_to_be_annotated = document.getElementsByClassName("field_to_be_annotated");
const navbarHeight = document.getElementById("navbar").getBoundingClientRect().height;
const img_container_margin = parseInt(getComputedStyle(img_container).margin);
const dragRect = document.getElementById("dragRect");
const standardKeyOptionsList = document.getElementById("standardKeyOptionsList");
const IMG_FORMATS = new Set([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tiff", ".svg"]);
const JSON_FORMAT = ".json";

let currentSelectedField = null;
let img_position = null;
let dragCursorStartX = 0;
let dragCursorStartY = 0;
let isDragging = false;
let standardKeyOptions = [];
let maxBboxId = 0;
let drawArrows = false;
let idSet = new Set();

img_upload.onchange = handleImgUpload;
key_value_tab.onkeydown = changeFocusOnArrowKey;

for (let idx = 0; idx < standardKeyOptionsList.options.length; idx++) {
    standardKeyOptions.push(standardKeyOptionsList.options[idx].value);
}

Array.from(document.getElementsByClassName("standard-key-dropdown")).forEach(function (element) {
    element.addEventListener('change', handleChangeInStandardKey);
});

Array.from(fields_to_be_annotated).forEach(function (element) {
    element.addEventListener('focus', handleSelectField);
});



export { annotateImgBboxes, annotateImgWordBboxes, clearImageBBoxes, handleChangeInStandardKey, handleSelectField, standardKeyOptions, updateDrawArrows, deleteIds };
