'use strict'
const l = console.log
const i = console.info


const MENU_ID = 'just single menu id'


let isWorking = false




chrome.runtime.onInstalled.addListener(function (details) {
  l('runtime.onInstalled()', details)

  init()
})




chrome.runtime.onStartup.addListener(function () {
  l('runtime.onStartup()')

  init()
})




function init() {
  l('init()')

  chrome.contextMenus.create({
    title: 'Move tab to beginning',
    contexts: [ 'page' ],
    id: MENU_ID,
  })
}




chrome.browserAction.onClicked.addListener(function (tab) {
  l('browserAction.onClicked()', tab)

  moveAndActivate(tab)
})




chrome.contextMenus.onClicked.addListener(function (info, tab) {
  l('contextMenus.onClicked()', info, tab)

  moveAndActivate(tab)
})




function moveAndActivate(tab) {
  l('moveAndActivate()')
  console.group()
  console.time()

  isWorking = true
  activateNextTab(tab.index)
  // move active tab to beginning of window
  chrome.tabs.move(tab.id, { index: 0 }, function (tabs) {
    l('tabs.move()', tabs)
  })
}




// If current tab is not last tab, activate tab next to it.
// If current tab is last tab, activate tab previous to it.
function activateNextTab(tabIndex) {
  l('activateNextTab()', tabIndex)

  // try to get next tab
  chrome.tabs.query({ currentWindow: true, index: tabIndex + 1 }, function ([nextTab]) {
    l('next tabs.query()', nextTab)

    if (nextTab === undefined) {
      i('last tab')

      // next tab absent - activate previous tab
      prevTabPromise.then(prevTabId => makeTabActive(prevTabId))
      return
    }

    i('not last tab')
    // next tab exists - activate it
    makeTabActive(nextTab.id)
  })

  // get previous tab
  const prevTabPromise = new Promise(function (resolve) {
    chrome.tabs.query({ currentWindow: true, index: tabIndex - 1 }, function ([tab]) {
      l('prev tabs.query()', tab)
      
      resolve(tab.id)
    })
  })
}




function makeTabActive(tabId) {
  l('makeTabActive()', tabId)

  chrome.tabs.update(tabId, { active: true }, function (tabs) {
    l('tabs.update()', tabs)
    isWorking = false
    console.timeEnd()
    console.groupEnd()
  })
}




// disable functionality for first tab
chrome.tabs.onActivated.addListener(function (activeInfo) {
  l('chrome.tabs.onActivated()', activeInfo)

  if (isWorking) {
    i('is working')
    return
  }

  chrome.tabs.query({ currentWindow: true, active: true }, function ([ tab ]) {
    l('tabs.query()', tab)

    toggleUi(tab.index)
  })
})




// disable functionality for first tab
chrome.tabs.onMoved.addListener(function (tabId, moveInfo) {
  l('tabs.onMoved()', tabId, moveInfo)

  if (isWorking) {
    i('is working')
    return
  }

  toggleUi(moveInfo.toIndex)
})




function toggleUi(tabIndex) {
  l('toggleUi()', tabIndex)

  const isFirstTab = tabIndex === 0
  if (isFirstTab) {
    chrome.browserAction.disable()
  }
  else {
    chrome.browserAction.enable()
  }
  chrome.contextMenus.update(MENU_ID, { enabled: !isFirstTab })
}
