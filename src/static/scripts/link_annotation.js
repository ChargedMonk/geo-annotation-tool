import { handleChangeInStandardKey, handleSelectField, deleteIds } from "./common.js";
import { unlinkParagraph } from "./load_annotations.js";

const handleDeleteKeyValue = (e) => {
    let currentKeyValueRow = null;
    if (e.target.tagName === "BUTTON") {
        currentKeyValueRow = e.target.parentElement.parentElement;
    } else {
        currentKeyValueRow = e.target.parentElement.parentElement.parentElement;
    }

    if (currentKeyValueRow.parentElement.childElementCount > 1) {
        try {
            if (currentKeyValueRow.children[4].firstElementChild.value !== undefined && currentKeyValueRow.children[4].firstElementChild.value !== null && currentKeyValueRow.children[4].firstElementChild.value !== "") {
                unlinkParagraph(currentKeyValueRow.children[4].firstElementChild.value.split(", "));
                deleteIds(currentKeyValueRow.children[4].firstElementChild.value.split(", "));
            }
            if (currentKeyValueRow.children[5].firstElementChild.value !== undefined && currentKeyValueRow.children[5].firstElementChild.value !== null && currentKeyValueRow.children[5].firstElementChild.value !== "") {
                 unlinkParagraph(currentKeyValueRow.children[5].firstElementChild.value.split(", "));
                deleteIds(currentKeyValueRow.children[5].firstElementChild.value.split(", "));
            }
        } catch (error) {
            console.error("Error in unlinking or deleting ids", error);
        }
        currentKeyValueRow.remove();
    }
};

const handleAddKeyValue = (e) => {
    const uuid = crypto.randomUUID();
    const key_value_row = `<div class="row m-1 gy-1 gx-1 key_value d-flex justify-content-evenly">
                            <div class="col-1 p-0">
                                <button type="button" class="btn delete_key_value_btn"><i class="bi bi-trash"></i></button>
                            </div>
                            <div class="col-1 flex-grow-1">
                                <input class="form-control standard-key-dropdown valid-input" list="standardKeyOptionsList"
                                    placeholder="MISC" aria-label="Standard Key">
                            </div>
                            <div class="col-1 d-flex justify-content-center flex-grow-1">
                                <input type="checkbox" class="btn-check" id="btn-check-outlined_${uuid}" autocomplete="off">
                                <label class="btn btn-outline-primary" for="btn-check-outlined_${uuid}">Header</label><br>
                            </div>
                            <div class="col-1 flex-grow-1">
                                <input type="text" class="form-control" placeholder="LI No."
                                aria-label="Belongs to which line item row">
                            </div>
                            <div class="col-1 flex-grow-1">
                                <input type="text" class="form-control field_to_be_annotated key"
                                    placeholder="Key" aria-label="Key">
                            </div>
                            <div class="col-2 flex-grow-1">
                                <input type="text" class="form-control  field_to_be_annotated value" placeholder="Value"
                                    aria-label="Value">
                            </div>
                            <div class="col-1 p-0">
                                <button type="button" class="btn add_key_value_btn"><i class="bi bi-plus-lg"></i></button>
                            </div>
                        </div>`;
    let currentKeyValueRow = null;
    if (e.target.tagName === "BUTTON") {
        currentKeyValueRow = e.target.parentElement.parentElement;
    } else {
        currentKeyValueRow = e.target.parentElement.parentElement.parentElement;
    }

    currentKeyValueRow.insertAdjacentHTML("afterend", key_value_row);
    // Adding delete event listener to delete button
    currentKeyValueRow.nextElementSibling.firstElementChild.firstElementChild.addEventListener('click', handleDeleteKeyValue);
    // Adding add event listener to add button
    currentKeyValueRow.nextElementSibling.lastElementChild.firstElementChild.addEventListener('click', handleAddKeyValue);
    // Add focus listener for fields to be annotated
    const siblingChildren = currentKeyValueRow.nextElementSibling.children;
    for (let idx = 4; idx < siblingChildren.length - 1; idx++) {
        siblingChildren[idx].firstElementChild.addEventListener('focus', handleSelectField);
    }
    // Add change listener for standard key dropdown
    siblingChildren[1].firstElementChild.addEventListener('change', handleChangeInStandardKey);
    currentKeyValueRow.nextElementSibling.children[4].firstElementChild.dispatchEvent(new Event('focus'));
};



let delete_key_value_btns = document.getElementsByClassName("delete_key_value_btn");
let add_key_value_btns = document.getElementsByClassName("add_key_value_btn");



Array.from(delete_key_value_btns).forEach(function (element) {
    element.addEventListener('click', handleDeleteKeyValue);
});
Array.from(add_key_value_btns).forEach(function (element) {
    element.addEventListener('click', handleAddKeyValue);
});

export { handleDeleteKeyValue, handleAddKeyValue };
