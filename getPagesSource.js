function DOMtoString(document_root) {
    return document_root.body.innerHTML;
}

chrome.runtime.sendMessage({
    action: "getSource",
    source: DOMtoString(document)
});