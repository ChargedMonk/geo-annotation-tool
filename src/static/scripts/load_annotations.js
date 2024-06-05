import { annotateImgBboxes, annotateImgWordBboxes, clearImageBBoxes, standardKeyOptions, updateDrawArrows } from "./common.js";
import { handleAddKeyValue, handleDeleteKeyValue } from "./link_annotation.js";

const resetAnnotationData = () => {
    word_list = null;
    word_boxes_list = null;
    original_paragraphs = null;
    paragraphs = null;
};

const addNewParagraph = (paragraph_word_ids, paragraph_bbox) => {
    try {
        const paragraph = new ParagraphObject(paragraphs.length, "MISC", paragraph_word_ids, paragraph_bbox, [], "", false, "ADDED");
        paragraphs.push(paragraph);
    } catch (ex) {
        console.log("Error while adding new paragraph: ", ex);
        console.log("paragraph_word_ids: ", paragraph_word_ids);
        console.log("paragraph_bbox: ", paragraph_bbox);
        console.log("paragraphs:\n", paragraphs);
        alert("Error while adding new paragraph:\n" + ex);
    }
};

const deselectParagraph = (paragraph_idx_list, paragraph_to_deselect_idx) => {
    try {
        console.log("paragraph_idx_list: ", paragraph_idx_list);
        console.log("paragraph_to_deselect_idx: ", paragraph_to_deselect_idx);
        for (let paragraph_idx of paragraph_idx_list) {
            console.log("paragraph_idx: ", paragraph_idx);
            if (paragraphs[parseInt(paragraph_idx)].linking.includes(parseInt(paragraph_to_deselect_idx))) {
                paragraphs[parseInt(paragraph_idx)].linking = paragraphs[parseInt(paragraph_idx)].linking.filter(ele => ele !== parseInt(paragraph_to_deselect_idx));
            }
        }
    } catch (ex) {
        console.log("Error while deselecting paragraph: ", ex);
        console.log("paragraph_idx: ", paragraph_idx);
        console.log("paragraph_to_deselect_idx: ", paragraph_to_deselect_idx);
        console.log("paragraphs:\n", paragraphs);
        alert("Error while deselecting paragraph:\n" + ex);
    }
}

const deleteParagraph = (e) => {
    try {
        let currentParagraph = null;
        let deleteBtn = null;
        if (e.target.tagName === "BUTTON") {
            currentParagraph = e.target.parentElement;
            deleteBtn = e.target;
        } else {
            currentParagraph = e.target.parentElement.parentElement;
            deleteBtn = e.target.parentElement;
        }

        if (currentParagraph.getAttribute('data-bs-title') === undefined || currentParagraph.getAttribute('data-bs-title') === null || isNaN(currentParagraph.getAttribute('data-bs-title'))) {
            console.log("Failed to delete paragraph: Invalid paragraph index - ", currentParagraph);
            alert("Failed to delete paragraph: Invalid paragraph index");
        }

        const currentParagraphIndex = currentParagraph.getAttribute('data-bs-title');

        const keyValueFields = document.getElementsByClassName("key_value");
        for (let keyValueField of keyValueFields) {
            const key = keyValueField.children[3].firstElementChild;
            const value = keyValueField.children[4].firstElementChild;

            key.value = key.value.split(", ").filter(ele => ele !== currentParagraphIndex).join(", ");
            value.value = value.value.split(", ").filter(ele => ele !== currentParagraphIndex).join(", ");
        }
        paragraphs[parseInt(currentParagraphIndex)].status = "DELETED";
        Array.from(document.getElementsByClassName("leader-line")).forEach(function (element) {
            if (element.classList.length === 1) {
                element.remove();
            }
        });

        Array.from(document.getElementsByClassName("popover")).forEach(function (element) {
            element.remove();
        });


        currentParagraph.remove();
        deleteBtn.remove();
    } catch (ex) {
        console.log("Error while deleting paragraph: ", ex);
        console.log("e: ", e);
        console.log("paragraphs:\n", paragraphs);
        alert("Error while deleting paragraph:\n" + ex);
    }

}

