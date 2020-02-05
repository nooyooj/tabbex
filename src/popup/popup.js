
let urlList = new Array();

document.addEventListener('DOMContentLoaded', () => {
    getUrlsFromStorage();
    document.getElementById('save').addEventListener('click', onUrlSaved);
});

function onUrlSaved() {
    const newUrl = document.getElementById("input").value;
    urlList.push(newUrl);
    addUrlToList(newUrl);
    chrome.storage.sync.set({
        'urls': urlList
    })
}

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

function addUrlToList(value) {
    document.getElementById("input").value = "";
    const ul = document.getElementById("list-url");
    addList(ul, value);
}

function addList(ul, value) {
    const li = document.createElement("li");
    li.className = 'list-group-item';
    li.appendChild(document.createTextNode(value));
    if (value !== '') {
        ul.appendChild(li);
    }
    const span = document.createElement("span");
    const deleteText = document.createTextNode("\u00D7");
    span.className = "delete-button";
    span.appendChild(deleteText);
    li.appendChild(span);
    for (let i = 0; i < ul.children.length; i++) {
        (index => {
            ul.children[index].childNodes[1].onclick = () => {
                const newIndex = urlList.findIndex(item => item === ul.children[index].firstChild.textContent.toString());
                ul.children[index].style.display = "none";
                removeItem(newIndex);
            }
        })(i);
    }
}

function removeItem(index) {
    chrome.storage.sync.get(['urls'], result => {
        urlList = result.urls;
        urlList.splice(index, 1);
        chrome.storage.sync.set({
            'urls': urlList
        })
    })
}