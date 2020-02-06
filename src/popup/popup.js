let urlList = new Array();

document.addEventListener('DOMContentLoaded', () => {
    getUrlsFromStorage();
    document.getElementById('save').addEventListener('click', onUrlSaved);
    document.getElementById('open').addEventListener('click', onOpenClicked);
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
 * Open tabs that are in the url list.
 */
function onOpenClicked() {
    var port = chrome.extension.connect({
        name: "Communication Popup"
    });

    port.postMessage("open");
}

/**
 * Retrieve url list from storage.
 */
function getUrlsFromStorage() {
    chrome.storage.sync.get(['urls'], res => {
        if (!res) {
            return;
        }
        if (res.urls.length > 0) {
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