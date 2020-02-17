let urlList = [];

let dragElement = null;
let startIndex = -1;
let enterIndex = -1;

let ul = document.getElementById("list-url");

document.addEventListener('DOMContentLoaded', () => {
    const version = chrome.runtime.getManifest().version;
    document.getElementById("version").innerHTML = `v${version}`;
    
    getUrlsFromStorage();
    
    document.getElementById('save').addEventListener('click', onUrlSaved);
    document.getElementById('open').addEventListener('click', onOpenClicked);
    document.getElementById('rearrange').addEventListener('click', onRearrangeClicked);
});

/**
 * Add url to list on save button clicked.
 */
function onUrlSaved() {
    const newUrl = document.getElementById("input").value;
    urlList.push(newUrl);
    addUrlToList(newUrl);
    chrome.storage.sync.set({
        'urls': urlList
    })
    resetDeleteHandler();
}

/**
 * Open tabs that are in the url list at the same time.
 */
function onOpenClicked() {
    const port = chrome.extension.connect({
        name: "Communication Popup"
    });

    port.postMessage("open");
}

/**
 * Update elements to make the list draggable.
 */
function onRearrangeClicked() {
    enableRearrange();

    const element = createElement('input', 'input-button', 'rearrange-done', 'Done', 'submit');

    appendElement('rearrange-wrapper', element)
    removeElement('rearrange-wrapper', 'rearrange');

    element.addEventListener('click', onRearrangeDoneClicked);
}

/**
 * After rearranging the list, update elements to make the list undraggable
 */
function onRearrangeDoneClicked() {
    disableRearrange();

    let element = createElement('input', 'input-button', 'rearrange', 'Rearrange', 'submit');

    appendElement('rearrange-wrapper', element)
    removeElement('rearrange-wrapper', 'rearrange-done');

    element.addEventListener('click', onRearrangeClicked);
}

/**
 * Make the list draggable
 */
function enableRearrange() {
    for(let i = 0; i < ul.children.length; i++) {
        ul.children[i].draggable = true;
        ul.children[i].classList.remove('list-group-item');
        ul.children[i].classList.add('rearrange-enabled');
    }

    [].forEach.call(ul.children, dragHandlers);
}

/**
 * Make the list undraggable
 */
function disableRearrange() {
    for(let i = 0; i < ul.children.length; i++) {
        ul.children[i].draggable = false;
        ul.children[i].classList.remove('rearrange-enabled');
        ul.children[i].classList.remove('drag-element');
        ul.children[i].classList.add('list-group-item');
    }
}

function handleDragStart(e) {
    this.classList.add('dragged-element');

    dragElement = e.target;
  
    for(let i = 0; i < ul.children.length; i++) {
        if(dragElement === ul.children[i]) {
            startIndex = i;
        }
    }
}

function handleDragEnter(e) {
    e.target.classList.add('entered');

    for(let i = 0; i < ul.children.length; i++) {
        if(e.target === ul.children[i] && i !== startIndex) {
            enterIndex = i;
        }
    }    
}

function handleDragLeave(e) {
    e.target.classList.remove('entered');
}

function handleDragEnd() {
    this.classList.remove('dragged-element');
    insertNode(startIndex, enterIndex);
}

function move(arr, startIndex, enterIndex) {
    while (startIndex < 0) {
        startIndex += arr.length;
    }

    while (enterIndex < 0) {
        enterIndex += arr.length;
    }

    if (enterIndex >= arr.length) {
        var k = enterIndex - arr.length;
        while ((k--) + 1) {
            arr.push(undefined);
        }
    }

    arr.splice(enterIndex, 0, arr.splice(startIndex, 1)[0]);  

    return arr;
}

function insertNode(startIndex, enterIndex) {
    let node = ul.children[startIndex];

    ul.insertBefore(node, ul.childNodes[enterIndex]);

    move(urlList, startIndex, enterIndex);

    resetDeleteHandler();

    chrome.storage.sync.set({
        'urls': urlList
    });
}

function dragHandlers(e) {
    e.addEventListener('dragstart', handleDragStart, false);
    e.addEventListener('dragenter', handleDragEnter, false)
    e.addEventListener('dragleave', handleDragLeave, false);
    e.addEventListener('dragend', handleDragEnd, false);
}

/**
 * Retrieve url list from storage.
 */
function getUrlsFromStorage() {
    chrome.storage.sync.get(['urls'], res => {
        if (!res) {
            return;
        }

        if (res.urls && res.urls.length > 0) {
            urlList = res.urls;
        }

        urlList.forEach(url => {
            addUrlToList(url);
        })
    });
}

/**
 * Create an element for each row of url list and add click event for the row.
 * 
 * @param   {string}        value   String value from the input
 */
function addUrlToList(value) {
    document.getElementById("input").value = "";

    let li = document.createElement("li");
    li.className = 'list-group-item';

    let inputElement = document.createElement("input");
    inputElement.className = 'url-title';
    inputElement.disabled = true;
    inputElement.value = value;

    li.appendChild(inputElement);

    if (value !== '') {
        ul.appendChild(li);
    }

    let span = document.createElement("span");
    let deleteText = document.createTextNode("\u00D7");

    span.className = "delete-button";
    span.appendChild(deleteText);

    li.appendChild(span);

    resetDeleteHandler();
}

function createElement(tag, className, id, value, type) {
    const element = document.createElement(tag);
    element.className = className;
    element.id = id;
    element.value = value;
    element.type = type;

    return element;
}

function appendElement(parentId, child) {
    let parent = document.getElementById(parentId);
    parent.appendChild(child);
}

function removeElement(parentId, childId) {
    let parent = document.getElementById(parentId);
    let child = document.getElementById(childId);

    parent.removeChild(child);
}

/**
 * Remove item in the list.
 * 
 * @param   {number}    index   Index of the item in the list
 */
function removeItem(index) {
    chrome.storage.sync.get(['urls'], result => {
        urlList = result.urls;
        urlList.splice(index, 1);
        chrome.storage.sync.set({
            'urls': urlList
        });

        resetDeleteHandler();
    })
}

function resetDeleteHandler() {
    for(let i = 0; i < ul.children.length; i++) {
        ul.children[i].childNodes[1].onclick = () => {
            return false;
        }
    }

    for (let i = 0; i < ul.children.length; i++) {
        ul.children[i].childNodes[1].onclick = () => {
            const index = urlList.findIndex(item => item === ul.children[i].firstChild.value);

            ul.removeChild(ul.children[i]);
            
            removeItem(index);
        }
    }
}