const updateParagraphData = () => {
    const keyValueFields = document.getElementsByClassName("key_value");

    for (let keyValueField of keyValueFields) {
        const standardKey = keyValueField.children[1].firstElementChild;
        const isHeader = keyValueField.children[2].firstElementChild;
        const lineItemNo = keyValueField.children[3].firstElementChild;
        const key = keyValueField.children[4].firstElementChild;
        const value = keyValueField.children[5].firstElementChild;

        if (standardKey.classList.contains("invalid-input") && key.value !== undefined && key.value !== null && key.value !== "") {
            throw new Error(`Please select a valid standard key for the field: "${key.value}"`);
        }
        try {

            key.value?.split(", ")
                .filter(ele => (ele !== null && !isNaN(ele) && !ele.includes(".") && !ele.includes("-") && ele.replaceAll(" ", "") !== ""))
                .forEach(function (key_element) {
                    try {
                        if (standardKey.value === null || standardKey.value === undefined || standardKey.value.replaceAll(" ", "") === "") {
                            paragraphs[parseInt(key_element)].standardKey = "MISC";
                        } else {
                            paragraphs[parseInt(key_element)].standardKey = standardKey.value;
                        }
                        paragraphs[parseInt(key_element)].line_num = lineItemNo.value || "";
                        paragraphs[parseInt(key_element)].isHeader = isHeader.checked || false;

                        value.value?.split(", ")
                            .filter(ele => (!isNaN(ele) && !ele.includes(".") && !ele.includes("-")))
                            .forEach(function (value_element) {
                                try {
                                    if (value_element === null || value_element === undefined || value_element.replaceAll(" ", "") === "") {
                                        paragraphs[parseInt(key_element)].linking = [];
                                    } else {
                                        if (!paragraphs[parseInt(key_element)].linking.includes(parseInt(value_element))) {
                                            paragraphs[parseInt(key_element)].linking.push(parseInt(value_element));
                                        }
                                    }
                                } catch (ex) {
                                    console.log("Error while updating linking data: ", ex);
                                    console.log("key_element: ", key_element);
                                    console.log("value_element: ", value_element);
                                    console.log("paragraphs:\n", paragraphs);
                                    alert("Error while updating linking data:\n" + ex);
                                }
                            });
                    } catch (ex) {
                        console.log("Error while updating linking data: ", ex);
                        console.log("key_element: ", key_element);
                        console.log("paragraphs:\n", paragraphs);
                        alert("Error while updating linking data:\n" + ex);
                    }
                });
        } catch (ex) {
            console.log("Error while updating paragraph data: ", ex);
            console.log("paragraphs:\n", paragraphs);
            alert("Error while updating paragraph data:\n" + ex);
        }

    }
};

const loadKeyValueData = (keyValueData) => {
    console.log("keyValueData = ", keyValueData);
    const keyValues = document.getElementsByClassName("key_value");
    const currentKeyValueNum = keyValues.length;
    let validLinkingsLength = 0;

    for (let idx = 0; idx < keyValueData.length; idx++) {
        if ('linking' in keyValueData[idx] &&
            keyValueData[idx].linking !== undefined &&
            keyValueData[idx].linking !== null &&
            keyValueData[idx].linking.length > 0) {
            validLinkingsLength += 1;
        }
    }

    if (currentKeyValueNum < validLinkingsLength) {
        for (let idx = 0; idx < (validLinkingsLength - currentKeyValueNum); idx++) {
            handleAddKeyValue({ "target": keyValues[keyValues.length - 1].lastElementChild.firstElementChild });
        }
    } else {
        for (let idx = 0; idx < (currentKeyValueNum - validLinkingsLength); idx++) {
            handleDeleteKeyValue({ "target": keyValues[keyValues.length - 1].firstElementChild.firstElementChild });
        }
    }

    let keyValueFieldCounter = 0;

    for (let idx = 0; idx < keyValueData.length; idx++) {
        try {
            if ("linking" in keyValueData[idx] &&
                keyValueData[idx].linking !== null &&
                keyValueData[idx].linking !== undefined &&
                keyValueData[idx].linking.length > 0 &&
                (
                    ("status" in keyValueData[idx] && keyValueData[idx].status !== "DELETED") ||
                    !("status" in keyValueData[idx])
                )) {
                const standard_key = keyValues[keyValueFieldCounter].children[1].firstElementChild;
                const isHeader = keyValues[keyValueFieldCounter].children[2].firstElementChild;
                const lineItemNo = keyValues[keyValueFieldCounter].children[3].firstElementChild;
                const key = keyValues[keyValueFieldCounter].children[4].firstElementChild;
                const value = keyValues[keyValueFieldCounter].children[5].firstElementChild;

                if ("standardKey" in keyValueData[idx] &&
                    keyValueData[idx].standardKey !== null
                    && keyValueData[idx].standardKey !== undefined) {
                    standard_key.value = keyValueData[idx].standardKey;
                    if (standardKeyOptions.includes(standard_key.value)) {
                        standard_key.classList.remove("invalid-input");
                        standard_key.classList.add("valid-input");
                    }
                } else {
                    standard_key.value = "";
                    standard_key.classList.remove("valid-input");
                    standard_key.classList.add("invalid-input");
                }

                if ("line_num" in keyValueData[idx] && keyValueData[idx].line_num !== null && keyValueData[idx].line_num !== undefined) {
                    lineItemNo.value = keyValueData[idx].line_num;
                }

                console.log("isHeader.checked: ", keyValueData[idx].isHeader, "->", isHeader.checked);
                isHeader.checked = keyValueData[idx].isHeader;

                try {
                    key.dispatchEvent(new Event('focus'));
                    document.getElementById(`bbox_${idx + 1}`)?.dispatchEvent(new Event('click'));
                } catch (ex) {
                    console.log(`Error in loading key value: [${idx}]`, ex);
                    console.log("keyValueData[idx].key: ", keyValueData[idx].key);
                    alert("Error in loading key value:\n" + ex);
                }

                for (let linking of keyValueData[idx].linking) {
                    try {
                        value.dispatchEvent(new Event('focus'));
                        document.getElementById(`bbox_${linking + 1}`)?.dispatchEvent(new Event('click'));
                    } catch (ex) {
                        console.log(`Error in loading key value: [${idx}]`, ex);
                        console.log("keyValueData[idx].linking: ", linking);
                        alert("Error in loading key value:\n" + ex);
                    }
                }
                keyValueFieldCounter += 1;
            }
        } catch (e) {
            console.log("Error in loading key value: ", e);
            console.log("keyValueData[idx]: ", keyValueData[idx]);
            alert("Error in loading key value:\n" + e);
        }
    }

};

