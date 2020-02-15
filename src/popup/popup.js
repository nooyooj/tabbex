let urlList = new Array();

let dragElement = null;

document.addEventListener('DOMContentLoaded', () => {
    const version = chrome.app.getDetails().version;
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
    const ul = document.getElementById("list-url");

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
    let ul = document.getElementById("list-url");

    for(let i = 0; i < ul.children.length; i++) {
        ul.children[i].draggable = false;
        ul.children[i].classList.remove('rearrange-enabled');
        ul.children[i].classList.remove('drag-element');
        ul.children[i].classList.add('list-group-item');
    }
}

function handleDragStart(e) {
    console.log('handleDragStart', e);

    dragElement = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
  
    this.classList.add('drag-element');
}

function handleDragEnter(e) {
    console.log('handleDragEnter', e);
}

function handleDragOver(e) {
    console.log('handleDragOver', e);
}

function handleDragLeave(e) {
    console.log('handleDragLeave', e);
}

function handleDrop(e) {
    console.log('handleDrop', e);
}

function handleDragEnd(e) {
    console.log('handleDragEnd', e);
}


function dragHandlers(e) {
    e.addEventListener('dragstart', handleDragStart, false);
    e.addEventListener('dragenter', handleDragEnter, false)
    e.addEventListener('dragover', handleDragOver, false);
    e.addEventListener('dragleave', handleDragLeave, false);
    e.addEventListener('drop', handleDrop, false);
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

    let ul = document.getElementById("list-url");

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

    for (let i = 0; i < ul.children.length; i++) {
        (index => {
            ul.children[index].childNodes[1].onclick = () => {
                const newIndex = urlList.findIndex(item => item === ul.children[index].firstChild.value);

                ul.children[index].style.display = "none";
                
                removeItem(newIndex);
            }
        })(i);
    }
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
        })
    })
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