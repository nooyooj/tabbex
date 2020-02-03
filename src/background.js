let contextMenus = {};

contextMenus.menuString = getContextMenu();

chrome.contextMenus.onClicked.addListener(contextMenuHandler);

/**
 * Create context menu that will appear when browser extension is open.
 * 
 * @return  {String}    Context menu title
 */
function getContextMenu() {
    const contextMenu = {
        "title": "Tabbex",
    }

    return chrome.contextMenus.create(contextMenu, () => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
        }
    })
}

/**
 * Check if extension is clicked and pass information of the page.
 * 
 * @param   {object}    info    Information of current page
 * @param   {Tab}       tab     Information of current tab
 */
function contextMenuHandler(info, tab) {
    if (info.menuItemId === contextMenus.menuString) {
        // if clicked menu item matches with created menu string ...
    }
};