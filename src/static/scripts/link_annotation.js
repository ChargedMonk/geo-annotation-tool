import { handleChangeInStandardKey, handleSelectField } from "./common.js";

const handleDeleteKeyValue = (e) => {
    let currentKeyValueRow = null;
    if (e.target.tagName === "BUTTON") {
        currentKeyValueRow = e.target.parentElement.parentElement;
    } else {
        currentKeyValueRow = e.target.parentElement.parentElement.parentElement;
    }

    if (currentKeyValueRow.parentElement.childElementCount > 1) {
        currentKeyValueRow.remove();
    }
};

const handleAddKeyValue = (e) => {
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
    for (let idx = 2; idx < siblingChildren.length - 1; idx++) {
        siblingChildren[idx].firstElementChild.addEventListener('focus', handleSelectField);
    }
    // Add change listener for standard key dropdown
    siblingChildren[1].firstElementChild.addEventListener('change', handleChangeInStandardKey);
    currentKeyValueRow.nextElementSibling.children[2].firstElementChild.dispatchEvent(new Event('focus'));
};



let delete_key_value_btns = document.getElementsByClassName("delete_key_value_btn");
let add_key_value_btns = document.getElementsByClassName("add_key_value_btn");

const key_value_row = `<div class="row m-1 gy-1 gx-1 key_value">
                            <div class="col-1 p-0">
                                <button type="button" class="btn delete_key_value_btn"><i class="bi bi-trash"></i></button>
                            </div>
                            <div class="col-3 flex-grow-1">
                                <input class="form-control standard-key-dropdown invalid-input" list="standardKeyOptionsList"
                                    placeholder="Standard Key" aria-label="Standard Key">
                            </div>
                            <div class="col-3 flex-grow-1">
                                <input type="text" class="form-control field_to_be_annotated key"
                                    placeholder="Key" aria-label="Key">
                            </div>
                            <div class="col-3 flex-grow-1">
                                <input type="text" class="form-control  field_to_be_annotated value" placeholder="Value"
                                    aria-label="Value">
                            </div>
                            <div class="col-1 p-0">
                                <button type="button" class="btn add_key_value_btn"><i class="bi bi-plus-lg"></i></button>
                            </div>
                        </div>`;



Array.from(delete_key_value_btns).forEach(function (element) {
    element.addEventListener('click', handleDeleteKeyValue);
});
Array.from(add_key_value_btns).forEach(function (element) {
    element.addEventListener('click', handleAddKeyValue);
});

export { handleDeleteKeyValue, handleAddKeyValue };