const handleSaveBtn = (e) => {
    try {
        updateParagraphData();
        const result = {
            "filename": anno_filename,
            "word_list": word_list,
            "word_boxes_list": word_boxes_list,
            "paragraphs": original_paragraphs,
            "updated_paragraphs": paragraphs,
        };
        console.log(JSON.stringify(result));
        const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
        const link = document.createElement("a");

        link.download = anno_filename;
        link.href = window.URL.createObjectURL(blob);
        link.dataset.downloadurl = ["application/json", link.download, link.href].join(":");

        const evt = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true,
        });

        link.dispatchEvent(evt);
        link.remove();
    } catch (ex) {
        console.log("Error while saving: ", ex);
        console.log("filename: ", anno_filename);
        console.log("word_list: ", word_list);
        console.log("word_boxes_list: ", word_boxes_list);
        console.log("original_paragraphs:\n", original_paragraphs);
        console.log("paragraphs:\n", paragraphs);
        alert("Error while saving:\n" + ex);
    }
};

const handleAnnotationsUpload = (e) => {
    try {

        spinner.classList.remove("hide");

        const files = e.target.files;
        if (files.length < 1 || files.length > 2) {
            spinner.classList.add("hide");
            alert("Please upload an image and an annotations file");
            return;
        }
        let annotations_file = null;
        if (files[0].name.toLowerCase().endsWith(".json")) {
            annotations_file = files[0];
        } else if (files.length === 2 && files[1].name.toLowerCase().endsWith(".json")) {
            annotations_file = files[1];
        }
        if (annotations_file === null) {
            spinner.classList.add("hide");
            alert("Please upload an image and an annotations file");
            return;
        }

        anno_filename = annotations_file.name;
        console.log("Annotations file: ", anno_filename);
        const file = annotations_file;
        const fileReader = new FileReader();
        fileReader.onload = function (f) {
            const content = JSON.parse(f.target.result);
            console.log(content);
            if ("word_list" in content &&
                content.word_list !== null &&
                content.word_list !== undefined &&
                content.word_list.length > 0 &&
                "word_boxes_list" in content &&
                content.word_boxes_list !== null &&
                content.word_boxes_list !== undefined &&
                content.word_boxes_list.length > 0 &&
                content.word_boxes_list.length === content.word_list.length) {
                clearImageBBoxes();
                resetAnnotationData();
                const ocrData = [];
                const paragraphData = []
                const paragraphsToDelete = [];

                word_list = content.word_list;
                word_boxes_list = content.word_boxes_list;

                for (let i = 0; i < content.word_list.length; i++) {
                    const word = content.word_list[i];
                    const bbox = content.word_boxes_list[i];
                    ocrData.push([word, bbox]);
                }

                annotateImgWordBboxes(document.getElementById("img"),
                    ocrData,
                    false,
                    'rgba(255, 255, 255, 0)')
                    .then(() => {
                        if ("updated_paragraphs" in content && content.updated_paragraphs !== null && content.updated_paragraphs !== undefined && content.updated_paragraphs.length > 0) {
                            original_paragraphs = content.paragraphs || content.updated_paragraphs;
                            paragraphs = content.updated_paragraphs;
                            for (let i = 0; i < content.updated_paragraphs.length; i++) {
                                const bbox = content.updated_paragraphs[i].bbox;
                                let paragraph_content = "";
                                content.updated_paragraphs[i].word_ids.forEach((word_id) => {
                                    paragraph_content += `${content.word_list[word_id]} `;
                                });
                                paragraphData.push([paragraph_content.trim(), bbox]);
                                if ('status' in content.updated_paragraphs[i] &&
                                    content.updated_paragraphs[i].status === "DELETED") {
                                    paragraphsToDelete.push(`delete_bbox_${i + 1}`);
                                }
                            }
                        } else if ("paragraphs" in content && content.paragraphs !== null && content.paragraphs !== undefined && content.paragraphs.length > 0) {
                            original_paragraphs = content.paragraphs;
                            paragraphs = content.paragraphs;
                            for (let i = 0; i < content.paragraphs.length; i++) {
                                const bbox = content.paragraphs[i].bbox;
                                let paragraph_content = "";
                                content.paragraphs[i].word_ids.forEach((word_id) => {
                                    paragraph_content += `${content.word_list[word_id]} `;
                                });
                                paragraphData.push([paragraph_content.trim(), bbox]);
                                if ('status' in content.paragraphs[i] &&
                                    content.paragraphs[i].status === "DELETED") {
                                    paragraphsToDelete.push(`delete_bbox_${i + 1}`);
                                }
                            }
                        } else {
                            original_paragraphs = [];
                            paragraphs = [];
                        }
                    }).then(() => {
                        annotateImgBboxes(document.getElementById("img"),
                            paragraphData,
                            false,
                            'rgba(255, 255, 255, 0)')
                            .then(() => {
                                console.log("paragraphs to delete: ", paragraphsToDelete);
                                for (let paragraphToDelete of paragraphsToDelete) {
                                    document.getElementById(paragraphToDelete).dispatchEvent(new Event('click'));
                                }
                            }).then(() => {
                                console.log("Image annotated with ocr data");
                                if (paragraphs && paragraphs.length > 0) {
                                    updateDrawArrows(false);
                                    loadKeyValueData(paragraphs);
                                    updateDrawArrows(true);
                                }
                                spinner.classList.add("hide");
                            }).catch((e) => {
                                console.log("Error while annotating image with ocr data: ", e);
                                spinner.classList.add("hide");
                                alert("Error while annotating image with ocr data:\n" + e);
                            });
                    }).catch((e) => {
                        console.log("Error while annotating image with ocr data: ", e);
                        spinner.classList.add("hide");
                        alert("Error while annotating image with ocr data:\n" + e);
                    });
            } else {
                console.log("No ocr data found in annotations file");
                spinner.classList.add("hide");
                alert("No ocr data found in annotations file");
            }
        };
        fileReader.readAsText(file);
    } catch (ex) {
        console.log("Error while loading annotations: ", ex);
        spinner.classList.add("hide");
        alert("Error while annotations:\n" + ex);
    }

};


class ParagraphObject {
    constructor(idx, standardKey, word_ids, bbox, linking, line_num, isHeader, status) {
        this.idx = idx;
        this.standardKey = standardKey;
        this.word_ids = word_ids;
        this.bbox = bbox;
        this.linking = linking;
        this.line_num = line_num;
        this.isHeader = isHeader;
        this.status = status;
    }
}

const annotations_upload = document.getElementById("annotations_upload");
const spinner = document.getElementById("spinner");
const save_btn = document.getElementById("save_btn");

annotations_upload.onchange = handleAnnotationsUpload;
save_btn.onclick = handleSaveBtn;

let anno_filename = null;
let word_list = null;
let word_boxes_list = null;
let original_paragraphs = null;
let paragraphs = null;

export { handleAnnotationsUpload, resetAnnotationData, addNewParagraph, deleteParagraph, deselectParagraph };
