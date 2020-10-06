const wcroute = document.querySelector("wc-route[path='/study/python/common-extra']")

wcroute.addEventListener("load", async ({detail}) => {
  const urlParams = new URLSearchParams(window.location.search);
  const pageFile = urlParams.get('pageFile');
  console.log(pageFile);
  if(!pageFile) throw Error("no pageFile specified in queryParam !")
  await detail.waitForContent()
  const content = detail.wcroute.querySelector(".content")
  const resp = await fetch(location.origin + `/content/study/python/${pageFile}`);
  const text = await resp.text()
  content.innerHTML = text;
})
